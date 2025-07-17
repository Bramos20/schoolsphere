<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\Stream;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StreamSubjectController extends Controller
{
    public function index(School $school)
    {
        $this->authorizeSchoolAdmin($school);

        return Inertia::render('SchoolAdmin/StreamSubjects', [
            'school' => $school,
            'streams' => Stream::with(['class', 'subjects'])
                ->whereHas('class', fn($q) => $q->where('school_id', $school->id))
                ->get(),
            'subjects' => Subject::where('school_id', $school->id)->get(),
        ]);
    }

    public function assign(Request $request, School $school)
    {
        \Log::info('Incoming subject assignment', $request->all());

        $request->validate([
            'stream_id' => 'required|exists:streams,id',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        $this->authorizeSchoolAdmin($school);

        $stream = Stream::whereHas('class', function ($query) use ($school) {
            $query->where('school_id', $school->id);
        })->findOrFail($request->stream_id);

        \Log::info('Fetched stream: ' . $stream->id);

        if (!$stream->subjects->contains($request->subject_id)) {
            $stream->subjects()->attach($request->subject_id);
            \Log::info("Attached subject ID {$request->subject_id} to stream {$stream->id}");
        } else {
            \Log::info("Subject already attached");
        }

        return back()->with('success', 'Subject assigned to stream.');
    }

    public function unassign(Request $request, School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $data = $request->validate([
            'stream_id' => 'required|exists:streams,id',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        $stream = Stream::findOrFail($data['stream_id']);
        $stream->subjects()->detach($data['subject_id']);

        return redirect()->back()->with('success', 'Subject unassigned from stream.');
    }

    protected function authorizeSchoolAdmin(School $school)
    {
        $user = auth()->user();
        if (!$user->hasRole('school_admin') || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized');
        }
    }
}
