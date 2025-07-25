<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExamPaperResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_result_id',
        'exam_paper_id',
        'student_id',
        'marks',
        'is_absent',
        'entered_by',
        'entered_at'
    ];

    protected $casts = [
        'is_absent' => 'boolean',
        'entered_at' => 'datetime'
    ];

    public function examResult()
    {
        return $this->belongsTo(ExamResult::class);
    }

    public function examPaper()
    {
        return $this->belongsTo(ExamPaper::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function enteredBy()
    {
        return $this->belongsTo(User::class, 'entered_by');
    }
}
