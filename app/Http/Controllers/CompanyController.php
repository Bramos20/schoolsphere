<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Company;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index()
    {
        $companies = Company::withCount('schools')->latest()->get();

        return Inertia::render('SuperAdmin/Companies', [
            'companies' => $companies,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);

        Company::create(['name' => $request->name]);

        return redirect()->back()->with('success', 'Company created successfully.');
    }
}
