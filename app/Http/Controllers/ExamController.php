<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamController extends Controller
{
    public function index(School $school)
    {
        $exams = $school->exams()->with(['class', 'subject'])->get();

        return Inertia::render('SchoolAdmin/Exams/Index', [
            'school' => $school,
            'exams' => $exams,
        ]);
    }

    public function create(School $school)
    {
        $classes = $school->classes()->get();
        $subjects = $school->subjects()->get();

        return Inertia::render('SchoolAdmin/Exams/Create', [
            'school' => $school,
            'classes' => $classes,
            'subjects' => $subjects,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        $school->exams()->create($request->all());

        return redirect()->route('exams.index', $school)->with('success', 'Exam created successfully.');
    }

    public function show(School $school, Exam $exam)
    {
        $exam->load(['results.student']);

        return Inertia::render('SchoolAdmin/Exams/Show', [
            'school' => $school,
            'exam' => $exam,
        ]);
    }

    public function edit(School $school, Exam $exam)
    {
        $classes = $school->classes()->get();
        $subjects = $school->subjects()->get();

        return Inertia::render('SchoolAdmin/Exams/Edit', [
            'school' => $school,
            'exam' => $exam,
            'classes' => $classes,
            'subjects' => $subjects,
        ]);
    }

    public function update(Request $request, School $school, Exam $exam)
    {
        $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        $exam->update($request->all());

        return redirect()->route('exams.index', $school)->with('success', 'Exam updated successfully.');
    }

    public function destroy(School $school, Exam $exam)
    {
        $exam->delete();

        return redirect()->route('exams.index', $school)->with('success', 'Exam deleted successfully.');
    }
}
