<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'school_id', 'class_id', 'stream_id'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function school() {
        return $this->belongsTo(School::class);
    }

    public function class() {
        return $this->belongsTo(SchoolClass::class);
    }

    public function stream() {
        return $this->belongsTo(Stream::class);
    }

    public function examResults()
    {
        return $this->hasMany(ExamResult::class);
    }

    public function termSummaries()
    {
        return $this->hasMany(StudentTermSummary::class);
    }

    public function getResultsForSeries($examSeriesId)
    {
        return $this->examResults()
            ->whereHas('exam', function($query) use ($examSeriesId) {
                $query->where('exam_series_id', $examSeriesId);
            })
            ->with('exam.subject')
            ->get();
    }
}
