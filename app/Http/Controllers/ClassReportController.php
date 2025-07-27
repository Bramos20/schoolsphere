<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Stream;
use App\Models\ExamSeries;
use App\Models\Exam;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ClassReportController extends Controller
{
    public function index(School $school)
    {
        $classes = $school->classes()->with('streams')->get();
        $examSeries = $school->examSeries()->latest()->get();

        return Inertia::render('SchoolAdmin/Reports/Classes/Index', [
            'school' => $school,
            'classes' => $classes,
            'examSeries' => $examSeries,
        ]);
    }

    public function termReport(School $school, ExamSeries $examSeries, SchoolClass $class, Stream $stream = null)
    {
        // Get all students in the class/stream
        $studentsQuery = $class->students()
            ->with(['user', 'termSummaries' => function($query) use ($examSeries) {
                $query->where('exam_series_id', $examSeries->id);
            }]);

        if ($stream) {
            $studentsQuery->where('stream_id', $stream->id);
        }

        $students = $studentsQuery->get();

        // Get exam results for this class/stream in this series
        $examResults = $this->getClassExamResults($examSeries, $class, $stream);

        // Get subject analysis
        $subjectAnalysis = $this->getSubjectAnalysis($examSeries, $class, $stream);

        // Get class statistics
        $statistics = $this->getClassStatistics($examSeries, $class, $stream);

        return Inertia::render('SchoolAdmin/Reports/Classes/TermReport', [
            'school' => $school,
            'examSeries' => $examSeries,
            'class' => $class,
            'stream' => $stream,
            'students' => $students,
            'examResults' => $examResults,
            'subjectAnalysis' => $subjectAnalysis,
            'statistics' => $statistics,
        ]);
    }

    public function examReport(School $school, Exam $exam, SchoolClass $class, Stream $stream = null)
    {
        // Get students and their results for this specific exam
        $studentsQuery = $class->students()->with(['user']);

        if ($stream) {
            $studentsQuery->where('stream_id', $stream->id);
        }

        $students = $studentsQuery->get();

        // Get results for this exam
        $results = $exam->results()
            ->whereIn('student_id', $students->pluck('id'))
            ->with(['student.user', 'exam.subject'])
            ->orderBy('position')
            ->get();

        // Get exam statistics
        $statistics = $this->getExamStatistics($exam, $class, $stream);

        return Inertia::render('SchoolAdmin/Reports/Classes/ExamReport', [
            'school' => $school,
            'exam' => $exam->load(['subject', 'examSeries', 'gradingSystem.grades']),
            'class' => $class,
            'stream' => $stream,
            'students' => $students,
            'results' => $results,
            'statistics' => $statistics,
        ]);
    }

    public function subjectPerformance(School $school, Subject $subject, ExamSeries $examSeries = null)
    {
        $classes = $school->classes()->with('streams')->get();
        
        $query = Exam::where('school_id', $school->id)
            ->where('subject_id', $subject->id);

        if ($examSeries) {
            $query->where('exam_series_id', $examSeries->id);
        }

        $exams = $query->with(['results.student.class', 'results.student.stream'])
            ->latest()
            ->get();

        // Analyze performance by class
        $classPerformance = $this->analyzeSubjectPerformanceByClass($exams, $classes);

        return Inertia::render('SchoolAdmin/Reports/Classes/SubjectPerformance', [
            'school' => $school,
            'subject' => $subject,
            'examSeries' => $examSeries,
            'classes' => $classes,
            'exams' => $exams,
            'classPerformance' => $classPerformance,
        ]);
    }

    public function comparative(School $school, Request $request)
    {
        $request->validate([
            'class_ids' => 'required|array',
            'class_ids.*' => 'exists:school_classes,id',
            'exam_series_id' => 'required|exists:exam_series,id',
        ]);

        $examSeries = ExamSeries::findOrFail($request->exam_series_id);
        $classes = SchoolClass::whereIn('id', $request->class_ids)
            ->with('streams')
            ->get();

        $comparativeData = [];

        foreach ($classes as $class) {
            if ($class->streams->count() > 0) {
                foreach ($class->streams as $stream) {
                    $comparativeData[] = [
                        'class' => $class,
                        'stream' => $stream,
                        'statistics' => $this->getClassStatistics($examSeries, $class, $stream),
                        'subject_averages' => $this->getClassSubjectAverages($examSeries, $class, $stream),
                    ];
                }
            } else {
                $comparativeData[] = [
                    'class' => $class,
                    'stream' => null,
                    'statistics' => $this->getClassStatistics($examSeries, $class, null),
                    'subject_averages' => $this->getClassSubjectAverages($examSeries, $class, null),
                ];
            }
        }

        return Inertia::render('SchoolAdmin/Reports/Classes/Comparative', [
            'school' => $school,
            'examSeries' => $examSeries,
            'classes' => $classes,
            'comparativeData' => $comparativeData,
        ]);
    }

    public function trends(School $school, SchoolClass $class, Stream $stream = null)
    {
        // Get last 5 exam series
        $examSeriesList = $school->examSeries()
            ->latest()
            ->take(5)
            ->get();

        $trendsData = [];

        foreach ($examSeriesList as $series) {
            $statistics = $this->getClassStatistics($series, $class, $stream);
            $subjectAverages = $this->getClassSubjectAverages($series, $class, $stream);

            $trendsData[] = [
                'exam_series' => $series,
                'statistics' => $statistics,
                'subject_averages' => $subjectAverages,
            ];
        }

        return Inertia::render('SchoolAdmin/Reports/Classes/Trends', [
            'school' => $school,
            'class' => $class,
            'stream' => $stream,
            'trendsData' => $trendsData,
        ]);
    }

    private function getClassExamResults(ExamSeries $examSeries, SchoolClass $class, $stream = null)
    {
        $query = DB::table('exam_results')
            ->join('exams', 'exam_results.exam_id', '=', 'exams.id')
            ->join('students', 'exam_results.student_id', '=', 'students.id')
            ->join('subjects', 'exams.subject_id', '=', 'subjects.id')
            ->join('users', 'students.user_id', '=', 'users.id')
            ->where('exams.exam_series_id', $examSeries->id)
            ->where('students.class_id', $class->id);

        if ($stream) {
            $query->where('students.stream_id', $stream->id);
        }

        return $query->select([
            'exam_results.*',
            'exams.name as exam_name',
            'subjects.name as subject_name',
            'users.name as student_name'
        ])->get()->groupBy('subject_name');
    }

    private function getSubjectAnalysis(ExamSeries $examSeries, SchoolClass $class, $stream = null)
    {
        $subjects = Subject::whereHas('exams', function($query) use ($examSeries) {
            $query->where('exam_series_id', $examSeries->id);
        })->get();

        $analysis = [];

        foreach ($subjects as $subject) {
            $resultsQuery = DB::table('exam_results')
                ->join('exams', 'exam_results.exam_id', '=', 'exams.id')
                ->join('students', 'exam_results.student_id', '=', 'students.id')
                ->where('exams.exam_series_id', $examSeries->id)
                ->where('exams.subject_id', $subject->id)
                ->where('students.class_id', $class->id);

            if ($stream) {
                $resultsQuery->where('students.stream_id', $stream->id);
            }

            $results = $resultsQuery->get();

            if ($results->count() > 0) {
                $analysis[$subject->name] = [
                    'subject' => $subject,
                    'average' => round($results->avg('total_score'), 2),
                    'highest' => $results->max('total_score'),
                    'lowest' => $results->min('total_score'),
                    'total_students' => $results->count(),
                    'pass_rate' => $this->calculatePassRate($results),
                ];
            }
        }

        return $analysis;
    }

    private function getClassStatistics(ExamSeries $examSeries, SchoolClass $class, $stream = null)
    {
        $summariesQuery = $examSeries->termSummaries()
            ->whereHas('student', function($q) use ($class, $stream) {
                $q->where('class_id', $class->id);
                if ($stream) {
                    $q->where('stream_id', $stream->id);
                }
            });

        $summaries = $summariesQuery->get();

        if ($summaries->isEmpty()) {
            return [
                'total_students' => 0,
                'average_percentage' => 0,
                'highest_percentage' => 0,
                'lowest_percentage' => 0,
                'pass_rate' => 0,
            ];
        }

        return [
            'total_students' => $summaries->count(),
            'average_percentage' => round($summaries->avg('average_percentage'), 2),
            'highest_percentage' => round($summaries->max('average_percentage'), 2),
            'lowest_percentage' => round($summaries->min('average_percentage'), 2),
            'pass_rate' => $this->calculateTermPassRate($summaries),
        ];
    }

    private function getClassSubjectAverages(ExamSeries $examSeries, SchoolClass $class, $stream = null)
    {
        $query = DB::table('exam_results')
            ->join('exams', 'exam_results.exam_id', '=', 'exams.id')
            ->join('subjects', 'exams.subject_id', '=', 'subjects.id')
            ->join('students', 'exam_results.student_id', '=', 'students.id')
            ->where('exams.exam_series_id', $examSeries->id)
            ->where('students.class_id', $class->id);

        if ($stream) {
            $query->where('students.stream_id', $stream->id);
        }

        return $query->select([
            'subjects.name as subject_name',
            DB::raw('AVG(exam_results.total_score) as average_score'),
            DB::raw('COUNT(exam_results.id) as student_count')
        ])
        ->groupBy('subjects.id', 'subjects.name')
        ->get()
        ->keyBy('subject_name');
    }

    private function getExamStatistics(Exam $exam, SchoolClass $class, $stream = null)
    {
        $resultsQuery = $exam->results()
            ->whereHas('student', function($q) use ($class, $stream) {
                $q->where('class_id', $class->id);
                if ($stream) {
                    $q->where('stream_id', $stream->id);
                }
            });

        $results = $resultsQuery->get();

        if ($results->isEmpty()) {
            return [
                'total_students' => 0,
                'average_score' => 0,
                'highest_score' => 0,
                'lowest_score' => 0,
                'pass_rate' => 0,
            ];
        }

        return [
            'total_students' => $results->count(),
            'average_score' => round($results->avg('total_score'), 2),
            'highest_score' => $results->max('total_score'),
            'lowest_score' => $results->min('total_score'),
            'pass_rate' => $this->calculatePassRate($results),
        ];
    }

    private function analyzeSubjectPerformanceByClass($exams, $classes)
    {
        $performance = [];

        foreach ($classes as $class) {
            if ($class->streams->count() > 0) {
                foreach ($class->streams as $stream) {
                    $performance[] = [
                        'class' => $class,
                        'stream' => $stream,
                        'statistics' => $this->getSubjectClassStatistics($exams, $class, $stream),
                    ];
                }
            } else {
                $performance[] = [
                    'class' => $class,
                    'stream' => null,
                    'statistics' => $this->getSubjectClassStatistics($exams, $class, null),
                ];
            }
        }

        return $performance;
    }

    private function getSubjectClassStatistics($exams, $class, $stream = null)
    {
        $allResults = collect();

        foreach ($exams as $exam) {
            $results = $exam->results()
                ->whereHas('student', function($q) use ($class, $stream) {
                    $q->where('class_id', $class->id);
                    if ($stream) {
                        $q->where('stream_id', $stream->id);
                    }
                })
                ->get();

            $allResults = $allResults->merge($results);
        }

        if ($allResults->isEmpty()) {
            return [
                'total_students' => 0,
                'average_score' => 0,
                'exam_count' => 0,
            ];
        }

        return [
            'total_students' => $allResults->pluck('student_id')->unique()->count(),
            'average_score' => round($allResults->avg('total_score'), 2),
            'exam_count' => $exams->count(),
        ];
    }

    private function calculatePassRate($results)
    {
        if ($results->isEmpty()) {
            return 0;
        }

        $passCount = $results->filter(function($result) {
            return $result->total_score >= ($result->exam->pass_mark ?? 0);
        })->count();

        return round(($passCount / $results->count()) * 100, 2);
    }

    private function calculateTermPassRate($summaries)
    {
        if ($summaries->isEmpty()) {
            return 0;
        }

        // Consider pass as 50% and above
        $passCount = $summaries->filter(function($summary) {
            return $summary->average_percentage >= 50;
        })->count();

        return round(($passCount / $summaries->count()) * 100, 2);
    }
}