<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\StudentTermSummary;
use App\Models\ExamSeries;
use App\Models\Student;
use App\Models\SchoolClass;
use App\Models\Stream;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class StudentTermSummaryController extends Controller
{
    public function index(School $school)
    {
        $examSeries = $school->examSeries()
            ->with('termSummaries.student.user')
            ->latest()
            ->get();

        $classes = $school->classes()->with('streams')->get();

        return Inertia::render('SchoolAdmin/TermSummaries/Index', [
            'school' => $school,
            'examSeries' => $examSeries,
            'classes' => $classes,
        ]);
    }

    public function show(School $school, ExamSeries $examSeries)
    {
        $termSummaries = $examSeries->termSummaries()
            ->with(['student.user', 'student.class', 'student.stream'])
            ->orderBy('overall_position')
            ->paginate(50);

        $statistics = $this->getTermStatistics($examSeries);

        return Inertia::render('SchoolAdmin/TermSummaries/Show', [
            'school' => $school,
            'examSeries' => $examSeries,
            'termSummaries' => $termSummaries,
            'statistics' => $statistics,
        ]);
    }

    public function generate(School $school, ExamSeries $examSeries)
    {
        DB::transaction(function () use ($examSeries) {
            // Get all students in the school
            $students = Student::where('school_id', $examSeries->school_id)
                ->with(['examResults' => function($query) use ($examSeries) {
                    $query->whereHas('exam', function($q) use ($examSeries) {
                        $q->where('exam_series_id', $examSeries->id);
                    })->with('exam.subject');
                }])
                ->get();

            foreach ($students as $student) {
                $this->generateStudentSummary($student, $examSeries);
            }

            // Calculate overall positions
            $this->calculateOverallPositions($examSeries);
        });

        return back()->with('success', 'Term summaries generated successfully.');
    }

    public function regenerate(School $school, ExamSeries $examSeries)
    {
        // Delete existing summaries
        $examSeries->termSummaries()->delete();

        return $this->generate($school, $examSeries);
    }

    public function studentSummary(School $school, ExamSeries $examSeries, Student $student)
    {
        $summary = $student->termSummaries()
            ->where('exam_series_id', $examSeries->id)
            ->first();

        if (!$summary) {
            // Generate summary if it doesn't exist
            $summary = $this->generateStudentSummary($student, $examSeries);
        }

        $examResults = $student->examResults()
            ->whereHas('exam', function($query) use ($examSeries) {
                $query->where('exam_series_id', $examSeries->id);
            })
            ->with(['exam.subject', 'exam.gradingSystem.grades'])
            ->get()
            ->groupBy('exam.subject.name');

        return Inertia::render('SchoolAdmin/TermSummaries/StudentSummary', [
            'school' => $school,
            'examSeries' => $examSeries,
            'student' => $student->load('user', 'class', 'stream'),
            'summary' => $summary,
            'examResults' => $examResults,
        ]);
    }

    public function classReport(School $school, ExamSeries $examSeries, SchoolClass $class, Stream $stream = null)
    {
        $query = $examSeries->termSummaries()
            ->whereHas('student', function($q) use ($class, $stream) {
                $q->where('class_id', $class->id);
                if ($stream) {
                    $q->where('stream_id', $stream->id);
                }
            })
            ->with(['student.user']);

        $summaries = $query->orderBy('class_position')->get();

        $classStatistics = $this->getClassStatistics($examSeries, $class, $stream);

        return Inertia::render('SchoolAdmin/TermSummaries/ClassReport', [
            'school' => $school,
            'examSeries' => $examSeries,
            'class' => $class,
            'stream' => $stream,
            'summaries' => $summaries,
            'statistics' => $classStatistics,
        ]);
    }

    public function exportClassReport(School $school, ExamSeries $examSeries, SchoolClass $class, Stream $stream = null)
    {
        // Implementation for PDF export
        // This would generate a PDF report for the class
        
        return response()->json(['message' => 'Export functionality to be implemented']);
    }

    private function generateStudentSummary(Student $student, ExamSeries $examSeries)
    {
        $examResults = $student->examResults()
            ->whereHas('exam', function($query) use ($examSeries) {
                $query->where('exam_series_id', $examSeries->id);
            })
            ->with('exam.subject')
            ->get();

        if ($examResults->isEmpty()) {
            return null;
        }

        $totalMarks = $examResults->sum('total_score');
        $totalPossibleMarks = $examResults->sum(function($result) {
            return $result->exam->total_marks;
        });
        
        $averagePercentage = $totalPossibleMarks > 0 ? ($totalMarks / $totalPossibleMarks) * 100 : 0;
        $subjectsCount = $examResults->count();
        $averageScore = $subjectsCount > 0 ? $totalMarks / $subjectsCount : 0;

        // Count grades
        $gradeDistribution = $examResults->groupBy('grade')->map->count();

        // Determine overall grade based on average percentage
        $overallGrade = $this->determineOverallGrade($averagePercentage, $examSeries);

        $summary = StudentTermSummary::updateOrCreate(
            [
                'student_id' => $student->id,
                'exam_series_id' => $examSeries->id,
            ],
            [
                'total_marks' => $totalMarks,
                'total_possible_marks' => $totalPossibleMarks,
                'average_percentage' => round($averagePercentage, 2),
                'average_score' => round($averageScore, 2),
                'subjects_count' => $subjectsCount,
                'overall_grade' => $overallGrade,
                'grade_distribution' => json_encode($gradeDistribution),
                'generated_at' => now(),
            ]
        );

        return $summary;
    }

    private function calculateOverallPositions(ExamSeries $examSeries)
    {
        // Calculate overall positions
        $summaries = $examSeries->termSummaries()
            ->orderBy('average_percentage', 'desc')
            ->orderBy('total_marks', 'desc')
            ->get();

        $position = 1;
        $previousPercentage = null;
        $previousMarks = null;
        $actualPosition = 1;

        foreach ($summaries as $summary) {
            if ($previousPercentage !== null && 
                ($summary->average_percentage < $previousPercentage || 
                 ($summary->average_percentage == $previousPercentage && $summary->total_marks < $previousMarks))) {
                $position = $actualPosition;
            }

            $summary->update(['overall_position' => $position]);
            $previousPercentage = $summary->average_percentage;
            $previousMarks = $summary->total_marks;
            $actualPosition++;
        }

        // Calculate class positions
        $this->calculateClassPositions($examSeries);
    }

    private function calculateClassPositions(ExamSeries $examSeries)
    {
        $classes = SchoolClass::whereHas('students.termSummaries', function($query) use ($examSeries) {
            $query->where('exam_series_id', $examSeries->id);
        })->with('streams')->get();

        foreach ($classes as $class) {
            // Calculate positions for each stream if streams exist
            if ($class->streams->count() > 0) {
                foreach ($class->streams as $stream) {
                    $this->calculateStreamPositions($examSeries, $class, $stream);
                }
            } else {
                // Calculate class positions without streams
                $this->calculateStreamPositions($examSeries, $class, null);
            }
        }
    }

    private function calculateStreamPositions(ExamSeries $examSeries, SchoolClass $class, $stream = null)
    {
        $query = $examSeries->termSummaries()
            ->whereHas('student', function($q) use ($class, $stream) {
                $q->where('class_id', $class->id);
                if ($stream) {
                    $q->where('stream_id', $stream->id);
                }
            })
            ->orderBy('average_percentage', 'desc')
            ->orderBy('total_marks', 'desc');

        $summaries = $query->get();

        $position = 1;
        $previousPercentage = null;
        $previousMarks = null;
        $actualPosition = 1;

        foreach ($summaries as $summary) {
            if ($previousPercentage !== null && 
                ($summary->average_percentage < $previousPercentage || 
                 ($summary->average_percentage == $previousPercentage && $summary->total_marks < $previousMarks))) {
                $position = $actualPosition;
            }

            $summary->update(['class_position' => $position]);
            $previousPercentage = $summary->average_percentage;
            $previousMarks = $summary->total_marks;
            $actualPosition++;
        }
    }

    private function determineOverallGrade($averagePercentage, ExamSeries $examSeries)
    {
        // Get the default grading system for the school
        $gradingSystem = $examSeries->school->gradingSystems()
            ->where('is_default', true)
            ->first();

        if (!$gradingSystem) {
            return 'N/A';
        }

        $grade = $gradingSystem->grades()
            ->where('min_percentage', '<=', $averagePercentage)
            ->where('max_percentage', '>=', $averagePercentage)
            ->first();

        return $grade ? $grade->grade : 'N/A';
    }

    private function getTermStatistics(ExamSeries $examSeries)
    {
        $summaries = $examSeries->termSummaries();

        return [
            'total_students' => $summaries->count(),
            'average_percentage' => round($summaries->avg('average_percentage'), 2),
            'highest_percentage' => round($summaries->max('average_percentage'), 2),
            'lowest_percentage' => round($summaries->min('average_percentage'), 2),
            'grade_distribution' => $this->getGradeDistribution($examSeries),
        ];
    }

    private function getClassStatistics(ExamSeries $examSeries, SchoolClass $class, $stream = null)
    {
        $query = $examSeries->termSummaries()
            ->whereHas('student', function($q) use ($class, $stream) {
                $q->where('class_id', $class->id);
                if ($stream) {
                    $q->where('stream_id', $stream->id);
                }
            });

        return [
            'total_students' => $query->count(),
            'average_percentage' => round($query->avg('average_percentage'), 2),
            'highest_percentage' => round($query->max('average_percentage'), 2),
            'lowest_percentage' => round($query->min('average_percentage'), 2),
            'class_average' => round($query->avg('total_marks'), 2),
        ];
    }

    private function getGradeDistribution(ExamSeries $examSeries)
    {
        $summaries = $examSeries->termSummaries()->get();
        $distribution = [];

        foreach ($summaries as $summary) {
            $grade = $summary->overall_grade;
            $distribution[$grade] = ($distribution[$grade] ?? 0) + 1;
        }

        return $distribution;
    }
}