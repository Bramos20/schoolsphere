<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StudentTermSummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'exam_series_id',
        'class_id',
        'stream_id',
        'academic_year',
        'term',
        'total_subjects',
        'total_points',
        'total_marks',
        'average_score',
        'average_grade',
        'overall_position',
        'class_position',
        'stream_position',
        'teacher_comments',
        'head_teacher_comments',
        'generated_at',
        'published_at'
    ];

    protected $casts = [
        'generated_at' => 'datetime',
        'published_at' => 'datetime'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function examSeries()
    {
        return $this->belongsTo(ExamSeries::class);
    }

    public function class()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function stream()
    {
        return $this->belongsTo(Stream::class);
    }

    // Get detailed subject results for this term
    public function getSubjectResults()
    {
        return ExamResult::where('student_id', $this->student_id)
                        ->whereHas('exam', function ($query) {
                            $query->where('exam_series_id', $this->exam_series_id);
                        })
                        ->with(['subject', 'exam'])
                        ->get();
    }
}
