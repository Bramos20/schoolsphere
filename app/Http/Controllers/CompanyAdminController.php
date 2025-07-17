<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyAdminController extends Controller
{
    public function index(Company $company)
    {
        return Inertia::render('SuperAdmin/CompanyAdmins', [
            'company' => $company,
            'admins' => $company->admins()->with('roles')->get(),
        ]);
    }

    public function store(Request $request, Company $company)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        // Create the user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'company_id' => $company->id,
        ]);

        // Attach the "company_admin" role
        $role = Role::where('slug', 'company_admin')->first();
        $user->roles()->attach($role);

        return redirect()->back()->with('success', 'Company admin added.');
    }
}
