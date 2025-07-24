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
        'total_subjects',
        'total_points',
        'average_score',
        'average_grade',
        'overall_position',
        'class_position',
        'stream_position',
        'remarks',
        'generated_at'
    ];

    protected $casts = [
        'generated_at' => 'datetime'
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
}
