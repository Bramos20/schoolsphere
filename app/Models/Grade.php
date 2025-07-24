<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'grading_system_id',
        'grade',
        'description',
        'min_score',
        'max_score',
        'points', // For GPA calculations
        'color', // For UI display
        'remarks'
    ];

    public function gradingSystem()
    {
        return $this->belongsTo(GradingSystem::class);
    }
}
