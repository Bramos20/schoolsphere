<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ExamController extends Controller
{
    public function index(School $school)
    {
        $exams = $school->exams()
            ->with(['class', 'stream', 'subject', 'examSeries', 'examCategory', 'gradingSystem'])
            ->latest()
            ->get();

        $examSeries = $school->examSeries()->where('is_active', true)->get();
        $categories = $school->examCategories()->where('is_active', true)->get();

        return Inertia::render('SchoolAdmin/Exams/Index', [
            'school' => $school,
            'exams' => $exams,
            'examSeries' => $examSeries,
            'categories' => $categories,
        ]);
    }

    public function create(School $school)
    {
        $classes = $school->classes()->with('streams')->get();
        $subjects = $school->subjects()->get();
        $examSeries = $school->examSeries()->where('is_active', true)->get();
        $categories = $school->examCategories()->where('is_active', true)->get();
        $gradingSystems = $school->gradingSystems()->where('is_active', true)->get();

        return Inertia::render('SchoolAdmin/Exams/Create', [
            'school' => $school,
            'classes' => $classes,
            'subjects' => $subjects,
            'examSeries' => $examSeries,
            'categories' => $categories,
            'gradingSystems' => $gradingSystems,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $request->validate([
            'exam_series_id' => 'required|exists:exam_series,id',
            'exam_category_id' => 'required|exists:exam_categories,id',
            'grading_system_id' => 'required|exists:grading_systems,id',
            'class_id' => 'required|exists:school_classes,id',
            'stream_id' => 'nullable|exists:streams,id',
            'subject_id' => 'required|exists:subjects,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'duration_minutes' => 'required|integer|min:1',
            'total_marks' => 'required|integer|min:1',
            'pass_mark' => 'required|integer|min:0',
            'has_practical' => 'boolean',
            'practical_percentage' => 'required_if:has_practical,true|nullable|numeric|min:0|max:100',
            'theory_percentage' => 'required_if:has_practical,true|nullable|numeric|min:0|max:100',
            'instructions' => 'nullable|string',
        ]);

        // Validate percentages add up to 100 if practical component exists
        if ($request->has_practical) {
            if (($request->practical_percentage + $request->theory_percentage) != 100) {
                return back()->withErrors(['practical_percentage' => 'Theory and practical percentages must add up to 100%']);
            }
        }

        $exam = $school->exams()->create(array_merge($request->all(), [
            'created_by' => auth()->id(),
        ]));

        return redirect()->route('exams.show', [$school, $exam])
            ->with('success', 'Exam created successfully.');
    }

    public function show(School $school, Exam $exam)
    {
        $exam->load([
            'results.student',
            'examSeries',
            'examCategory',
            'gradingSystem.grades',
            'class',
            'stream',
            'subject'
        ]);

        $statistics = $exam->getStatistics();
        $eligibleStudents = $exam->getEligibleStudents()->count();

        return Inertia::render('SchoolAdmin/Exams/Show', [
            'school' => $school,
            'exam' => $exam,
            'statistics' => $statistics,
            'eligibleStudents' => $eligibleStudents,
        ]);
    }

    public function bulkResultsImport(School $school, Exam $exam)
    {
        $students = $exam->getEligibleStudents()->load('user');
        $exam->load(['subject', 'class.streams']);

        return Inertia::render('SchoolAdmin/Exams/BulkImport', [
            'school' => $school,
            'exam' => $exam,
            'students' => $students,
        ]);
    }

    public function processBulkResults(Request $request, School $school, Exam $exam)
    {
        $request->validate([
            'results' => 'required|array',
            'results.*.student_id' => 'required|exists:students,id',
            'results.*.theory_score' => 'nullable|numeric|min:0',
            'results.*.practical_score' => 'nullable|numeric|min:0',
            'results.*.is_absent' => 'boolean',
        ]);

        DB::transaction(function () use ($request, $exam) {
            foreach ($request->results as $resultData) {
                if (!empty($resultData['theory_score']) || !empty($resultData['practical_score']) || $resultData['is_absent']) {
                    $result = $exam->results()->updateOrCreate(
                        ['student_id' => $resultData['student_id']],
                        [
                            'theory_score' => $resultData['theory_score'] ?? 0,
                            'practical_score' => $resultData['practical_score'] ?? 0,
                            'is_absent' => $resultData['is_absent'] ?? false,
                            'entered_by' => auth()->id(),
                            'entered_at' => now(),
                        ]
                    );

                    // Calculate total score and assign grade
                    $result->total_score = $result->calculateTotalScore();
                    $result->assignGrade();
                    $result->save();
                }
            }

            // Calculate positions
            $this->calculatePositions($exam);
        });

        return redirect()->route('exams.show', [$school, $exam])
            ->with('success', 'Results imported successfully.');
    }

    private function calculatePositions(Exam $exam)
    {
        $results = $exam->results()
            ->where('is_absent', false)
            ->orderBy('total_score', 'desc')
            ->get();

        $position = 1;
        $previousScore = null;
        $actualPosition = 1;

        foreach ($results as $result) {
            if ($previousScore !== null && $result->total_score < $previousScore) {
                $position = $actualPosition;
            }

            $result->update(['position' => $position]);
            $previousScore = $result->total_score;
            $actualPosition++;
        }
    }

    public function publishResults(School $school, Exam $exam)
    {
        $exam->update(['is_published' => true]);

        return back()->with('success', 'Exam results published successfully.');
    }

    public function generateReports(School $school, Exam $exam)
    {
        $exam->load(['results.student', 'gradingSystem.grades']);
        
        return Inertia::render('SchoolAdmin/Exams/Reports', [
            'school' => $school,
            'exam' => $exam,
            'statistics' => $exam->getStatistics(),
        ]);
    }
}
