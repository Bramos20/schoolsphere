<?php

namespace App\Http\Controllers;

namespace App\Http\Controllers;

use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index(School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $departments = $school->departments()->latest()->get();

        return Inertia::render('SchoolAdmin/Departments', [ // ✅ moved to correct folder
            'school' => $school,
            'departments' => $departments,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $school->departments()->create([
            'name' => $request->name,
            // 'created_by' => auth()->id(), // Optional if you want creator tracking
        ]);

        return redirect()->back()->with('success', 'Department created.');
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
