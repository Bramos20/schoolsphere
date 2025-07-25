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
        'class_id',
        'stream_id',
        'subject_id',
        'name',
        'description',
        'date',
        'start_time',
        'end_time',
        'duration_minutes',
        'total_marks',
        'pass_mark',
        'has_practical', // For subjects with practical components
        'practical_percentage',
        'theory_percentage',
        'instructions',
        'is_published',
        'created_by'
    ];

    protected $casts = [
        'date' => 'date',
        'has_practical' => 'boolean',
        'is_published' => 'boolean'
    ];

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

    public function class()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function stream()
    {
        return $this->belongsTo(Stream::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function results()
    {
        return $this->hasMany(ExamResult::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Get students who should take this exam
    public function getEligibleStudents()
    {
        if ($this->stream_id) {
            return $this->stream->students;
        }
        return $this->class->students;
    }

    // Calculate statistics for this exam
    public function getStatistics()
    {
        $results = $this->results;
        
        if ($results->isEmpty()) {
            return null;
        }

        $scores = $results->pluck('total_score');
        
        return [
            'total_students' => $results->count(),
            'highest_score' => $scores->max(),
            'lowest_score' => $scores->min(),
            'average_score' => round($scores->avg(), 2),
            'pass_rate' => round(($results->where('total_score', '>=', $this->pass_mark)->count() / $results->count()) * 100, 2)
        ];
    }
}
