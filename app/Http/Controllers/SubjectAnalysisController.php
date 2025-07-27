<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\Subject;
use App\Models\ExamSeries;
use App\Models\Exam;
use App\Models\SchoolClass;
use App\Models\Stream;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class SubjectAnalysisController extends Controller
{
    public function index(School $school)
    {
        $subjects = $school->subjects()->get();
        $examSeries = $school->examSeries()->latest()->get();
        $classes = $school->classes()->with('streams')->get();

        return Inertia::render('SchoolAdmin/Analysis/Subjects/Index', [
            'school' => $school,
            'subjects' => $subjects,
            'examSeries' => $examSeries,
            'classes' => $classes,
        ]);
    }

    public function subjectOverview(School $school, Subject $subject, Request $request)
    {
        $examSeriesId = $request->get('exam_series_id');
        $classId = $request->get('class_id');
        $streamId = $request->get('stream_id');

        // Get exams for this subject
        $examsQuery = Exam::where('school_id', $school->id)
            ->where('subject_id', $subject->id);

        if ($examSeriesId) {
            $examsQuery->where('exam_series_id', $examSeriesId);
        }

        if ($classId) {
            $examsQuery->where('class_id', $classId);
        }

        if ($streamId) {
            $examsQuery->where('stream_id', $streamId);
        }

        $exams = $examsQuery->with(['results', 'class', 'stream', 'examSeries'])
            ->latest()
            ->get();

        // Calculate overall statistics
        $overallStats = $this->calculateSubjectStatistics($exams);

        // Performance by class
        $classPerfomance = $this->getSubjectPerformanceByClass($school, $subject, $examSeriesId);

        // Performance trends
        $performanceTrends = $this->getSubjectPerformanceTrends($school, $subject);

        // Grade distribution
        $gradeDistribution = $this->getSubjectGradeDistribution($exams);

        return Inertia::render('SchoolAdmin/Analysis/Subjects/Overview', [
            'school' => $school,
            'subject' => $subject,
            'exams' => $exams,
            'overallStats' => $overallStats,
            'classPerformance' => $classPerfomance,
            'performanceTrends' => $performanceTrends,
            'gradeDistribution' => $gradeDistribution,
            'filters' => [
                'exam_series_id' => $examSeriesId,
                'class_id' => $classId,
                'stream_id' => $streamId,
            ],
        ]);
    }

    public function compareSubjects(School $school, Request $request)
    {
        $request->validate([
            'subject_ids' => 'required|array|min:2',
            'subject_ids.*' => 'exists:subjects,id',
            'exam_series_id' => 'nullable|exists:exam_series,id',
        ]);

        $subjects = Subject::whereIn('id', $request->subject_ids)->get();
        $examSeriesId = $request->exam_series_id;

        $comparison = [];

        foreach ($subjects as $subject) {
            $examsQuery = Exam::where('school_id', $school->id)
                ->where('subject_id', $subject->id);

            if ($examSeriesId) {
                $examsQuery->where('exam_series_id', $examSeriesId);
            }

            $exams = $examsQuery->with('results')->get();
            $stats = $this->calculateSubjectStatistics($exams);

            $comparison[] = [
                'subject' => $subject,
                'statistics' => $stats,
                'class_performance' => $this->getSubjectPerformanceByClass($school, $subject, $examSeriesId),
            ];
        }

        return Inertia::render('SchoolAdmin/Analysis/Subjects/Compare', [
            'school' => $school,
            'subjects' => $subjects,
            'comparison' => $comparison,
            'examSeriesId' => $examSeriesId,
        ]);
    }

    public function weakPerformers(School $school, Subject $subject, Request $request)
    {
        $examSeriesId = $request->get('exam_series_id');
        $threshold = $request->get('threshold', 50); // Default 50%

        // Get students performing below threshold
        $weakPerformers = DB::table('exam_results')
            ->join('exams', 'exam_results.exam_id', '=', 'exams.id')
            ->join('students', 'exam_results.student_id', '=', 'students.id')
            ->join('users', 'students.user_id', '=', 'users.id')
            ->join('school_classes', 'students.class_id', '=', 'school_classes.id')
            ->leftJoin('streams', 'students.stream_id', '=', 'streams.id')
            ->where('exams.school_id', $school->id)
            ->where('exams.subject_id', $subject->id)
            ->where('exam_results.is_absent', false)
            ->whereRaw('(exam_results.total_score / exams.total_marks * 100) < ?', [$threshold]);

        if ($examSeriesId) {
            $weakPerformers->where('exams.exam_series_id', $examSeriesId);
        }

        $results = $weakPerformers->select([
            'students.id as student_id',
            'users.name as student_name',
            'school_classes.name as class_name',
            'streams.name as stream_name',
            DB::raw('AVG(exam_results.total_score / exams.total_marks * 100) as average_percentage'),
            DB::raw('COUNT(exam_results.id) as exam_count')
        ])
        ->groupBy('students.id', 'users.name', 'school_classes.name', 'streams.name')
        ->having('average_percentage', '<', $threshold)
        ->orderBy('average_percentage')
        ->get();

        return Inertia::render('SchoolAdmin/Analysis/Subjects/WeakPerformers', [
            'school' => $school,
            'subject' => $subject,
            'weakPerformers' => $results,
            'threshold' => $threshold,
            'examSeriesId' => $examSeriesId,
        ]);
    }

    public function topPerformers(School $school, Subject $subject, Request $request)
    {
        $examSeriesId = $request->get('exam_series_id');
        $limit = $request->get('limit', 20);

        // Get top performing students
        $topPerformers = DB::table('exam_results')
            ->join('exams', 'exam_results.exam_id', '=', 'exams.id')
            ->join('students', 'exam_results.student_id', '=', 'students.id')
            ->join('users', 'students.user_id', '=', 'users.id')
            ->join('school_classes', 'students.class_id', '=', 'school_classes.id')
            ->leftJoin('streams', 'students.stream_id', '=', 'streams.id')
            ->where('exams.school_id', $school->id)
            ->where('exams.subject_id', $subject->id)
            ->where('exam_results.is_absent', false);

        if ($examSeriesId) {
            $topPerformers->where('exams.exam_series_id', $examSeriesId);
        }

        $results = $topPerformers->select([
            'students.id as student_id',
            'users.name as student_name',
            'school_classes.name as class_name',
            'streams.name as stream_name',
            DB::raw('AVG(exam_results.total_score / exams.total_marks * 100) as average_percentage'),
            DB::raw('COUNT(exam_results.id) as exam_count'),
            DB::raw('MAX(exam_results.total_score / exams.total_marks * 100) as highest_percentage')
        ])
        ->groupBy('students.id', 'users.name', 'school_classes.name', 'streams.name')
        ->orderBy('average_percentage', 'desc')
        ->limit($limit)
        ->get();

        return Inertia::render('SchoolAdmin/Analysis/Subjects/TopPerformers', [
            'school' => $school,
            'subject' => $subject,
            'topPerformers' => $results,
            'limit' => $limit,
            'examSeriesId' => $examSeriesId,
        ]);
    }

    public function difficultyAnalysis(School $school, Subject $subject, Request $request)
    {
        $examSeriesId = $request->get('exam_series_id');

        // Get exams and their difficulty based on average scores
        $examsQuery = Exam::where('school_id', $school->id)
            ->where('subject_id', $subject->id)
            ->with(['results', 'examSeries']);

        if ($examSeriesId) {
            $examsQuery->where('exam_series_id', $examSeriesId);
        }

        $exams = $examsQuery->get();

        $difficultyAnalysis = $exams->map(function ($exam) {
            $results = $exam->results->where('is_absent', false);
            
            if ($results->isEmpty()) {
                return null;
            }

            $averagePercentage = $results->avg(function ($result) use ($exam) {
                return ($result->total_score / $exam->total_marks) * 100;
            });

            $difficulty = 'Medium';
            if ($averagePercentage >= 75) {
                $difficulty = 'Easy';
            } elseif ($averagePercentage < 50) {
                $difficulty = 'Hard';
            }

            return [
                'exam' => $exam,
                'average_percentage' => round($averagePercentage, 2),
                'difficulty' => $difficulty,
                'student_count' => $results->count(),
                'pass_rate' => $this->calculatePassRate($results->values()),
            ];
        })->filter()->values();

        return Inertia::render('SchoolAdmin/Analysis/Subjects/DifficultyAnalysis', [
            'school' => $school,
            'subject' => $subject,
            'difficultyAnalysis' => $difficultyAnalysis,
            'examSeriesId' => $examSeriesId,
        ]);
    }

    private function calculateSubjectStatistics($exams)
    {
        $allResults = collect();
        
        foreach ($exams as $exam) {
            $results = $exam->results->where('is_absent', false);
            $allResults = $allResults->merge($results);
        }

        if ($allResults->isEmpty()) {
            return [
                'total_exams' => $exams->count(),
                'total_students' => 0,
                'average_percentage' => 0,
                'pass_rate' => 0,
                'grade_distribution' => [],
            ];
        }

        $totalStudents = $allResults->pluck('student_id')->unique()->count();
        $averagePercentage = $allResults->avg(function ($result) {
            return ($result->total_score / $result->exam->total_marks) * 100;
        });

        return [
            'total_exams' => $exams->count(),
            'total_students' => $totalStudents,
            'average_percentage' => round($averagePercentage, 2),
            'pass_rate' => $this->calculatePassRate($allResults),
            'grade_distribution' => $allResults->groupBy('grade')->map->count(),
        ];
    }

    private function getSubjectPerformanceByClass($school, $subject, $examSeriesId = null)
    {
        $classes = $school->classes()->with('streams')->get();
        $performance = [];

        foreach ($classes as $class) {
            if ($class->streams->count() > 0) {
                foreach ($class->streams as $stream) {
                    $stats = $this->getClassStreamSubjectStats($school, $subject, $class, $stream, $examSeriesId);
                    if ($stats['student_count'] > 0) {
                        $performance[] = [
                            'class' => $class,
                            'stream' => $stream,
                            'statistics' => $stats,
                        ];
                    }
                }
            } else {
                $stats = $this->getClassStreamSubjectStats($school, $subject, $class, null, $examSeriesId);
                if ($stats['student_count'] > 0) {
                    $performance[] = [
                        'class' => $class,
                        'stream' => null,
                        'statistics' => $stats,
                    ];
                }
            }
        }

        return $performance;
    }

    private function getClassStreamSubjectStats($school, $subject, $class, $stream = null, $examSeriesId = null)
    {
        $query = DB::table('exam_results')
            ->join('exams', 'exam_results.exam_id', '=', 'exams.id')
            ->join('students', 'exam_results.student_id', '=', 'students.id')
            ->where('exams.school_id', $school->id)
            ->where('exams.subject_id', $subject->id)
            ->where('students.class_id', $class->id)
            ->where('exam_results.is_absent', false);

        if ($stream) {
            $query->where('students.stream_id', $stream->id);
        }

        if ($examSeriesId) {
            $query->where('exams.exam_series_id', $examSeriesId);
        }

        $results = $query->select([
            'exam_results.total_score',
            'exams.total_marks',
            'exam_results.grade'
        ])->get();

        if ($results->isEmpty()) {
            return [
                'student_count' => 0,
                'average_percentage' => 0,
                'pass_rate' => 0,
            ];
        }

        $averagePercentage = $results->avg(function ($result) {
            return ($result->total_score / $result->total_marks) * 100;
        });

        return [
            'student_count' => $results->count(),
            'average_percentage' => round($averagePercentage, 2),
            'pass_rate' => $this->calculatePassRate($results),
        ];
    }

    private function getSubjectPerformanceTrends($school, $subject)
    {
        $examSeries = ExamSeries::where('school_id', $school->id)
            ->orderBy('year', 'desc')
            ->orderBy('term', 'desc')
            ->take(5)
            ->get();

        $trends = [];

        foreach ($examSeries as $series) {
            $exams = Exam::where('school_id', $school->id)
                ->where('subject_id', $subject->id)
                ->where('exam_series_id', $series->id)
                ->with('results')
                ->get();

            $stats = $this->calculateSubjectStatistics($exams);

            $trends[] = [
                'exam_series' => $series,
                'statistics' => $stats,
            ];
        }

        return $trends;
    }

    private function getSubjectGradeDistribution($exams)
    {
        $allResults = collect();
        
        foreach ($exams as $exam) {
            $results = $exam->results->where('is_absent', false);
            $allResults = $allResults->merge($results);
        }

        return $allResults->groupBy('grade')->map->count()->toArray();
    }

    private function calculatePassRate($results)
    {
        if ($results->isEmpty()) {
            return 0;
        }

        $passCount = $results->filter(function ($result) {
            $percentage = ($result->total_score / $result->total_marks) * 100;
            return $percentage >= 50; // Assuming 50% is pass mark
        })->count();

        return round(($passCount / $results->count()) * 100, 2);
    }
}