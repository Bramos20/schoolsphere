<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\ExamPaperResult;
use App\Models\Subject;
use App\Models\School;
use App\Models\SubjectTeacherStream;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TeacherResultController extends Controller
{
    /**
     * Display teacher's dashboard with their subjects and pending result entries
     */
    public function index(School $school)
    {
        $teacher = auth()->user();
        
        // Get subjects teacher is assigned to teach
        $teacherSubjects = SubjectTeacherStream::with(['subject', 'stream.class'])
            ->where('teacher_id', $teacher->id)
            ->where('can_enter_results', true)
            ->get()
            ->groupBy('subject_id');

        // Get active exams for teacher's subjects
        $activeExams = Exam::where('school_id', $school->id)
            ->whereIn('exam_status', ['active', 'completed'])
            ->whereHas('subjects', function ($query) use ($teacher) {
                $query->whereHas('streamAssignments', function ($q) use ($teacher) {
                    $q->where('teacher_id', $teacher->id)
                        ->where('can_enter_results', true);
                });
            })
            ->with(['examSeries', 'examCategory', 'subjects' => function ($query) use ($teacher) {
                $query->whereHas('streamAssignments', function ($q) use ($teacher) {
                    $q->where('teacher_id', $teacher->id);
                });
            }])
            ->latest()
            ->get();

        // Calculate pending results for each exam/subject combination
        $pendingResults = [];
        foreach ($activeExams as $exam) {
            foreach ($exam->subjects as $subject) {
                $eligibleStudents = $exam->getEligibleStudents()->count();
                $enteredResults = ExamResult::where('exam_id', $exam->id)
                    ->where('subject_id', $subject->id)
                    ->count();

                $pendingResults[] = [
                    'exam_id' => $exam->id,
                    'exam_name' => $exam->name,
                    'subject_id' => $subject->id,
                    'subject_name' => $subject->name,
                    'eligible_students' => $eligibleStudents,
                    'entered_results' => $enteredResults,
                    'pending_count' => $eligibleStudents - $enteredResults,
                    'completion_percentage' => $eligibleStudents > 0 ? round(($enteredResults / $eligibleStudents) * 100, 1) : 0,
                    'exam_date' => $exam->date,
                    'series_name' => $exam->examSeries->name,
                ];
            }
        }

        return Inertia::render('Teacher/Results/Dashboard', [
            'school' => $school,
            'teacher' => $teacher,
            'teacherSubjects' => $teacherSubjects,
            'activeExams' => $activeExams,
            'pendingResults' => collect($pendingResults)->sortBy('exam_date'),
            'statistics' => $this->getTeacherStatistics($teacher, $school),
        ]);
    }

    /**
     * Show result entry form for a specific exam and subject
     */
    public function show(School $school, Subject $subject, Exam $exam)
    {
        $teacher = auth()->user();
        
        // Verify teacher can enter results for this subject
        if (!$this->canTeacherEnterResults($teacher->id, $subject->id)) {
            abort(403, 'You are not authorized to enter results for this subject.');
        }

        // Get eligible students based on teacher's stream assignments
        $teacherStreams = SubjectTeacherStream::where('teacher_id', $teacher->id)
            ->where('subject_id', $subject->id)
            ->pluck('stream_id');

        $students = $exam->getEligibleStudents()
            ->whereIn('stream_id', $teacherStreams)
            ->load(['user', 'class', 'stream'])
            ->sortBy(['class.name', 'stream.name', 'user.name']);

        // Get exam papers for this subject
        $examPapers = $exam->examPapers()
            ->where('subject_id', $subject->id)
            ->orderBy('paper_number')
            ->get();

        // Get existing results
        $existingResults = ExamResult::where('exam_id', $exam->id)
            ->where('subject_id', $subject->id)
            ->whereIn('student_id', $students->pluck('id'))
            ->with(['paperResults.examPaper'])
            ->get()
            ->keyBy('student_id');

        // Get subject settings from exam
        $subjectSettings = $exam->subjects()->where('subject_id', $subject->id)->first();

        return Inertia::render('Teacher/Results/EnterResults', [
            'school' => $school,
            'exam' => $exam->load(['examSeries', 'examCategory', 'gradingSystem.grades']),
            'subject' => $subject,
            'students' => $students,
            'examPapers' => $examPapers,
            'existingResults' => $existingResults,
            'subjectSettings' => $subjectSettings,
            'teacher' => $teacher,
        ]);
    }

    /**
     * Store or update exam results
     */
    public function store(Request $request, School $school, Subject $subject, Exam $exam)
    {
        $teacher = auth()->user();
        
        // Verify authorization
        if (!$this->canTeacherEnterResults($teacher->id, $subject->id)) {
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

        DB::transaction(function () use ($request, $exam, $subject, $teacher) {
            foreach ($request->results as $resultData) {
                $student_id = $resultData['student_id'];
                $is_absent = $resultData['is_absent'] ?? false;

                // Create or update main exam result
                $examResult = ExamResult::updateOrCreate(
                    [
                        'exam_id' => $exam->id,
                        'student_id' => $student_id,
                        'subject_id' => $subject->id,
                    ],
                    [
                        'is_absent' => $is_absent,
                        'entered_by' => $teacher->id,
                        'entered_at' => now(),
                    ]
                );

                if (!$is_absent && isset($resultData['paper_results'])) {
                    // Clear existing paper results
                    $examResult->paperResults()->delete();

                    // Add new paper results
                    foreach ($resultData['paper_results'] as $paperResult) {
                        ExamPaperResult::create([
                            'exam_result_id' => $examResult->id,
                            'exam_paper_id' => $paperResult['exam_paper_id'],
                            'student_id' => $student_id,
                            'marks' => $paperResult['marks'],
                            'is_absent' => false,
                            'entered_by' => $teacher->id,
                            'entered_at' => now(),
                        ]);
                    }

                    // Calculate total marks and assign grade
                    $examResult->total_marks = $examResult->calculateTotalMarks();
                    $examResult->assignGrade();
                    $examResult->save();
                } else if ($is_absent) {
                    // Clear paper results for absent students
                    $examResult->paperResults()->delete();
                    $examResult->update([
                        'total_marks' => 0,
                        'grade' => 'ABS',
                        'points' => 0,
                    ]);
                }
            }

            // Recalculate positions for this subject
            $this->calculateSubjectPositions($exam, $subject);
        });

        return redirect()->route('teacher.results.show', [$school, $subject, $exam])
            ->with('success', 'Results saved successfully.');
    }

    /**
     * Update a specific result
     */
    public function update(Request $request, School $school, Subject $subject, ExamResult $result)
    {
        $teacher = auth()->user();
        
        // Verify authorization
        if (!$this->canTeacherEnterResults($teacher->id, $subject->id)) {
            abort(403, 'You are not authorized to modify results for this subject.');
        }

        // Check if results are still editable (not published)
        if ($result->exam->is_published) {
            return back()->withErrors(['error' => 'Cannot modify published results.']);
        }

        $request->validate([
            'is_absent' => 'boolean',
            'paper_results' => 'array',
            'paper_results.*.exam_paper_id' => 'required|exists:exam_papers,id',
            'paper_results.*.marks' => 'required_unless:is_absent,true|numeric|min:0',
        ]);

        DB::transaction(function () use ($request, $result, $teacher) {
            $result->update([
                'is_absent' => $request->is_absent ?? false,
                'entered_by' => $teacher->id,
                'entered_at' => now(),
            ]);

            if (!($request->is_absent ?? false) && $request->has('paper_results')) {
                // Update paper results
                $result->paperResults()->delete();

                foreach ($request->paper_results as $paperResult) {
                    ExamPaperResult::create([
                        'exam_result_id' => $result->id,
                        'exam_paper_id' => $paperResult['exam_paper_id'],
                        'student_id' => $result->student_id,
                        'marks' => $paperResult['marks'],
                        'is_absent' => false,
                        'entered_by' => $teacher->id,
                        'entered_at' => now(),
                    ]);
                }

                // Recalculate total and grade
                $result->total_marks = $result->calculateTotalMarks();
                $result->assignGrade();
                $result->save();
            } else {
                // Handle absent student
                $result->paperResults()->delete();
                $result->update([
                    'total_marks' => 0,
                    'grade' => 'ABS',
                    'points' => 0,
                ]);
            }

            // Recalculate positions
            $this->calculateSubjectPositions($result->exam, $result->subject);
        });

        return back()->with('success', 'Result updated successfully.');
    }

    /**
     * Get teacher's result entry statistics
     */
    private function getTeacherStatistics($teacher, $school)
    {
        $currentTerm = now()->month <= 4 ? 1 : (now()->month <= 8 ? 2 : 3);
        $currentYear = now()->year;

        // Get total subjects assigned
        $totalSubjects = SubjectTeacherStream::where('teacher_id', $teacher->id)->distinct('subject_id')->count();

        // Get results entered this term
        $resultsThisTerm = ExamResult::where('entered_by', $teacher->id)
            ->whereHas('exam', function ($query) use ($currentTerm, $currentYear) {
                $query->where('term', $currentTerm)
                      ->where('academic_year', $currentYear);
            })
            ->count();

        // Get pending result entries
        $pendingEntries = $this->getPendingEntriesCount($teacher, $school);

        // Get completion rate
        $totalExpectedEntries = $this->getTotalExpectedEntries($teacher, $school);
        $completionRate = $totalExpectedEntries > 0 ? 
            round(($resultsThisTerm / $totalExpectedEntries) * 100, 1) : 0;

        return [
            'total_subjects' => $totalSubjects,
            'results_entered_this_term' => $resultsThisTerm,
            'pending_entries' => $pendingEntries,
            'completion_rate' => $completionRate,
        ];
    }

    /**
     * Check if teacher can enter results for a subject
     */
    private function canTeacherEnterResults($teacherId, $subjectId)
    {
        return SubjectTeacherStream::where('teacher_id', $teacherId)
            ->where('subject_id', $subjectId)
            ->where('can_enter_results', true)
            ->exists();
    }

    /**
     * Calculate positions for a specific subject
     */
    private function calculateSubjectPositions($exam, $subject)
    {
        // Overall positions for this subject
        $results = ExamResult::where('exam_id', $exam->id)
            ->where('subject_id', $subject->id)
            ->where('is_absent', false)
            ->orderBy('total_marks', 'desc')
            ->get();

        $this->assignPositions($results, 'position');

        // Class positions
        foreach ($exam->classes as $class) {
            $classResults = ExamResult::where('exam_id', $exam->id)
                ->where('subject_id', $subject->id)
                ->whereHas('student', function ($query) use ($class) {
                    $query->where('class_id', $class->id);
                })
                ->where('is_absent', false)
                ->orderBy('total_marks', 'desc')
                ->get();

            $this->assignPositions($classResults, 'class_position');
        }

        // Stream positions
        $streams = $exam->classes()->with('streams')->get()->pluck('streams')->flatten();
        foreach ($streams as $stream) {
            $streamResults = ExamResult::where('exam_id', $exam->id)
                ->where('subject_id', $subject->id)
                ->whereHas('student', function ($query) use ($stream) {
                    $query->where('stream_id', $stream->id);
                })
                ->where('is_absent', false)
                ->orderBy('total_marks', 'desc')
                ->get();

            $this->assignPositions($streamResults, 'stream_position');
        }
    }

    /**
     * Assign positions to results
     */
    private function assignPositions($results, $positionField)
    {
        $position = 1;
        $previousMarks = null;
        $actualPosition = 1;

        foreach ($results as $result) {
            if ($previousMarks !== null && $result->total_marks < $previousMarks) {
                $position = $actualPosition;
            }

            $result->update([$positionField => $position]);
            $previousMarks = $result->total_marks;
            $actualPosition++;
        }
    }

    /**
     * Get count of pending result entries for teacher
     */
    private function getPendingEntriesCount($teacher, $school)
    {
        $activeExams = Exam::where('school_id', $school->id)
            ->whereIn('exam_status', ['active', 'completed'])
            ->whereHas('subjects', function ($query) use ($teacher) {
                $query->whereHas('streamAssignments', function ($q) use ($teacher) {
                    $q->where('teacher_id', $teacher->id);
                });
            })
            ->get();

        $pendingCount = 0;
        foreach ($activeExams as $exam) {
            $teacherSubjects = $exam->subjects()->whereHas('streamAssignments', function ($q) use ($teacher) {
                $q->where('teacher_id', $teacher->id);
            })->get();

            foreach ($teacherSubjects as $subject) {
                $eligibleStudents = $exam->getEligibleStudents()->count();
                $enteredResults = ExamResult::where('exam_id', $exam->id)
                    ->where('subject_id', $subject->id)
                    ->count();
                $pendingCount += ($eligibleStudents - $enteredResults);
            }
        }

        return $pendingCount;
    }

    /**
     * Get total expected result entries for teacher
     */
    private function getTotalExpectedEntries($teacher, $school)
    {
        $currentTerm = now()->month <= 4 ? 1 : (now()->month <= 8 ? 2 : 3);
        $currentYear = now()->year;

        $exams = Exam::where('school_id', $school->id)
            ->where('term', $currentTerm)
            ->where('academic_year', $currentYear)
            ->whereHas('subjects', function ($query) use ($teacher) {
                $query->whereHas('streamAssignments', function ($q) use ($teacher) {
                    $q->where('teacher_id', $teacher->id);
                });
            })
            ->get();

        $totalExpected = 0;
        foreach ($exams as $exam) {
            $teacherSubjects = $exam->subjects()->whereHas('streamAssignments', function ($q) use ($teacher) {
                $q->where('teacher_id', $teacher->id);
            })->get();

            foreach ($teacherSubjects as $subject) {
                $totalExpected += $exam->getEligibleStudents()->count();
            }
        }

        return $totalExpected;
    }
}