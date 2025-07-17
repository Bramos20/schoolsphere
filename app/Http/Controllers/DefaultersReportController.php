<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\Student;
use App\Models\FeeStructure;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class DefaultersReportController extends Controller
{
    public function index(School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $year = request('year', now()->year);
        $term = request('term', 'Term 1');
        $classId = request('class_id'); // optional
        $streamId = request('stream_id'); // optional

        $query = Student::with(['class', 'stream', 'user'])
            ->where('school_id', $school->id);

        if ($classId) {
            $query->where('class_id', $classId);
        }

        if ($streamId) {
            $query->where('stream_id', $streamId);
        }

        $students = $query->get();

        $data = $students->map(function ($student) use ($year, $term) {
            $fee = FeeStructure::where('class_id', $student->class_id)
                ->where('term', $term)
                ->where('year', $year)
                ->first();

            $expected = $fee ? $fee->amount : 0;

            $paid = Payment::where('student_id', $student->id)
                ->where('term', $term)
                ->where('year', $year)
                ->sum('amount');

            return [
                'student_name' => optional($student->user)->name,
                'class_name' => optional($student->class)->name,
                'stream_name' => optional($student->stream)->name,
                'expected' => $expected,
                'paid' => $paid,
                'balance' => max($expected - $paid, 0),
                'is_defaulter' => $paid < $expected,
            ];
        })->filter(fn ($item) => $item['is_defaulter']);

        return Inertia::render('SchoolAdmin/DefaultersReport', [
            'school' => $school,
            'students' => $data->values(),
            'term' => $term,
            'year' => $year,
            'class_id' => $classId,
            'stream_id' => $streamId,
            'classes' => $school->classes()->select('id', 'name')->get(), // for filters
            'streams' => $classId
                ? \App\Models\Stream::where('class_id', $classId)->select('id', 'name')->get()
                : [],
        ]);
    }

    protected function authorizeSchoolAdmin(School $school)
    {
        $user = auth()->user();

        if (!$user->hasRole('school_admin') || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized');
        }
    }

    public function exportPdf(School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $year = request('year', now()->year);
        $term = request('term', 'Term 1');
        $classId = request('class_id');
        $streamId = request('stream_id');

        // Base query with eager loading
        $query = Student::with(['class', 'stream', 'user'])
            ->where('school_id', $school->id);

        // Apply filters if present
        if ($classId) {
            $query->where('class_id', $classId);
        }

        if ($streamId) {
            $query->where('stream_id', $streamId);
        }

        $students = $query->get();

        $data = $students->map(function ($student) use ($year, $term) {
            $fee = FeeStructure::where('class_id', $student->class_id)
                ->where('term', $term)
                ->where('year', $year)
                ->first();

            $expected = $fee ? $fee->amount : 0;

            $paid = Payment::where('student_id', $student->id)
                ->where('term', $term)
                ->where('year', $year)
                ->sum('amount');

            return [
                'student_name' => optional($student->user)->name,
                'class_name' => optional($student->class)->name,
                'stream_name' => optional($student->stream)->name,
                'expected' => $expected,
                'paid' => $paid,
                'balance' => max($expected - $paid, 0),
            ];
        })->filter(fn ($item) => $item['balance'] > 0);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.defaulters-report', [
            'school' => $school,
            'students' => $data,
            'term' => $term,
            'year' => $year,
            'class_id' => $classId,
            'stream_id' => $streamId,
        ]);

        return $pdf->download("Defaulters_Report_{$school->id}_{$term}_{$year}.pdf");
    }
}