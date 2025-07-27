<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'exam_series_id',
        'exam_category_id',
        'grading_system_id',
        'name',
        'description',
        'start_date',
        'end_date',
        'instructions',
        'is_published',
        'created_by',
        'scope_type', // 'all_school', 'selected_classes', 'single_class'
        'subject_scope_type', // 'all_subjects', 'selected_subjects', 'single_subject'
        'exam_status', // 'draft', 'active', 'completed', 'published'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_published' => 'boolean'
    ];

    // Relationships
    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function examSeries()
    {
        return $this->belongsTo(ExamSeries::class);
    }

    public function examCategory()
    {
        return $this->belongsTo(ExamCategory::class);
    }

    public function gradingSystem()
    {
        return $this->belongsTo(GradingSystem::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Many-to-many relationships for flexible assignment
    public function classes()
    {
        return $this->belongsToMany(SchoolClass::class, 'exam_classes', 'exam_id', 'class_id');
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'exam_subjects', 'exam_id', 'subject_id')
                    ->withPivot(['total_marks', 'pass_mark', 'has_papers', 'paper_count']);
    }

    public function results()
    {
        return $this->hasMany(ExamResult::class);
    }

    public function examPapers()
    {
        return $this->hasMany(ExamPaper::class);
    }

    // Get all students eligible for this exam
    public function getEligibleStudents()
    {
        $students = collect();

        foreach ($this->classes as $class) {
            $students = $students->merge($class->students);
        }

        return $students->unique('id');
    }

    // Get subjects a teacher can enter results for
    public function getSubjectsForTeacher($teacherId)
    {
        return $this->subjects()->whereHas('streamAssignments', function ($query) use ($teacherId) {
            $query->where('teacher_id', $teacherId);
        })->get();
    }

    // Check if a teacher can enter results for a specific subject
    public function canTeacherEnterResults($teacherId, $subjectId)
    {
        return SubjectTeacherStream::where('teacher_id', $teacherId)
                                  ->where('subject_id', $subjectId)
                                  ->exists();
    }

    // Calculate comprehensive statistics
    public function getStatistics()
    {
        $results = $this->results()->with(['student', 'examPapers'])->get();
        
        if ($results->isEmpty()) {
            return null;
        }

        $stats = [
            'total_students' => $results->groupBy('student_id')->count(),
            'subjects' => [],
            'overall' => []
        ];

        // Subject-wise statistics
        foreach ($this->subjects as $subject) {
            $subjectResults = $results->where('subject_id', $subject->id);
            
            $stats['subjects'][$subject->id] = [
                'name' => $subject->name,
                'students_attempted' => $subjectResults->where('is_absent', false)->count(),
                'highest_score' => $subjectResults->where('is_absent', false)->max('total_marks'),
                'lowest_score' => $subjectResults->where('is_absent', false)->min('total_marks'),
                'average_score' => $subjectResults->where('is_absent', false)->avg('total_marks'),
                'pass_rate' => $this->calculatePassRate($subjectResults, $subject->pivot->pass_mark ?? 40)
            ];
        }

        return $stats;
    }

    private function calculatePassRate($results, $passMark)
    {
        $attempted = $results->where('is_absent', false);
        if ($attempted->isEmpty()) return 0;
        
        $passed = $attempted->where('total_marks', '>=', $passMark);
        return round(($passed->count() / $attempted->count()) * 100, 2);
    }

    // Check if exam is within the date range
    public function isActive()
    {
        $today = now()->toDateString();
        return $today >= $this->start_date && $today <= $this->end_date;
    }

    // Get exam duration in days
    public function getDurationInDays()
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }
}