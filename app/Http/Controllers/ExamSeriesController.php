<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\School;
use App\Models\ExamSeries;
use App\Models\StudentTermSummary;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ExamSeriesController extends Controller
{
    public function index(School $school)
    {
        $series = $school->examSeries()
            ->withCount('exams')
            ->latest()
            ->get();

        return Inertia::render('SchoolAdmin/ExamSeries/Index', [
            'school' => $school,
            'series' => $series,
        ]);
    }

    public function create(School $school)
    {
        return Inertia::render('SchoolAdmin/ExamSeries/Create', [
            'school' => $school,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'academic_year' => 'required|string',
            'term' => 'required|in:1,2,3',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $school->examSeries()->create($request->all());

        return redirect()->route('exam-series.index', $school)
            ->with('success', 'Exam series created successfully.');
    }

    public function show(School $school, ExamSeries $examSeries)
    {
        $examSeries->load(['exams.subject', 'exams.class']);
        
        return Inertia::render('SchoolAdmin/ExamSeries/Show', [
            'school' => $school,
            'examSeries' => $examSeries,
        ]);
    }

    public function generateTermReports(School $school, ExamSeries $examSeries)
    {
        // Generate comprehensive term reports for all students
        $this->generateStudentTermSummaries($school, $examSeries);

        return Inertia::render('SchoolAdmin/ExamSeries/TermReports', [
            'school' => $school,
            'examSeries' => $examSeries,
        ]);
    }

    private function generateStudentTermSummaries(School $school, ExamSeries $examSeries)
    {
        $students = $school->students; // Assuming you have this relationship

        foreach ($students as $student) {
            $results = $student->getResultsForSeries($examSeries->id);
            
            if ($results->isNotEmpty()) {
                $totalPoints = $results->sum('points');
                $totalSubjects = $results->count();
                $averageScore = $results->avg('total_score');
                
                // Determine average grade based on average score
                $defaultGradingSystem = $school->getDefaultGradingSystem();
                $averageGrade = $defaultGradingSystem->getGradeForScore($averageScore);

                StudentTermSummary::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'exam_series_id' => $examSeries->id,
                    ],
                    [
                        'class_id' => $student->class_id,
                        'stream_id' => $student->stream_id,
                        'total_subjects' => $totalSubjects,
                        'total_points' => $totalPoints,
                        'average_score' => round($averageScore, 2),
                        'average_grade' => $averageGrade->grade ?? 'N/A',
                        'generated_at' => now(),
                    ]
                );
            }
        }

        // Calculate positions
        $this->calculateTermPositions($school, $examSeries);
    }

    private function calculateTermPositions(School $school, ExamSeries $examSeries)
    {
        // Overall positions
        $summaries = StudentTermSummary::where('exam_series_id', $examSeries->id)
            ->orderBy('average_score', 'desc')
            ->get();

        $position = 1;
        foreach ($summaries as $summary) {
            $summary->update(['overall_position' => $position]);
            $position++;
        }

        // Class positions
        $classes = $school->classes;
        foreach ($classes as $class) {
            $classSummaries = StudentTermSummary::where('exam_series_id', $examSeries->id)
                ->where('class_id', $class->id)
                ->orderBy('average_score', 'desc')
                ->get();

            $position = 1;
            foreach ($classSummaries as $summary) {
                $summary->update(['class_position' => $position]);
                $position++;
            }
        }
    }
}
