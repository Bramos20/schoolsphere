<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Stream;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassController extends Controller
{
    public function index(School $school)
    {
        $this->authorizeSchoolAdmin($school);

        return Inertia::render('SchoolAdmin/Classes', [
            'school' => $school,
            'classes' => SchoolClass::with('streams')
                            ->where('school_id', $school->id)
                            ->get(),
        ]);
    }

    public function store(Request $request, School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $validated = $request->validate([
            'class_name' => 'required|string',
            'streams' => 'required|array|min:1',
            'streams.*' => 'required|string'
        ]);

        $class = SchoolClass::create([
            'name' => $validated['class_name'],
            'school_id' => $school->id,
        ]);

        foreach ($validated['streams'] as $streamName) {
            $class->streams()->create(['name' => $streamName]);
        }

        return redirect()->back()->with('success', 'Class and streams created.');
    }

        /**
         * Ensure the logged-in user is a school admin managing this school
         */
    protected function authorizeSchoolAdmin(School $school)
    {
        $user = auth()->user();

        if (!$user->hasRole('school_admin') || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized: not school admin or wrong school');
        }
    }
}
