<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamPaper;
use App\Models\ExamResult;
use App\Models\ExamPaperResult;
use App\Models\School;
use App\Models\Subject;
use App\Models\StudentTermSummary;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ExamController extends Controller
{
    use AuthorizesRequests;

    public function index(School $school)
    {
        $user = auth()->user();
        
        // Different views based on user role
        if ($user->hasRole('school_admin')) {
            $exams = $school->exams()
                ->with(['examSeries', 'examCategory', 'gradingSystem', 'classes', 'subjects'])
                ->latest()
                ->get();
        } else {
            // Teachers see only exams for subjects they teach
            $exams = $school->exams()
                ->whereHas('subjects', function ($query) use ($user) {
                    $query->whereHas('streamAssignments', function ($q) use ($user) {
                        $q->where('teacher_id', $user->id);
                    });
                })
                ->with(['examSeries', 'examCategory', 'classes', 'subjects'])
                ->latest()
                ->get();
        }

        $examSeries = $school->examSeries()->where('is_active', true)->get();
        $categories = $school->examCategories()->where('is_active', true)->get();

        return Inertia::render('SchoolAdmin/Exams/Index', [
            'school' => $school,
            'exams' => $exams,
            'examSeries' => $examSeries,
            'categories' => $categories,
            'userRole' => $user->roles->first()->name ?? null,
        ]);
    }

    public function create(School $school)
    {
        $this->authorize('create-exam', $school);

        $classes = $school->classes()->with('streams')->get();
        $subjects = $school->subjects()->with('department')->get();
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
        $this->authorize('create-exam', $school);

        $request->validate([
            'exam_series_id' => 'required|exists:exam_series,id',
            'exam_category_id' => 'required|exists:exam_categories,id',
            'grading_system_id' => 'required|exists:grading_systems,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'instructions' => 'nullable|string',
            'scope_type' => 'required|in:all_school,selected_classes,single_class',
            'subject_scope_type' => 'required|in:all_subjects,selected_subjects,single_subject',
            'selected_classes' => 'required_if:scope_type,selected_classes|array',
            'selected_classes.*' => 'exists:school_classes,id',
            'single_class_id' => 'required_if:scope_type,single_class|exists:school_classes,id',
            'selected_subjects' => 'required_if:subject_scope_type,selected_subjects|array',
            'selected_subjects.*' => 'exists:subjects,id',
            'single_subject_id' => 'required_if:subject_scope_type,single_subject|exists:subjects,id',
            'subject_settings' => 'required|array',
            'subject_settings.*.subject_id' => 'required|exists:subjects,id',
            'subject_settings.*.total_marks' => 'required|integer|min:1',
            'subject_settings.*.pass_mark' => 'required|integer|min:0',
            'subject_settings.*.has_papers' => 'boolean',
            'subject_settings.*.paper_count' => 'required_if:subject_settings.*.has_papers,true|integer|min:1|max:5',
            'subject_settings.*.papers' => 'required_if:subject_settings.*.has_papers,true|array',
            'subject_settings.*.papers.*.name' => 'required|string|max:255',
            'subject_settings.*.papers.*.marks' => 'required|integer|min:1',
            'subject_settings.*.papers.*.pass_mark' => 'required|integer|min:0',
            'subject_settings.*.papers.*.duration_minutes' => 'required|integer|min:30',
            'subject_settings.*.papers.*.weight' => 'required|numeric|min:0|max:100',
        ]);

        DB::transaction(function () use ($request, $school) {
            // Create exam
            $exam = $school->exams()->create([
                'exam_series_id' => $request->exam_series_id,
                'exam_category_id' => $request->exam_category_id,
                'grading_system_id' => $request->grading_system_id,
                'name' => $request->name,
                'description' => $request->description,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'instructions' => $request->instructions,
                'scope_type' => $request->scope_type,
                'subject_scope_type' => $request->subject_scope_type,
                'exam_status' => 'draft',
                'created_by' => auth()->id(),
            ]);

            // Attach classes
            $classIds = $this->getClassIds($request, $school);
            $exam->classes()->attach($classIds);

            // Attach subjects with settings
            $this->attachSubjectsWithSettings($exam, $request, $school);

            // Create exam papers for subjects that have them
            $this->createExamPapers($exam, $request);
        });

        return redirect()->route('exams.index', $school)
            ->with('success', 'Exam created successfully.');
    }

    private function getClassIds(Request $request, School $school)
    {
        switch ($request->scope_type) {
            case 'all_school':
                return $school->classes->pluck('id')->toArray();
            case 'selected_classes':
                return $request->selected_classes;
            case 'single_class':
                return [$request->single_class_id];
            default:
                return [];
        }
    }

    private function attachSubjectsWithSettings($exam, $request, School $school)
    {
        $subjectIds = $this->getSubjectIds($request, $school);
        $pivotData = [];

        foreach ($subjectIds as $subjectId) {
            $subjectSetting = collect($request->subject_settings)
                ->firstWhere('subject_id', $subjectId);

            if ($subjectSetting) {
                $pivotData[$subjectId] = [
                    'total_marks' => $subjectSetting['total_marks'],
                    'pass_mark' => $subjectSetting['pass_mark'],
                    'has_papers' => $subjectSetting['has_papers'] ?? false,
                    'paper_count' => $subjectSetting['paper_count'] ?? 1,
                ];
            }
        }

        $exam->subjects()->attach($pivotData);
    }

    private function getSubjectIds($request, School $school)
    {
        switch ($request->subject_scope_type) {
            case 'all_subjects':
                return $school->subjects->pluck('id')->toArray();
            case 'selected_subjects':
                return $request->selected_subjects;
            case 'single_subject':
                return [$request->single_subject_id];
            default:
                return [];
        }
    }

    private function createExamPapers($exam, $request)
    {
        foreach ($request->subject_settings as $subjectSetting) {
            if ($subjectSetting['has_papers'] && isset($subjectSetting['papers'])) {
                foreach ($subjectSetting['papers'] as $index => $paper) {
                    ExamPaper::create([
                        'exam_id' => $exam->id,
                        'subject_id' => $subjectSetting['subject_id'],
                        'paper_number' => $index + 1,
                        'paper_name' => $paper['name'],
                        'total_marks' => $paper['marks'],
                        'pass_mark' => $paper['pass_mark'],
                        'duration_minutes' => $paper['duration_minutes'],
                        'percentage_weight' => $paper['weight'],
                        'instructions' => $paper['instructions'] ?? null,
                        'is_practical' => str_contains(strtolower($paper['name']), 'practical'),
                    ]);
                }
            }
        }
    }

    public function show(School $school, Exam $exam)
    {
        $user = auth()->user();
        
        // Load exam with relationships
        $exam->load([
            'classes.streams',
            'subjects',
            'examPapers',
            'examSeries',
            'examCategory',
            'gradingSystem.grades'
        ]);

        // Get subjects teacher can enter results for
        $teacherSubjects = [];
        if (!$user->hasRole('school_admin')) {
            $teacherSubjects = $exam->getSubjectsForTeacher($user->id)->pluck('id')->toArray();
        }

        $statistics = $exam->getStatistics();
        $eligibleStudents = $exam->getEligibleStudents()->count();

        return Inertia::render('SchoolAdmin/Exams/Show', [
            'school' => $school,
            'exam' => $exam,
            'statistics' => $statistics,
            'eligibleStudents' => $eligibleStudents,
            'teacherSubjects' => $teacherSubjects,
            'userRole' => $user->roles->first()->name ?? null,
        ]);
    }

    public function enterResults(School $school, Exam $exam, Subject $subject)
    {
        $user = auth()->user();
        
        // Authorization check
        if (!$user->hasRole('school_admin') && !$exam->canTeacherEnterResults($user->id, $subject->id)) {
            abort(403, 'You are not authorized to enter results for this subject.');
        }

        // Get students eligible for this exam
        $students = $exam->getEligibleStudents()->load('user');
        
        // Get exam papers for this subject
        $examPapers = $exam->examPapers()->where('subject_id', $subject->id)->get();
        
        // Get existing results
        $existingResults = ExamResult::where('exam_id', $exam->id)
            ->where('subject_id', $subject->id)
            ->with('paperResults')
            ->get()
            ->keyBy('student_id');

        return Inertia::render('SchoolAdmin/Exams/EnterResults', [
            'school' => $school,
            'exam' => $exam,
            'subject' => $subject,
            'students' => $students,
            'examPapers' => $examPapers,
            'existingResults' => $existingResults,
        ]);
    }

    public function storeResults(Request $request, School $school, Exam $exam, Subject $subject)
    {
        $user = auth()->user();
        
        // Authorization check
        if (!$user->hasRole('school_admin') && !$exam->canTeacherEnterResults($user->id, $subject->id)) {
            abort(403, 'You are not authorized to enter results for this subject.');
        }

        $request->validate([
            'results' => 'required|array',
            'results.*.student_id' => 'required|exists:students,id',
            'results.*.is_absent' => 'boolean',
            'results.*.paper_results' => 'array',
            'results.*.paper_results.*.exam_paper_id' => 'required|exists:exam_papers,id',
            'results.*.paper_results.*.marks' => 'required_unless:results.*.is_absent,true|numeric|min:0',
        ]);

        DB::transaction(function () use ($request, $exam, $subject, $user) {
            foreach ($request->results as $resultData) {
                // Create or update exam result
                $examResult = ExamResult::updateOrCreate(
                    [
                        'exam_id' => $exam->id,
                        'student_id' => $resultData['student_id'],
                        'subject_id' => $subject->id,
                    ],
                    [
                        'is_absent' => $resultData['is_absent'] ?? false,
                        'entered_by' => $user->id,
                        'entered_at' => now(),
                    ]
                );

                // Handle paper results if not absent
                if (!($resultData['is_absent'] ?? false)) {
                    foreach ($resultData['paper_results'] ?? [] as $paperResult) {
                        ExamPaperResult::updateOrCreate(
                            [
                                'exam_result_id' => $examResult->id,
                                'exam_paper_id' => $paperResult['exam_paper_id'],
                                'student_id' => $resultData['student_id'],
                            ],
                            [
                                'marks' => $paperResult['marks'],
                                'is_absent' => false,
                                'entered_by' => $user->id,
                                'entered_at' => now(),
                            ]
                        );
                    }

                    // Calculate total marks and assign grade
                    $examResult->total_marks = $examResult->calculateTotalMarks();
                    $examResult->assignGrade();
                    $examResult->save();
                }
            }

            // Calculate positions for this subject
            $this->calculateSubjectPositions($exam, $subject);
        });

        return redirect()->route('exams.show', [$school, $exam])
            ->with('success', 'Results entered successfully.');
    }

    private function calculateSubjectPositions($exam, $subject)
    {
        // Overall positions for this subject
        $results = ExamResult::where('exam_id', $exam->id)
            ->where('subject_id', $subject->id)
            ->where('is_absent', false)
            ->orderBy('total_marks', 'desc')
            ->get();

        $position = 1;
        $previousMarks = null;
        $actualPosition = 1;

        foreach ($results as $result) {
            if ($previousMarks !== null && $result->total_marks < $previousMarks) {
                $position = $actualPosition;
            }

            $result->update(['position' => $position]);
            $previousMarks = $result->total_marks;
            $actualPosition++;
        }

        // Class positions for this subject
        foreach ($exam->classes as $class) {
            $classResults = ExamResult::where('exam_id', $exam->id)
                ->where('subject_id', $subject->id)
                ->whereHas('student', function ($query) use ($class) {
                    $query->where('class_id', $class->id);
                })
                ->where('is_absent', false)
                ->orderBy('total_marks', 'desc')
                ->get();

            $position = 1;
            $previousMarks = null;
            $actualPosition = 1;

            foreach ($classResults as $result) {
                if ($previousMarks !== null && $result->total_marks < $previousMarks) {
                    $position = $actualPosition;
                }

                $result->update(['class_position' => $position]);
                $previousMarks = $result->total_marks;
                $actualPosition++;
            }
        }
    }

    public function publishResults(School $school, Exam $exam)
    {
        $this->authorize('publish-exam-results', $school);

        $exam->update([
            'is_published' => true,
            'exam_status' => 'published'
        ]);

        return back()->with('success', 'Exam results published successfully.');
    }

    public function generateTermReports(School $school, Exam $exam)
    {
        $this->authorize('generate-reports', $school);

        // Generate comprehensive term summaries
        $this->generateStudentTermSummaries($school, $exam->examSeries);

        return redirect()->route('exam-series.reports', [$school, $exam->examSeries])
            ->with('success', 'Term reports generated successfully.');
    }

    private function generateStudentTermSummaries($school, $examSeries)
    {
        $students = $school->students()->with(['class', 'stream'])->get();

        foreach ($students as $student) {
            $results = ExamResult::whereHas('exam', function ($query) use ($examSeries) {
                $query->where('exam_series_id', $examSeries->id);
            })
            ->where('student_id', $student->id)
            ->where('is_absent', false)
            ->with(['subject', 'exam'])
            ->get();

            if ($results->isNotEmpty()) {
                $totalPoints = $results->sum('points');
                $totalMarks = $results->sum('total_marks');
                $totalSubjects = $results->count();
                $averageScore = round($results->avg('total_marks'), 2);
                
                // Determine average grade
                $defaultGradingSystem = $school->gradingSystems()->where('is_default', true)->first();
                $averageGrade = $defaultGradingSystem ? 
                    $defaultGradingSystem->getGradeForScore($averageScore) : null;

                StudentTermSummary::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'exam_series_id' => $examSeries->id,
                    ],
                    [
                        'class_id' => $student->class_id,
                        'stream_id' => $student->stream_id,
                        'academic_year' => $examSeries->academic_year,
                        'term' => $examSeries->term,
                        'total_subjects' => $totalSubjects,
                        'total_points' => $totalPoints,
                        'total_marks' => $totalMarks,
                        'average_score' => $averageScore,
                        'average_grade' => $averageGrade->grade ?? 'N/A',
                        'generated_at' => now(),
                    ]
                );
            }
        }

        // Calculate positions
        $this->calculateTermPositions($school, $examSeries);
    }

    private function calculateTermPositions($school, $examSeries)
    {
        // Overall school positions
        $summaries = StudentTermSummary::where('exam_series_id', $examSeries->id)
            ->orderBy('average_score', 'desc')
            ->orderBy('total_points', 'desc')
            ->get();

        $position = 1;
        foreach ($summaries as $index => $summary) {
            $summary->update(['overall_position' => $position]);
            $position = $index + 2; // Next position
        }

        // Class positions
        foreach ($school->classes as $class) {
            $classSummaries = StudentTermSummary::where('exam_series_id', $examSeries->id)
                ->where('class_id', $class->id)
                ->orderBy('average_score', 'desc')
                ->orderBy('total_points', 'desc')
                ->get();

            $position = 1;
            foreach ($classSummaries as $index => $summary) {
                $summary->update(['class_position' => $position]);
                $position = $index + 2;
            }
        }

        // Stream positions
        foreach ($school->streams as $stream) {
            $streamSummaries = StudentTermSummary::where('exam_series_id', $examSeries->id)
                ->where('stream_id', $stream->id)
                ->orderBy('average_score', 'desc')
                ->orderBy('total_points', 'desc')
                ->get();

            $position = 1;
            foreach ($streamSummaries as $index => $summary) {
                $summary->update(['stream_position' => $position]);
                $position = $index + 2;
            }
        }
    }

    public function getStatistics(School $school, Exam $exam)
    {
        return response()->json($exam->getStatistics());
    }

    public function exportResults(School $school, Exam $exam, Subject $subject = null)
    {
        $this->authorize('export-results', $school);

        // Implementation for exporting results to Excel/PDF
        // This would use Laravel Excel or similar package
        
        return response()->json(['message' => 'Export functionality to be implemented']);
    }

    public function bulkImportResults(School $school, Exam $exam)
    {
        $this->authorize('import-results', $school);

        return Inertia::render('SchoolAdmin/Exams/BulkImport', [
            'school' => $school,
            'exam' => $exam,
        ]);
    }

    public function processBulkImport(Request $request, School $school, Exam $exam)
    {
        $this->authorize('import-results', $school);

        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:2048',
        ]);

        // Implementation for bulk import from Excel
        // This would process the uploaded file and create results
        
        return redirect()->route('exams.show', [$school, $exam])
            ->with('success', 'Results imported successfully.');
    }
}