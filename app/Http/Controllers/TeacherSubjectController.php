<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\Subject;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherSubjectController extends Controller
{
    public function index(School $school)
    {
        $this->authorizeSchoolAdmin($school);

        // Get all teachers in the school
        $teacherRole = Role::where('slug', 'teacher')->first();
        $teachers = User::whereHas('roles', function ($q) use ($teacherRole) {
            $q->where('role_id', $teacherRole->id);
        })->where('school_id', $school->id)->get();

        return Inertia::render('SchoolAdmin/TeacherSubjects', [
            'school' => $school,
            'subjects' => Subject::where('school_id', $school->id)->with('teachers')->get(),
            'teachers' => $teachers,
        ]);
    }

    public function assign(Request $request, School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $data = $request->validate([
            'teacher_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        $subject = Subject::findOrFail($data['subject_id']);
        $subject->teachers()->syncWithoutDetaching([$data['teacher_id']]);

        return redirect()->back()->with('success', 'Subject assigned.');
    }

    public function unassign(Request $request, School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $data = $request->validate([
            'teacher_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        $subject = Subject::findOrFail($data['subject_id']);
        $subject->teachers()->detach($data['teacher_id']);

        return redirect()->back()->with('success', 'Subject unassigned.');
    }

    protected function authorizeSchoolAdmin(School $school)
    {
        $user = auth()->user();
        if (!$user->hasRole('school_admin') || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized');
        }
    }
}
