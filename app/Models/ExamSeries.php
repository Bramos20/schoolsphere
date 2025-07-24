<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExamSeries extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'description',
        'academic_year',
        'term',
        'start_date',
        'end_date',
        'is_active',
        'is_published' // Whether results are visible to students/parents
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'is_published' => 'boolean'
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function exams()
    {
        return $this->hasMany(Exam::class);
    }
}
