<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamResultController extends Controller
{
    public function create(School $school, Exam $exam)
    {
        $students = $exam->getEligibleStudents()->load('user');

        return Inertia::render('SchoolAdmin/ExamResults/Create', [
            'school' => $school,
            'exam' => $exam->load(['gradingSystem.grades', 'class', 'stream', 'subject']),
            'students' => $students,
        ]);
    }

    public function store(Request $request, School $school, Exam $exam)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'theory_score' => 'required_without:is_absent|nullable|numeric|min:0|max:' . $exam->total_marks,
            'practical_score' => 'required_if:has_practical,true|nullable|numeric|min:0|max:' . $exam->total_marks,
            'is_absent' => 'boolean',
        ]);

        // Check if student is eligible for this exam
        $eligibleStudentIds = $exam->getEligibleStudents()->pluck('id');
        if (!$eligibleStudentIds->contains($request->student_id)) {
            return back()->withErrors(['student_id' => 'Student is not eligible for this exam.']);
        }

        // Create or update result
        $result = $exam->results()->updateOrCreate(
            ['student_id' => $request->student_id],
            [
                'theory_score' => $request->is_absent ? 0 : ($request->theory_score ?? 0),
                'practical_score' => $request->is_absent ? 0 : ($request->practical_score ?? 0),
                'is_absent' => $request->is_absent ?? false,
                'entered_by' => auth()->id(),
                'entered_at' => now(),
            ]
        );

        // Calculate total score and assign grade
        $result->total_score = $result->calculateTotalScore();
        $result->assignGrade();
        $result->save();

        return redirect()->route('exams.show', [$school, $exam])
            ->with('success', 'Exam result saved successfully.');
    }

    public function update(Request $request, School $school, ExamResult $examResult)
    {
        $exam = $examResult->exam;
        
        $request->validate([
            'theory_score' => 'required_without:is_absent|nullable|numeric|min:0|max:' . $exam->total_marks,
            'practical_score' => 'required_if:has_practical,true|nullable|numeric|min:0|max:' . $exam->total_marks,
            'is_absent' => 'boolean',
        ]);

        $examResult->update([
            'theory_score' => $request->is_absent ? 0 : ($request->theory_score ?? 0),
            'practical_score' => $request->is_absent ? 0 : ($request->practical_score ?? 0),
            'is_absent' => $request->is_absent ?? false,
            'entered_by' => auth()->id(),
            'entered_at' => now(),
        ]);

        // Recalculate total score and assign grade
        $examResult->total_score = $examResult->calculateTotalScore();
        $examResult->assignGrade();
        $examResult->save();

        return redirect()->route('exams.show', [$school, $exam])
            ->with('success', 'Exam result updated successfully.');
    }

    public function destroy(School $school, ExamResult $examResult)
    {
        $exam = $examResult->exam;
        $examResult->delete();

        return redirect()->route('exams.show', [$school, $exam])
            ->with('success', 'Exam result deleted successfully.');
    }
}
