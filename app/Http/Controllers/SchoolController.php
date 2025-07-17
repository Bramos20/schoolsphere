<?php

namespace App\Http\Controllers;

use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if (!$user->hasRole('company_admin')) {
            abort(403);
        }

        $schools = School::where('company_id', $user->company_id)->latest()->get();

        return Inertia::render('Company/Schools', [
            'schools' => $schools,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user->hasRole('company_admin')) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        School::create([
            'name' => $request->name,
            'company_id' => $user->company_id,
        ]);

        return redirect()->back()->with('success', 'School created successfully.');
    }

    public function destroy(School $school)
    {
        $user = auth()->user();

        if (
            !$user->hasRole('company_admin') ||
            $user->company_id !== $school->company_id
        ) {
            abort(403);
        }

        $school->delete();

        return redirect()->back()->with('success', 'School deleted.');
    }

    public function assignAdmin(Request $request, School $school)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = \App\Models\User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'school_id' => $school->id,
            'company_id' => $school->company_id,
        ]);

        $schoolAdminRole = \App\Models\Role::where('slug', 'school_admin')->first();
        $user->roles()->attach($schoolAdminRole);

        return redirect()->back()->with('success', 'School admin assigned.');
    }

    public function showAssignAdminForm(School $school)
    {
        return Inertia::render('Company/AssignSchoolAdmin', [
            'school' => $school,
        ]);
    }
}
