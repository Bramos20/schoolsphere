<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\Stream;
use App\Models\Subject;
use App\Models\SubjectTeacherStream;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectStreamTeacherController extends Controller
{
    public function index(School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $subjects = Subject::where('school_id', $school->id)->get();
        $streams = Stream::whereHas('class', fn($q) =>
            $q->where('school_id', $school->id)
        )->get();

        $teachers = User::whereHas('roles', fn($q) => $q->where('slug', 'teacher'))
            ->where('school_id', $school->id)
            ->get();

        $assignments = SubjectTeacherStream::with(['teacher', 'subject', 'stream.class'])
            ->whereIn('stream_id', $streams->pluck('id'))
            ->get();

        return Inertia::render('SchoolAdmin/SubjectStreamTeacher', [
            'school' => $school,
            'subjects' => $subjects,
            'streams' => $streams,
            'teachers' => $teachers,
            'assignments' => $assignments,
        ]);
    }

    public function assign(Request $request, School $school)
    {
        \Log::info('Incoming assignment data', $request->all());

        $request->validate([
            'teacher_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'stream_id' => 'required|exists:streams,id',
        ]);

        $assignment = SubjectTeacherStream::firstOrCreate([
            'teacher_id' => $request->teacher_id,
            'subject_id' => $request->subject_id,
            'stream_id' => $request->stream_id,
        ]);

        \Log::info('Created assignment: ', $assignment->toArray());

        return back()->with('success', 'Assignment created.');
    }


    public function unassign(Request $request, School $school)
    {
        $request->validate([
            'teacher_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'stream_id' => 'required|exists:streams,id',
        ]);

        SubjectTeacherStream::where([
            'teacher_id' => $request->teacher_id,
            'subject_id' => $request->subject_id,
            'stream_id' => $request->stream_id,
        ])->delete();

        return back()->with('success', 'Assignment removed.');
    }

    protected function authorizeSchoolAdmin(School $school)
    {
        $user = auth()->user();
        if (!$user->hasRole('school_admin') || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized');
        }
    }
}