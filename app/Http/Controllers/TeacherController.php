<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\Exam;
use App\Models\ExamPaper;
use App\Models\ExamResult;
use App\Models\ExamPaperResult;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TeacherController extends Controller
{
    public function dashboard(School $school)
    {
        $teacher = auth()->user();
        
        // Get subjects teacher teaches
        $teachingSubjects = $teacher->subjectTeacherStreams()
            ->with(['subject', 'stream.class'])
            ->where('school_id', $school->id)
            ->get();

        // Get recent exams for teacher's subjects
        $recentExams = Exam::whereIn('subject_id', $teachingSubjects->pluck('subject_id'))
            ->where('school_id', $school->id)
            ->with(['subject', 'class', 'stream', 'examSeries'])
            ->latest()
            ->take(5)
            ->get();

        // Get pending results entry
        $pendingResults = Exam::whereIn('subject_id', $teachingSubjects->pluck('subject_id'))
            ->where('school_id', $school->id)
            ->whereDoesntHave('results', function($query) {
                $query->whereNotNull('score');
            })
            ->count();

        return Inertia::render('Teacher/Dashboard', [
            'school' => $school,
            'teachingSubjects' => $teachingSubjects,
            'recentExams' => $recentExams,
            'pendingResults' => $pendingResults,
        ]);
    }

    public function myExams(School $school)
    {
        $teacher = auth()->user();
        
        // Get subjects teacher teaches
        $subjectIds = $teacher->subjectTeacherStreams()
            ->where('school_id', $school->id)
            ->pluck('subject_id')
            ->unique();

        $exams = Exam::whereIn('subject_id', $subjectIds)
            ->where('school_id', $school->id)
            ->with(['subject', 'class', 'stream', 'examSeries', 'examCategory'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Teacher/Exams/Index', [
            'school' => $school,
            'exams' => $exams,
        ]);
    }

    public function examResults(School $school, Exam $exam)
    {
        $teacher = auth()->user();
        
        // Check if teacher can access this exam
        $canAccess = $teacher->subjectTeacherStreams()
            ->where('school_id', $school->id)
            ->where('subject_id', $exam->subject_id)
            ->exists();

        if (!$canAccess && !$teacher->hasRole('school_admin')) {
            abort(403, 'You do not have permission to access this exam.');
        }

        $exam->load([
            'subject',
            'class',
            'stream',
            'examSeries',
            'gradingSystem.grades',
            'examPapers',
            'results.student.user'
        ]);

        $students = $exam->getEligibleStudents()->load('user');

        return Inertia::render('Teacher/Exams/Results', [
            'school' => $school,
            'exam' => $exam,
            'students' => $students,
        ]);
    }

    public function enterResults(Request $request, School $school, Exam $exam)
    {
        $teacher = auth()->user();
        
        // Check if teacher can access this exam
        $canAccess = $teacher->subjectTeacherStreams()
            ->where('school_id', $school->id)
            ->where('subject_id', $exam->subject_id)
            ->exists();

        if (!$canAccess && !$teacher->hasRole('school_admin')) {
            abort(403, 'You do not have permission to enter results for this exam.');
        }

        $request->validate([
            'results' => 'required|array',
            'results.*.student_id' => 'required|exists:students,id',
            'results.*.theory_score' => 'nullable|numeric|min:0',
            'results.*.practical_score' => 'nullable|numeric|min:0',
            'results.*.is_absent' => 'boolean',
        ]);

        DB::transaction(function () use ($request, $exam, $teacher) {
            foreach ($request->results as $resultData) {
                if (!empty($resultData['theory_score']) || !empty($resultData['practical_score']) || $resultData['is_absent']) {
                    $result = $exam->results()->firstOrNew(['student_id' => $resultData['student_id']]);
                    
                    $result->fill([
                        'theory_score' => $resultData['theory_score'] ?? 0,
                        'practical_score' => $resultData['practical_score'] ?? 0,
                        'is_absent' => $resultData['is_absent'] ?? false,
                        'entered_by' => $teacher->id,
                        'entered_at' => now(),
                    ]);

                    // Calculate total score and assign grade
                    $result->total_score = $result->calculateTotalScore();
                    $result->assignGrade();
                    $result->save();
                }
            }

            // Calculate positions
            $this->calculatePositions($exam);
        });

        return back()->with('success', 'Results entered successfully.');
    }

    public function paperResults(School $school, ExamPaper $examPaper)
    {
        $teacher = auth()->user();
        
        // Check if teacher can access this exam paper
        $canAccess = $teacher->subjectTeacherStreams()
            ->where('school_id', $school->id)
            ->where('subject_id', $examPaper->exam->subject_id)
            ->exists();

        if (!$canAccess && !$teacher->hasRole('school_admin')) {
            abort(403, 'You do not have permission to access this exam paper.');
        }

        $examPaper->load([
            'exam.subject',
            'exam.class',
            'exam.stream',
            'exam.examSeries',
            'exam.gradingSystem.grades',
            'results.student.user'
        ]);

        $students = $examPaper->exam->getEligibleStudents()->load('user');

        return Inertia::render('Teacher/ExamPapers/Results', [
            'school' => $school,
            'examPaper' => $examPaper,
            'students' => $students,
        ]);
    }

    public function enterPaperResults(Request $request, School $school, ExamPaper $examPaper)
    {
        $teacher = auth()->user();
        
        // Check if teacher can access this exam paper
        $canAccess = $teacher->subjectTeacherStreams()
            ->where('school_id', $school->id)
            ->where('subject_id', $examPaper->exam->subject_id)
            ->exists();

        if (!$canAccess && !$teacher->hasRole('school_admin')) {
            abort(403, 'You do not have permission to enter results for this exam paper.');
        }

        $request->validate([
            'results' => 'required|array',
            'results.*.student_id' => 'required|exists:students,id',
            'results.*.score' => 'nullable|numeric|min:0|max:' . $examPaper->total_marks,
            'results.*.is_absent' => 'boolean',
        ]);

        DB::transaction(function () use ($request, $examPaper, $teacher) {
            foreach ($request->results as $resultData) {
                if (!empty($resultData['score']) || $resultData['is_absent']) {
                    $result = $examPaper->results()->firstOrNew([
                        'student_id' => $resultData['student_id']
                    ]);

                    $result->fill([
                        'score' => $resultData['score'] ?? 0,
                        'is_absent' => $resultData['is_absent'] ?? false,
                        'entered_by' => $teacher->id,
                        'entered_at' => now(),
                    ]);

                    // Assign grade based on score
                    $result->assignGrade();
                    $result->save();
                }
            }

            // Calculate positions for this paper
            $this->calculatePaperPositions($examPaper);
        });

        return back()->with('success', 'Paper results entered successfully.');
    }

    public function myClasses(School $school)
    {
        $teacher = auth()->user();
        
        $teachingAssignments = $teacher->subjectTeacherStreams()
            ->with(['subject', 'stream.class', 'stream'])
            ->where('school_id', $school->id)
            ->get()
            ->groupBy(function($item) {
                return $item->stream->class->name . ' ' . $item->stream->name;
            });

        return Inertia::render('Teacher/Classes/Index', [
            'school' => $school,
            'teachingAssignments' => $teachingAssignments,
        ]);
    }

    public function classStudents(School $school, Request $request)
    {
        $teacher = auth()->user();
        
        $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'stream_id' => 'nullable|exists:streams,id',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        // Check if teacher teaches this subject in this class/stream
        $canAccess = $teacher->subjectTeacherStreams()
            ->where('school_id', $school->id)
            ->where('subject_id', $request->subject_id)
            ->when($request->stream_id, function($query) use ($request) {
                return $query->where('stream_id', $request->stream_id);
            })
            ->exists();

        if (!$canAccess && !$teacher->hasRole('school_admin')) {
            abort(403, 'You do not have permission to view these students.');
        }

        $students = Student::where('school_id', $school->id)
            ->where('class_id', $request->class_id)
            ->when($request->stream_id, function($query) use ($request) {
                return $query->where('stream_id', $request->stream_id);
            })
            ->with('user')
            ->orderBy('user.name')
            ->get();

        $subject = Subject::findOrFail($request->subject_id);

        return Inertia::render('Teacher/Classes/Students', [
            'school' => $school,
            'students' => $students,
            'subject' => $subject,
            'classId' => $request->class_id,
            'streamId' => $request->stream_id,
        ]);
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

    private function calculatePaperPositions(ExamPaper $examPaper)
    {
        $results = $examPaper->results()
            ->where('is_absent', false)
            ->orderBy('score', 'desc')
            ->get();

        $position = 1;
        $previousScore = null;
        $actualPosition = 1;

        foreach ($results as $result) {
            if ($previousScore !== null && $result->score < $previousScore) {
                $position = $actualPosition;
            }

            $result->update(['position' => $position]);
            $previousScore = $result->score;
            $actualPosition++;
        }
    }
}