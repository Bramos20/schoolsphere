<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\School;
use Inertia\Inertia;

class ExamCategoryController extends Controller
{
    public function index(School $school)
    {
        $categories = $school->examCategories()->get();

        return Inertia::render('SchoolAdmin/ExamCategories/Index', [
            'school' => $school,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'weight_percentage' => 'required|numeric|min:0|max:100',
            'color' => 'nullable|string',
        ]);

        $school->examCategories()->create($request->all());

        return back()->with('success', 'Exam category created successfully.');
    }
}
