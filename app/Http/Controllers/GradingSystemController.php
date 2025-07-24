<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\School;
use App\Models\GradingSystem;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class GradingSystemController extends Controller
{
    public function index(School $school)
    {
        $gradingSystems = $school->gradingSystems()
            ->with('grades')
            ->orderBy('is_default', 'desc')
            ->get();

        return Inertia::render('SchoolAdmin/GradingSystems/Index', [
            'school' => $school,
            'gradingSystems' => $gradingSystems,
        ]);
    }

    public function create(School $school)
    {
        // Predefined Kenyan grading systems
        $templates = [
            'kcse' => [
                'name' => 'KCSE Grading (12-Point)',
                'type' => 'letter',
                'grades' => [
                    ['grade' => 'A', 'min_score' => 80, 'max_score' => 100, 'points' => 12, 'remarks' => 'Excellent'],
                    ['grade' => 'A-', 'min_score' => 75, 'max_score' => 79, 'points' => 11, 'remarks' => 'Very Good'],
                    ['grade' => 'B+', 'min_score' => 70, 'max_score' => 74, 'points' => 10, 'remarks' => 'Good Plus'],
                    ['grade' => 'B', 'min_score' => 65, 'max_score' => 69, 'points' => 9, 'remarks' => 'Good'],
                    ['grade' => 'B-', 'min_score' => 60, 'max_score' => 64, 'points' => 8, 'remarks' => 'Good Minus'],
                    ['grade' => 'C+', 'min_score' => 55, 'max_score' => 59, 'points' => 7, 'remarks' => 'Credit Plus'],
                    ['grade' => 'C', 'min_score' => 50, 'max_score' => 54, 'points' => 6, 'remarks' => 'Credit'],
                    ['grade' => 'C-', 'min_score' => 45, 'max_score' => 49, 'points' => 5, 'remarks' => 'Credit Minus'],
                    ['grade' => 'D+', 'min_score' => 40, 'max_score' => 44, 'points' => 4, 'remarks' => 'Pass Plus'],
                    ['grade' => 'D', 'min_score' => 35, 'max_score' => 39, 'points' => 3, 'remarks' => 'Pass'],
                    ['grade' => 'D-', 'min_score' => 30, 'max_score' => 34, 'points' => 2, 'remarks' => 'Pass Minus'],
                    ['grade' => 'E', 'min_score' => 0, 'max_score' => 29, 'points' => 1, 'remarks' => 'Fail'],
                ]
            ],
            'primary' => [
                'name' => 'Primary School Grading',
                'type' => 'letter',
                'grades' => [
                    ['grade' => 'A', 'min_score' => 80, 'max_score' => 100, 'points' => 4, 'remarks' => 'Excellent'],
                    ['grade' => 'B', 'min_score' => 60, 'max_score' => 79, 'points' => 3, 'remarks' => 'Good'],
                    ['grade' => 'C', 'min_score' => 40, 'max_score' => 59, 'points' => 2, 'remarks' => 'Satisfactory'],
                    ['grade' => 'D', 'min_score' => 0, 'max_score' => 39, 'points' => 1, 'remarks' => 'Below Expectation'],
                ]
            ]
        ];

        return Inertia::render('SchoolAdmin/GradingSystems/Create', [
            'school' => $school,
            'templates' => $templates,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:letter,number,percentage',
            'grades' => 'required|array|min:1',
            'grades.*.grade' => 'required|string',
            'grades.*.min_score' => 'required|numeric|min:0|max:100',
            'grades.*.max_score' => 'required|numeric|min:0|max:100',
            'grades.*.points' => 'required|numeric|min:0',
            'grades.*.remarks' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request, $school) {
            // If this is set as default, remove default from others
            if ($request->is_default) {
                $school->gradingSystems()->update(['is_default' => false]);
            }

            $gradingSystem = $school->gradingSystems()->create([
                'name' => $request->name,
                'description' => $request->description,
                'type' => $request->type,
                'is_default' => $request->is_default ?? false,
                'is_active' => true,
            ]);

            foreach ($request->grades as $gradeData) {
                $gradingSystem->grades()->create($gradeData);
            }
        });

        return redirect()->route('grading-systems.index', $school)
            ->with('success', 'Grading system created successfully.');
    }

    public function setDefault(School $school, GradingSystem $gradingSystem)
    {
        DB::transaction(function () use ($school, $gradingSystem) {
            $school->gradingSystems()->update(['is_default' => false]);
            $gradingSystem->update(['is_default' => true]);
        });

        return back()->with('success', 'Default grading system updated.');
    }
}
