<?php

namespace App\Http\Controllers;

use App\Models\Timetable;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimetableController extends Controller
{
    public function index(School $school)
    {
        $timetables = $school->timetables()->with(['class', 'subject', 'teacher'])->get();

        return Inertia::render('SchoolAdmin/Timetables/Index', [
            'school' => $school,
            'timetables' => $timetables,
        ]);
    }

    public function create(School $school)
    {
        $classes = $school->classes()->get();
        $subjects = $school->subjects()->get();
        $teachers = $school->users()->whereHas('roles', function ($query) {
            $query->where('slug', 'teacher');
        })->get();

        return Inertia::render('SchoolAdmin/Timetables/Create', [
            'school' => $school,
            'classes' => $classes,
            'subjects' => $subjects,
            'teachers' => $teachers,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:users,id',
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        $school->timetables()->create($request->all());

        return redirect()->route('timetables.index', $school)->with('success', 'Timetable entry created successfully.');
    }

    public function edit(School $school, Timetable $timetable)
    {
        $classes = $school->classes()->get();
        $subjects = $school->subjects()->get();
        $teachers = $school->users()->whereHas('roles', function ($query) {
            $query->where('slug', 'teacher');
        })->get();

        return Inertia::render('SchoolAdmin/Timetables/Edit', [
            'school' => $school,
            'timetable' => $timetable,
            'classes' => $classes,
            'subjects' => $subjects,
            'teachers' => $teachers,
        ]);
    }

    public function update(Request $request, School $school, Timetable $timetable)
    {
        $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:users,id',
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        $timetable->update($request->all());

        return redirect()->route('timetables.index', $school)->with('success', 'Timetable entry updated successfully.');
    }

    public function destroy(School $school, Timetable $timetable)
    {
        $timetable->delete();

        return redirect()->route('timetables.index', $school)->with('success', 'Timetable entry deleted successfully.');
    }
}
