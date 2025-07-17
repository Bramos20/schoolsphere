<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\FeeStructure;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeeStructureController extends Controller
{
    public function index(School $school)
    {
        $this->authorizeSchoolAdmin($school);

        return Inertia::render('SchoolAdmin/FeeStructures', [
            'school' => $school,
            'classes' => $school->classes()->select('id', 'name')->get(), // ✅ make sure this is present
            'feeStructures' => FeeStructure::with('class')
                ->whereIn('class_id', $school->classes->pluck('id'))
                ->get()
        ]);
    }

    public function store(Request $request, School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'term' => 'required|string|max:20',
            'amount' => 'required|numeric|min:0',
            'year' => 'required|integer|min:2000|max:2100',
        ]);

        $class = SchoolClass::findOrFail($request->class_id);

        FeeStructure::create([
            'school_id' => $school->id,
            'class_id' => $class->id,
            'term' => $request->term,
            'amount' => $request->amount,
            'year' => $request->year,
        ]);

        return redirect()->back()->with('success', 'Fee structure created.');
    }

    /**
     * Authorize school admin against the school
     */
    protected function authorizeSchoolAdmin(School $school)
    {
        $user = auth()->user();

        if (!$user->hasRole('school_admin') || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized: Not school admin or not assigned to this school.');
        }
    }
}
