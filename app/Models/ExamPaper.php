<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExamPaper extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'subject_id',
        'paper_number', // 1, 2, 3, etc.
        'paper_name', // 'Paper 1', 'Paper 2', 'Theory', 'Practical', etc.
        'total_marks',
        'pass_mark',
        'duration_minutes',
        'percentage_weight', // How much this paper contributes to subject total
        'instructions',
        'is_practical',
        'paper_date', // Specific date for this paper if different from exam dates
        'paper_time', // Specific time for this paper
    ];

    protected $casts = [
        'is_practical' => 'boolean',
        'paper_date' => 'date',
        'paper_time' => 'datetime'
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function results()
    {
        return $this->hasMany(ExamPaperResult::class, 'exam_paper_id');
    }

    // Get all students who took this paper
    public function students()
    {
        return $this->hasManyThrough(
            Student::class,
            ExamPaperResult::class,
            'exam_paper_id',
            'id',
            'id',
            'student_id'
        );
    }

    // Calculate statistics for this paper
    public function getStatistics()
    {
        $results = $this->results()->where('is_absent', false)->get();
        
        if ($results->isEmpty()) {
            return [
                'total_students' => 0,
                'students_attempted' => 0,
                'highest_score' => 0,
                'lowest_score' => 0,
                'average_score' => 0,
                'pass_rate' => 0
            ];
        }

        $marks = $results->pluck('marks');
        $passed = $results->where('marks', '>=', $this->pass_mark);

        return [
            'total_students' => $this->exam->getEligibleStudents()->count(),
            'students_attempted' => $results->count(),
            'highest_score' => $marks->max(),
            'lowest_score' => $marks->min(),
            'average_score' => round($marks->avg(), 2),
            'pass_rate' => round(($passed->count() / $results->count()) * 100, 2)
        ];
    }

    // Check if this is a practical paper
    public function isPractical()
    {
        return $this->is_practical || 
               str_contains(strtolower($this->paper_name), 'practical') ||
               str_contains(strtolower($this->paper_name), 'lab');
    }

    // Get formatted duration
    public function getFormattedDuration()
    {
        $hours = intval($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;
        
        if ($hours > 0 && $minutes > 0) {
            return "{$hours}h {$minutes}m";
        } elseif ($hours > 0) {
            return "{$hours}h";
        } else {
            return "{$minutes}m";
        }
    }

    // Scope for filtering by paper type
    public function scopePractical($query)
    {
        return $query->where('is_practical', true);
    }

    public function scopeTheory($query)
    {
        return $query->where('is_practical', false);
    }
}