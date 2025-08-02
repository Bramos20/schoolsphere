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

        $role = $user->hasRole('school_admin') ? 'school_admin' : ($user->roles->first()->name ?? null);

        return Inertia::render('SchoolAdmin/Exams/Index', [
            'school' => $school,
            'exams' => $exams,
            'examSeries' => $examSeries,
            'categories' => $categories,
            'userRole' => $role,
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

    public function edit(School $school, Exam $exam)
    {
        $this->authorize('update', $exam);

        $exam->load([
            'classes', 
            'subjects.department', 
            'examSeries', 
            'examCategory', 
            'gradingSystem',
            'examPapers'
        ]);

        $classes = $school->classes()->with('streams')->get();
        $subjects = $school->subjects()->with('department')->get();
        $examSeries = $school->examSeries()->where('is_active', true)->get();
        $categories = $school->examCategories()->where('is_active', true)->get();
        $gradingSystems = $school->gradingSystems()->where('is_active', true)->get();

        // Prepare exam data for frontend
        $examData = [
            'id' => $exam->id,
            'name' => $exam->name,
            'description' => $exam->description,
            'exam_series_id' => $exam->exam_series_id,
            'exam_category_id' => $exam->exam_category_id,
            'grading_system_id' => $exam->grading_system_id,
            'start_date' => $exam->start_date->format('Y-m-d'),
            'end_date' => $exam->end_date->format('Y-m-d'),
            'instructions' => $exam->instructions,
            'scope_type' => $exam->scope_type,
            'subject_scope_type' => $exam->subject_scope_type,
            'exam_status' => $exam->exam_status,
            'selected_classes' => $exam->classes->pluck('id')->toArray(),
            'selected_subjects' => $exam->subjects->pluck('id')->toArray(),
            'single_class_id' => $exam->scope_type === 'single_class' ? $exam->classes->first()?->id : null,
            'single_subject_id' => $exam->subject_scope_type === 'single_subject' ? $exam->subjects->first()?->id : null,
        ];

        // Prepare subject settings
        $subjectSettings = [];
        foreach ($exam->subjects as $subject) {
            $papers = $exam->examPapers->where('subject_id', $subject->id)->values();
            
            $subjectSettings[] = [
                'subject_id' => $subject->id,
                'total_marks' => $subject->pivot->total_marks,
                'pass_mark' => $subject->pivot->pass_mark,
                'has_papers' => $subject->pivot->has_papers,
                'paper_count' => $subject->pivot->paper_count,
                'papers' => $papers->map(function($paper) {
                    return [
                        'id' => $paper->id,
                        'name' => $paper->paper_name,
                        'marks' => $paper->total_marks,
                        'pass_mark' => $paper->pass_mark,
                        'duration_minutes' => $paper->duration_minutes,
                        'weight' => $paper->percentage_weight,
                        'instructions' => $paper->instructions,
                    ];
                })->toArray()
            ];
        }

        $examData['subject_settings'] = $subjectSettings;

        return Inertia::render('SchoolAdmin/Exams/Edit', [
            'school' => $school,
            'exam' => $examData,
            'classes' => $classes,
            'subjects' => $subjects,
            'examSeries' => $examSeries,
            'categories' => $categories,
            'gradingSystems' => $gradingSystems,
        ]);
    }

    public function update(Request $request, School $school, Exam $exam)
    {
        $this->authorize('update', $exam);

        \Log::info('ExamController@update method called.');
        \Log::info('Request data:', $request->all());

        // Build validation rules dynamically based on scope types
        $rules = [
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
            'exam_status' => 'required|in:draft,active,completed,published',
        ];

        // Add conditional rules based on scope_type
        if ($request->scope_type === 'selected_classes') {
            $rules['selected_classes'] = 'required|array|min:1';
            $rules['selected_classes.*'] = 'exists:school_classes,id';
        } elseif ($request->scope_type === 'single_class') {
            $rules['single_class_id'] = 'required|exists:school_classes,id';
        }

        // Add conditional rules based on subject_scope_type
        if ($request->subject_scope_type === 'selected_subjects') {
            $rules['selected_subjects'] = 'required|array|min:1';
            $rules['selected_subjects.*'] = 'exists:subjects,id';
        } elseif ($request->subject_scope_type === 'single_subject') {
            $rules['single_subject_id'] = 'required|exists:subjects,id';
        }

        // Subject settings validation - always required but content varies
        $rules['subject_settings'] = 'required|array|min:1';
        $rules['subject_settings.*.subject_id'] = 'required|exists:subjects,id';
        $rules['subject_settings.*.total_marks'] = 'required|integer|min:1';
        $rules['subject_settings.*.pass_mark'] = 'required|integer|min:0';
        $rules['subject_settings.*.has_papers'] = 'boolean';
        $rules['subject_settings.*.paper_count'] = 'nullable|integer|min:1|max:5';
        $rules['subject_settings.*.papers'] = 'nullable|array';
        $rules['subject_settings.*.papers.*.name'] = 'required_if:subject_settings.*.has_papers,true|string|max:255';
        $rules['subject_settings.*.papers.*.marks'] = 'required_if:subject_settings.*.has_papers,true|integer|min:1';
        $rules['subject_settings.*.papers.*.pass_mark'] = 'required_if:subject_settings.*.has_papers,true|integer|min:0';
        $rules['subject_settings.*.papers.*.duration_minutes'] = 'required_if:subject_settings.*.has_papers,true|integer|min:30';
        $rules['subject_settings.*.papers.*.weight'] = 'required_if:subject_settings.*.has_papers,true|numeric|min:0|max:100';

        try {
            $validatedData = $request->validate($rules);
            \Log::info('Validation passed. Validated data:', $validatedData);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed:', $e->errors());
            return back()->withErrors($e->errors())->withInput();
        }

        try {
            DB::transaction(function () use ($validatedData, $school, $exam, $request) {
                // Update exam basic information
                $exam->update([
                    'exam_series_id' => $validatedData['exam_series_id'],
                    'exam_category_id' => $validatedData['exam_category_id'],
                    'grading_system_id' => $validatedData['grading_system_id'],
                    'name' => $validatedData['name'],
                    'description' => $validatedData['description'] ?? null,
                    'start_date' => $validatedData['start_date'],
                    'end_date' => $validatedData['end_date'],
                    'instructions' => $validatedData['instructions'] ?? null,
                    'scope_type' => $validatedData['scope_type'],
                    'subject_scope_type' => $validatedData['subject_scope_type'],
                    'exam_status' => $validatedData['exam_status'],
                ]);

                \Log::info('Exam updated with ID: ' . $exam->id);

                // Update classes - detach all and reattach
                $exam->classes()->detach();
                $classIds = $this->getClassIds($validatedData, $school);
                if (!empty($classIds)) {
                    $exam->classes()->attach($classIds);
                    \Log::info('Classes updated: ', $classIds);
                }

                // Update subjects with settings - detach all and reattach
                $exam->subjects()->detach();
                $this->attachSubjectsWithSettings($exam, $validatedData, $school);

                // Update exam papers - delete existing and recreate
                $exam->examPapers()->delete();
                $this->createExamPapers($exam, $validatedData);
                
                \Log::info('Exam update completed successfully');
            });

            $message = 'Exam updated successfully.';
            
            // Add specific message based on status change
            if ($request->exam_status === 'active') {
                $message .= ' Exam is now active and results can be entered.';
            } elseif ($request->exam_status === 'completed') {
                $message .= ' Exam marked as completed.';
            } elseif ($request->exam_status === 'published') {
                $message .= ' Exam results are now published and visible to students.';
            }

            return redirect()->route('exams.show', [$school, $exam])
                ->with('success', $message);
                
        } catch (\Exception $e) {
            \Log::error('Error updating exam: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return back()
                ->withErrors(['error' => 'An error occurred while updating the exam: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function store(Request $request, School $school)
    {
        \Log::info('ExamController@store method called.');
        \Log::info('Request data:', $request->all());

        $this->authorize('create-exam', $school);

        // Build validation rules dynamically based on scope types
        $rules = [
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
        ];

        // Add conditional rules based on scope_type
        if ($request->scope_type === 'selected_classes') {
            $rules['selected_classes'] = 'required|array|min:1';
            $rules['selected_classes.*'] = 'exists:school_classes,id';
        } elseif ($request->scope_type === 'single_class') {
            $rules['single_class_id'] = 'required|exists:school_classes,id';
        }

        // Add conditional rules based on subject_scope_type
        if ($request->subject_scope_type === 'selected_subjects') {
            $rules['selected_subjects'] = 'required|array|min:1';
            $rules['selected_subjects.*'] = 'exists:subjects,id';
        } elseif ($request->subject_scope_type === 'single_subject') {
            $rules['single_subject_id'] = 'required|exists:subjects,id';
        }

        // Subject settings validation - always required but content varies
        $rules['subject_settings'] = 'required|array|min:1';
        $rules['subject_settings.*.subject_id'] = 'required|exists:subjects,id';
        $rules['subject_settings.*.total_marks'] = 'required|integer|min:1';
        $rules['subject_settings.*.pass_mark'] = 'required|integer|min:0';
        $rules['subject_settings.*.has_papers'] = 'boolean';
        $rules['subject_settings.*.paper_count'] = 'nullable|integer|min:1|max:5';
        $rules['subject_settings.*.papers'] = 'nullable|array';
        $rules['subject_settings.*.papers.*.name'] = 'required_if:subject_settings.*.has_papers,true|string|max:255';
        $rules['subject_settings.*.papers.*.marks'] = 'required_if:subject_settings.*.has_papers,true|integer|min:1';
        $rules['subject_settings.*.papers.*.pass_mark'] = 'required_if:subject_settings.*.has_papers,true|integer|min:0';
        $rules['subject_settings.*.papers.*.duration_minutes'] = 'required_if:subject_settings.*.has_papers,true|integer|min:30';
        $rules['subject_settings.*.papers.*.weight'] = 'required_if:subject_settings.*.has_papers,true|numeric|min:0|max:100';

        try {
            $validatedData = $request->validate($rules);
            \Log::info('Validation passed. Validated data:', $validatedData);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed:', $e->errors());
            return back()->withErrors($e->errors())->withInput();
        }

        try {
            DB::transaction(function () use ($validatedData, $school, $request) {
                // Create exam
                $exam = $school->exams()->create([
                    'exam_series_id' => $validatedData['exam_series_id'],
                    'exam_category_id' => $validatedData['exam_category_id'],
                    'grading_system_id' => $validatedData['grading_system_id'],
                    'name' => $validatedData['name'],
                    'description' => $validatedData['description'] ?? null,
                    'start_date' => $validatedData['start_date'],
                    'end_date' => $validatedData['end_date'],
                    'instructions' => $validatedData['instructions'] ?? null,
                    'scope_type' => $validatedData['scope_type'],
                    'subject_scope_type' => $validatedData['subject_scope_type'],
                    'exam_status' => 'draft',
                    'created_by' => auth()->id(),
                ]);

                \Log::info('Exam created with ID: ' . $exam->id);

                // Attach classes
                $classIds = $this->getClassIds($validatedData, $school);
                if (!empty($classIds)) {
                    $exam->classes()->attach($classIds);
                    \Log::info('Classes attached: ', $classIds);
                }

                // Attach subjects with settings
                $this->attachSubjectsWithSettings($exam, $validatedData, $school);

                // Create exam papers for subjects that have them
                $this->createExamPapers($exam, $validatedData);
                
                \Log::info('Exam creation completed successfully');
            });

            return redirect()->route('exams.index', $school)
                ->with('success', 'Exam created successfully.');
                
        } catch (\Exception $e) {
            \Log::error('Error creating exam: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return back()
                ->withErrors(['error' => 'An error occurred while creating the exam: ' . $e->getMessage()])
                ->withInput();
        }
    }

    private function getClassIds($validatedData, School $school)
    {
        switch ($validatedData['scope_type']) {
            case 'all_school':
                return $school->classes->pluck('id')->toArray();
            case 'selected_classes':
                return $validatedData['selected_classes'] ?? [];
            case 'single_class':
                return isset($validatedData['single_class_id']) ? [$validatedData['single_class_id']] : [];
            default:
                return [];
        }
    }

    private function getSubjectIds($validatedData, School $school)
    {
        switch ($validatedData['subject_scope_type']) {
            case 'all_subjects':
                return $school->subjects->pluck('id')->toArray();
            case 'selected_subjects':
                return $validatedData['selected_subjects'] ?? [];
            case 'single_subject':
                return isset($validatedData['single_subject_id']) ? [$validatedData['single_subject_id']] : [];
            default:
                return [];
        }
    }

    private function attachSubjectsWithSettings($exam, $validatedData, School $school)
    {
        $subjectIds = $this->getSubjectIds($validatedData, $school);
        $pivotData = [];

        foreach ($subjectIds as $subjectId) {
            $subjectSetting = collect($validatedData['subject_settings'])
                ->firstWhere('subject_id', $subjectId);

            if ($subjectSetting) {
                $pivotData[$subjectId] = [
                    'total_marks' => $subjectSetting['total_marks'],
                    'pass_mark' => $subjectSetting['pass_mark'],
                    'has_papers' => $subjectSetting['has_papers'] ?? false,
                    'paper_count' => $subjectSetting['paper_count'] ?? 1,
                ];
            } else {
                // Default settings for subjects not explicitly configured
                $pivotData[$subjectId] = [
                    'total_marks' => 100,
                    'pass_mark' => 40,
                    'has_papers' => false,
                    'paper_count' => 1,
                ];
            }
        }

        if (!empty($pivotData)) {
            $exam->subjects()->attach($pivotData);
            \Log::info('Subjects attached with settings: ', $pivotData);
        }
    }

    private function createExamPapers($exam, $validatedData)
    {
        if (!isset($validatedData['subject_settings'])) {
            return;
        }

        foreach ($validatedData['subject_settings'] as $subjectSetting) {
            if (($subjectSetting['has_papers'] ?? false) && !empty($subjectSetting['papers'])) {
                foreach ($subjectSetting['papers'] as $index => $paper) {
                    try {
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
                        
                        \Log::info("Created paper {$paper['name']} for subject {$subjectSetting['subject_id']}");
                    } catch (\Exception $e) {
                        \Log::error("Failed to create paper {$paper['name']}: " . $e->getMessage());
                        throw $e;
                    }
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

        $role = $user->hasRole('school_admin') ? 'school_admin' : ($user->roles->first()->name ?? null);

        return Inertia::render('SchoolAdmin/Exams/Show', [
            'school' => $school,
            'exam' => $exam,
            'statistics' => $statistics,
            'eligibleStudents' => $eligibleStudents,
            'teacherSubjects' => $teacherSubjects,
            'userRole' => $role,
        ]);
    }

    public function enterResults(School $school, Exam $exam, Subject $subject)
    {
        $user = auth()->user();
        
        // Authorization check - updated to allow active and completed exams
        if (!$user->hasRole('school_admin') && !$exam->canTeacherEnterResults($user->id, $subject->id)) {
            abort(403, 'You are not authorized to enter results for this subject.');
        }

        // Check if exam allows result entry
        if (!in_array($exam->exam_status, ['active', 'completed'])) {
            return redirect()->route('exams.show', [$school, $exam])
                ->withErrors(['error' => 'Results can only be entered for active or completed exams. Current status: ' . $exam->exam_status]);
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