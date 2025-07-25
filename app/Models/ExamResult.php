<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'student_id',
        'subject_id',
        'total_marks', // Calculated from all papers
        'grade',
        'points',
        'position', // Position in this subject
        'class_position', // Position in class for this subject
        'remarks',
        'is_absent',
        'entered_by',
        'entered_at',
        'verified_by',
        'verified_at'
    ];

    protected $casts = [
        'is_absent' => 'boolean',
        'entered_at' => 'datetime',
        'verified_at' => 'datetime'
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function paperResults()
    {
        return $this->hasMany(ExamPaperResult::class, 'exam_result_id');
    }

    public function enteredBy()
    {
        return $this->belongsTo(User::class, 'entered_by');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // Calculate total marks from all papers
    public function calculateTotalMarks()
    {
        $paperResults = $this->paperResults;
        $totalWeightedMarks = 0;

        foreach ($paperResults as $paperResult) {
            if (!$paperResult->is_absent) {
                $weight = $paperResult->examPaper->percentage_weight / 100;
                $totalWeightedMarks += ($paperResult->marks * $weight);
            }
        }

        return round($totalWeightedMarks, 2);
    }

    // Auto-assign grade and points
    public function assignGrade()
    {
        if ($this->is_absent) {
            $this->grade = 'ABS';
            $this->points = 0;
            return;
        }

        $grade = $this->exam->gradingSystem->getGradeForScore($this->total_marks);
        
        if ($grade) {
            $this->grade = $grade->grade;
            $this->points = $grade->points;
        }
    }
}
