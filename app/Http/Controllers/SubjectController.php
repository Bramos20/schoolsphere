<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\Department;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(School $school)
    {
        $this->authorizeSchoolAdmin($school);

        return Inertia::render('SchoolAdmin/Subjects', [
            'school' => $school,
            'departments' => Department::where('school_id', $school->id)->get(),
            'subjects' => Subject::where('school_id', $school->id)->with('department')->get(),
        ]);
    }

    public function store(Request $request, School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $data = $request->validate([
            'name' => 'required|string',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        Subject::create([
            'school_id' => $school->id,
            'department_id' => $data['department_id'],
            'name' => $data['name'],
        ]);

        return redirect()->back()->with('success', 'Subject created.');
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();

        return redirect()->back()->with('success', 'Subject deleted.');
    }

    protected function authorizeSchoolAdmin(School $school)
    {
        $user = auth()->user();

        if (!$user->hasRole('school_admin') || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized');
        }
    }
}
