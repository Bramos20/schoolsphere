<?php

namespace App\Http\Controllers;

use App\Models\Expenditure;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenditureController extends Controller
{
    public function index(School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $expenditures = Expenditure::where('school_id', $school->id)
            ->latest()
            ->get();

        return Inertia::render('SchoolAdmin/Expenditures', [
            'school' => $school,
            'expenditures' => $expenditures,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:1',
            'date' => 'required|date',
            'category' => 'required|string|max:50',
            'paid_to' => 'nullable|string|max:100',
            'term' => 'required|string|max:20', // ✅ Add term validation
        ]);

        Expenditure::create([
            'school_id' => $school->id,
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'date' => $validated['date'],
            'category' => $validated['category'],
            'paid_to' => $validated['paid_to'],
            'term' => $validated['term'], // ✅ Save term
        ]);

        return back()->with('success', 'Expenditure recorded successfully.');
    }

    public function destroy(School $school, Expenditure $expenditure)
    {
        $this->authorizeSchoolAdmin($school);

        if ($expenditure->school_id !== $school->id) {
            abort(403, 'Unauthorized access to this record.');
        }

        $expenditure->delete();

        return back()->with('success', 'Expenditure deleted.');
    }

    protected function authorizeSchoolAdmin(School $school)
    {
        $user = auth()->user();

        if (!$user->hasRole('school_admin') || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized');
        }
    }
}
