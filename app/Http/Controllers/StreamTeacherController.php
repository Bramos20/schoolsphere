<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\Stream;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StreamTeacherController extends Controller
{
    public function index(School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $teacherRole = Role::where('slug', 'teacher')->first();
        $teachers = User::whereHas('roles', fn($q) => $q->where('role_id', $teacherRole->id))
                        ->where('school_id', $school->id)->get();

        $streams = Stream::with(['class', 'teachers'])->whereHas('class', fn($q) =>
            $q->where('school_id', $school->id)
        )->get();

        return Inertia::render('SchoolAdmin/StreamTeachers', [
            'school' => $school,
            'streams' => $streams,
            'teachers' => $teachers,
        ]);
    }

    public function assign(Request $request, School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $data = $request->validate([
            'stream_id' => 'required|exists:streams,id',
            'teacher_id' => 'required|exists:users,id',
        ]);

        $stream = Stream::whereHas('class', fn($q) =>
            $q->where('school_id', $school->id)
        )->findOrFail($data['stream_id']);

        $stream->teachers()->syncWithoutDetaching([$data['teacher_id']]);

        return back()->with('success', 'Teacher assigned to stream.');
    }

    public function unassign(Request $request, School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $data = $request->validate([
            'stream_id' => 'required|exists:streams,id',
            'teacher_id' => 'required|exists:users,id',
        ]);

        $stream = Stream::findOrFail($data['stream_id']);
        $stream->teachers()->detach($data['teacher_id']);

        return back()->with('success', 'Teacher unassigned from stream.');
    }

    protected function authorizeSchoolAdmin(School $school)
    {
        $user = auth()->user();
        if (!$user->hasRole('school_admin') || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized');
        }
    }
}
