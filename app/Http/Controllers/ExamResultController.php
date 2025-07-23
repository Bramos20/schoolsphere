<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamResultController extends Controller
{
    public function create(Exam $exam)
    {
        $students = $exam->class->students;

        return Inertia::render('SchoolAdmin/ExamResults/Create', [
            'exam' => $exam,
            'students' => $students,
        ]);
    }

    public function store(Request $request, Exam $exam)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'score' => 'required|integer|min:0|max:100',
        ]);

        $grade = $this->calculateGrade($request->score);

        $exam->results()->create([
            'student_id' => $request->student_id,
            'score' => $request->score,
            'grade' => $grade,
        ]);

        return redirect()->route('exams.show', $exam)->with('success', 'Exam result added successfully.');
    }

    private function calculateGrade($score)
    {
        if ($score >= 80) {
            return 'A';
        } elseif ($score >= 70) {
            return 'B';
        } elseif ($score >= 60) {
            return 'C';
        } elseif ($score >= 50) {
            return 'D';
        } else {
            return 'E';
        }
    }
}
