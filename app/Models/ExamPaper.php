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
        'paper_number', // 1, 2, 3
        'paper_name', // 'Theory', 'Practical', 'Project'
        'total_marks',
        'pass_mark',
        'duration_minutes',
        'percentage_weight', // How much this paper contributes to total
        'instructions',
        'is_practical'
    ];

    protected $casts = [
        'is_practical' => 'boolean'
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
}
