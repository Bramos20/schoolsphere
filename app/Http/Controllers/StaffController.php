<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Staff;
use App\Models\School;
use App\Models\Department;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function index(School $school)
    {
        $this->authorizeSchoolAdmin($school);
        $assignableRoles = Role::whereNotIn('slug', ['super_admin', 'company_admin', 'school_admin'])->get();

        return Inertia::render('SchoolAdmin/Staff', [
            'school' => $school,
            'departments' => Department::where('school_id', $school->id)->get(),
            'staff' => Staff::with('user', 'department')
                            ->where('school_id', $school->id)->get(),
            'roles' => $assignableRoles,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'position' => 'required|string',
            'department_id' => 'nullable|exists:departments,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        // Create user
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'school_id' => $school->id,
            'company_id' => $school->company_id,
        ]);

        // Assign staff role
        $user->roles()->attach($data['role_id']);

        // Create staff profile
        Staff::create([
            'user_id' => $user->id,
            'school_id' => $school->id,
            'department_id' => $data['department_id'],
            'position' => $data['position'],
        ]);

        return redirect()->back()->with('success', 'Staff member created.');
    }

    /**
     * Ensure the logged-in user is a school admin managing this school
     */
    protected function authorizeSchoolAdmin(School $school)
    {
        $user = auth()->user();

        if (!$user->hasRole('school_admin') || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized: not a school admin or wrong school.');
        }
    }
}
