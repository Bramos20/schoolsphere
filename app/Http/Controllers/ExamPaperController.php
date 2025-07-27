<?php

namespace App\Http\Controllers;

use App\Models\ExamPaper;
use App\Models\Exam;
use App\Models\School;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ExamPaperController extends Controller
{
    public function index(School $school)
    {
        $examPapers = $school->examPapers()
            ->with(['exam.subject', 'exam.class', 'exam.stream', 'exam.examSeries'])
            ->latest()
            ->paginate(20);

        return Inertia::render('SchoolAdmin/ExamPapers/Index', [
            'school' => $school,
            'examPapers' => $examPapers,
        ]);
    }

    public function create(School $school, Request $request)
    {
        $exam = null;
        if ($request->has('exam_id')) {
            $exam = Exam::findOrFail($request->exam_id);
        }

        $exams = $school->exams()
            ->with(['subject', 'class', 'stream'])
            ->where('is_published', false)
            ->get();

        return Inertia::render('SchoolAdmin/ExamPapers/Create', [
            'school' => $school,
            'exams' => $exams,
            'selectedExam' => $exam,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'paper_number' => 'required|integer|min:1|max:5',
            'paper_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'total_marks' => 'required|integer|min:1',
            'pass_mark' => 'required|integer|min:0',
            'duration_minutes' => 'required|integer|min:1',
            'paper_type' => 'required|in:theory,practical,oral,coursework',
            'is_compulsory' => 'boolean',
            'weight_percentage' => 'required|numeric|min:0|max:100',
        ]);

        // Check if paper number already exists for this exam
        $existingPaper = ExamPaper::where('exam_id', $request->exam_id)
            ->where('paper_number', $request->paper_number)
            ->first();

        if ($existingPaper) {
            return back()->withErrors(['paper_number' => 'Paper number already exists for this exam.']);
        }

        // Validate total weight percentage doesn't exceed 100%
        $totalWeight = ExamPaper::where('exam_id', $request->exam_id)
            ->sum('weight_percentage');
        
        if (($totalWeight + $request->weight_percentage) > 100) {
            return back()->withErrors(['weight_percentage' => 'Total weight percentage cannot exceed 100%.']);
        }

        $examPaper = ExamPaper::create([
            'exam_id' => $request->exam_id,
            'paper_number' => $request->paper_number,
            'paper_name' => $request->paper_name,
            'description' => $request->description,
            'total_marks' => $request->total_marks,
            'pass_mark' => $request->pass_mark,
            'duration_minutes' => $request->duration_minutes,
            'paper_type' => $request->paper_type,
            'is_compulsory' => $request->is_compulsory ?? true,
            'weight_percentage' => $request->weight_percentage,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('exam-papers.show', [$school, $examPaper])
            ->with('success', 'Exam paper created successfully.');
    }

    public function show(School $school, ExamPaper $examPaper)
    {
        $examPaper->load([
            'exam.subject',
            'exam.class',
            'exam.stream',
            'exam.examSeries',
            'exam.gradingSystem.grades',
            'results.student.user'
        ]);

        $statistics = $examPaper->getStatistics();
        $eligibleStudents = $examPaper->exam->getEligibleStudents()->count();

        return Inertia::render('SchoolAdmin/ExamPapers/Show', [
            'school' => $school,
            'examPaper' => $examPaper,
            'statistics' => $statistics,
            'eligibleStudents' => $eligibleStudents,
        ]);
    }

    public function edit(School $school, ExamPaper $examPaper)
    {
        $examPaper->load('exam');

        return Inertia::render('SchoolAdmin/ExamPapers/Edit', [
            'school' => $school,
            'examPaper' => $examPaper,
        ]);
    }

    public function update(Request $request, School $school, ExamPaper $examPaper)
    {
        $request->validate([
            'paper_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'total_marks' => 'required|integer|min:1',
            'pass_mark' => 'required|integer|min:0',
            'duration_minutes' => 'required|integer|min:1',
            'paper_type' => 'required|in:theory,practical,oral,coursework',
            'is_compulsory' => 'boolean',
            'weight_percentage' => 'required|numeric|min:0|max:100',
        ]);

        // Validate total weight percentage doesn't exceed 100% (excluding current paper)
        $totalWeight = ExamPaper::where('exam_id', $examPaper->exam_id)
            ->where('id', '!=', $examPaper->id)
            ->sum('weight_percentage');
        
        if (($totalWeight + $request->weight_percentage) > 100) {
            return back()->withErrors(['weight_percentage' => 'Total weight percentage cannot exceed 100%.']);
        }

        $examPaper->update([
            'paper_name' => $request->paper_name,
            'description' => $request->description,
            'total_marks' => $request->total_marks,
            'pass_mark' => $request->pass_mark,
            'duration_minutes' => $request->duration_minutes,
            'paper_type' => $request->paper_type,
            'is_compulsory' => $request->is_compulsory ?? true,
            'weight_percentage' => $request->weight_percentage,
        ]);

        return redirect()->route('exam-papers.show', [$school, $examPaper])
            ->with('success', 'Exam paper updated successfully.');
    }

    public function destroy(School $school, ExamPaper $examPaper)
    {
        // Check if paper has results
        if ($examPaper->results()->exists()) {
            return back()->withErrors(['error' => 'Cannot delete exam paper with existing results.']);
        }

        $examPaper->delete();

        return redirect()->route('exam-papers.index', $school)
            ->with('success', 'Exam paper deleted successfully.');
    }

    public function bulkResultsImport(School $school, ExamPaper $examPaper)
    {
        $students = $examPaper->exam->getEligibleStudents()->load('user');
        $examPaper->load(['exam.subject', 'exam.class', 'exam.gradingSystem.grades']);

        return Inertia::render('SchoolAdmin/ExamPapers/BulkImport', [
            'school' => $school,
            'examPaper' => $examPaper,
            'students' => $students,
        ]);
    }

    public function processBulkResults(Request $request, School $school, ExamPaper $examPaper)
    {
        $request->validate([
            'results' => 'required|array',
            'results.*.student_id' => 'required|exists:students,id',
            'results.*.score' => 'nullable|numeric|min:0|max:' . $examPaper->total_marks,
            'results.*.is_absent' => 'boolean',
        ]);

        DB::transaction(function () use ($request, $examPaper) {
            foreach ($request->results as $resultData) {
                if (!empty($resultData['score']) || $resultData['is_absent']) {
                    $result = $examPaper->results()->firstOrNew([
                        'student_id' => $resultData['student_id']
                    ]);

                    $result->fill([
                        'score' => $resultData['score'] ?? 0,
                        'is_absent' => $resultData['is_absent'] ?? false,
                        'entered_by' => auth()->id(),
                        'entered_at' => now(),
                    ]);

                    // Assign grade based on score
                    $result->assignGrade();
                    $result->save();
                }
            }

            // Calculate positions for this paper
            $this->calculatePositions($examPaper);
        });

        return redirect()->route('exam-papers.show', [$school, $examPaper])
            ->with('success', 'Paper results imported successfully.');
    }

    private function calculatePositions(ExamPaper $examPaper)
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

    public function getEligibleStudents(School $school, ExamPaper $examPaper)
    {
        return response()->json($examPaper->exam->getEligibleStudents());
    }
}