<?php

namespace App\Http\Controllers;

use App\Models\Capitation;
use App\Models\School;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

class CapitationController extends Controller
{
    public function index(School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $capitations = Capitation::where('school_id', $school->id)
            ->latest()
            ->get();

        return Inertia::render('SchoolAdmin/Capitations', [
            'school' => $school,
            'capitations' => $capitations
        ]);
    }

    public function store(Request $request, School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $request->validate([
            'term' => 'required|string|max:20',
            'year' => 'required|integer|min:2000|max:2100',
            'amount' => 'required|numeric|min:1',
            'received_date' => 'nullable|date',
            'remarks' => 'nullable|string'
        ]);

        Capitation::create([
            'school_id' => $school->id,
            'term' => $request->term,
            'year' => $request->year,
            'amount' => $request->amount,
            'received_date' => $request->received_date ?? now(),
            'remarks' => $request->remarks,
        ]);

        return back()->with('success', 'Capitation record saved.');
    }

    protected function authorizeSchoolAdmin(School $school)
    {
        $user = auth()->user();
        if (!$user->hasRole('school_admin') || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized');
        }
    }
}
