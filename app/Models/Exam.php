<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Student;

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
        // Get all class IDs associated with this exam
        $classIds = $this->classes()->pluck('school_classes.id');

        // Get all students from those classes
        return Student::whereIn('class_id', $classIds)->get();
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

    // Status management methods
    public function canBeActivated()
    {
        return $this->exam_status === 'draft' &&
               $this->subjects()->count() > 0 &&
               $this->classes()->count() > 0;
    }

    public function canBeCompleted()
    {
        return $this->exam_status === 'active';
    }

    public function canBePublished()
    {
        return $this->exam_status === 'completed' &&
               $this->hasResultsEntered();
    }

    public function hasResultsEntered()
    {
        return $this->results()->count() > 0;
    }

    public function activate()
    {
        if ($this->canBeActivated()) {
            $this->update(['exam_status' => 'active']);
            return true;
        }
        return false;
    }

    public function complete()
    {
        if ($this->canBeCompleted()) {
            $this->update(['exam_status' => 'completed']);
            return true;
        }
        return false;
    }

    public function publish()
    {
        if ($this->canBePublished()) {
            $this->update([
                'exam_status' => 'published',
                'is_published' => true
            ]);
            return true;
        }
        return false;
    }

    // Validation methods
    public function validateStructure()
    {
        $errors = [];

        if ($this->subjects()->count() === 0) {
            $errors[] = 'Exam must have at least one subject assigned.';
        }

        if ($this->classes()->count() === 0) {
            $errors[] = 'Exam must have at least one class assigned.';
        }

        if ($this->start_date > $this->end_date) {
            $errors[] = 'Start date must be before or equal to end date.';
        }

        // Check if subjects have proper paper configuration
        foreach ($this->subjects as $subject) {
            if ($subject->pivot->has_papers) {
                $papers = $this->examPapers()->where('subject_id', $subject->id)->get();
                if ($papers->isEmpty()) {
                    $errors[] = "Subject '{$subject->name}' is configured for multiple papers but has no papers defined.";
                }

                // Check if paper weights sum to 100%
                $totalWeight = $papers->sum('percentage_weight');
                if (abs($totalWeight - 100) > 0.01) {
                    $errors[] = "Papers for '{$subject->name}' must have weights that sum to 100%. Current total: {$totalWeight}%.";
                }
            }
        }

        return $errors;
    }

    // Get completion percentage
    public function getCompletionPercentage()
    {
        $totalSubjects = $this->subjects()->count();
        if ($totalSubjects === 0) return 0;

        $subjectsWithResults = $this->results()
            ->select('subject_id')
            ->distinct()
            ->count();

        return round(($subjectsWithResults / $totalSubjects) * 100, 2);
    }

    // Get results entry progress
    public function getResultsProgress()
    {
        $eligibleStudents = $this->getEligibleStudents()->count();
        $totalExpectedResults = $eligibleStudents * $this->subjects()->count();
        
        if ($totalExpectedResults === 0) return 0;

        $actualResults = $this->results()->count();
        
        return round(($actualResults / $totalExpectedResults) * 100, 2);
    }

    // Scope methods for queries
    public function scopeByStatus($query, $status)
    {
        return $query->where('exam_status', $status);
    }

    public function scopeBySchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeBySeries($query, $seriesId)
    {
        return $query->where('exam_series_id', $seriesId);
    }

    public function scopeActive($query)
    {
        return $query->where('exam_status', 'active');
    }

    public function scopePublished($query)
    {
        return $query->where('exam_status', 'published')
                    ->where('is_published', true);
    }

    // Auto-sync pivot data when updating subjects
    public function syncSubjectsWithSettings($subjectSettings)
    {
        $pivotData = [];
        
        foreach ($subjectSettings as $setting) {
            $pivotData[$setting['subject_id']] = [
                'total_marks' => $setting['total_marks'],
                'pass_mark' => $setting['pass_mark'],
                'has_papers' => $setting['has_papers'] ?? false,
                'paper_count' => $setting['paper_count'] ?? 1,
            ];
        }

        $this->subjects()->sync($pivotData);
    }

    // Get exam summary for reporting
    public function getSummary()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'status' => $this->exam_status,
            'series' => $this->examSeries->name ?? 'No Series',
            'category' => $this->examCategory->name ?? 'No Category',
            'duration' => $this->getDurationInDays() . ' days',
            'classes_count' => $this->classes()->count(),
            'subjects_count' => $this->subjects()->count(),
            'eligible_students' => $this->getEligibleStudents()->count(),
            'results_entered' => $this->results()->count(),
            'completion_percentage' => $this->getCompletionPercentage(),
            'results_progress' => $this->getResultsProgress(),
        ];
    }
}