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
        'theory_score',
        'practical_score',
        'total_score',
        'grade',
        'points',
        'position',
        'remarks',
        'is_absent',
        'entered_by',
        'entered_at'
    ];

    protected $casts = [
        'is_absent' => 'boolean',
        'entered_at' => 'datetime'
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function enteredBy()
    {
        return $this->belongsTo(User::class, 'entered_by');
    }

    // Calculate total score based on theory and practical components
    public function calculateTotalScore()
    {
        if ($this->exam->has_practical) {
            $theory_contribution = ($this->theory_score * $this->exam->theory_percentage) / 100;
            $practical_contribution = ($this->practical_score * $this->exam->practical_percentage) / 100;
            return $theory_contribution + $practical_contribution;
        }
        
        return $this->theory_score;
    }

    // Auto-assign grade based on total score
    public function assignGrade()
    {
        if ($this->is_absent) {
            $this->grade = 'ABS';
            $this->points = 0;
            return;
        }

        $grade = $this->exam->gradingSystem->getGradeForScore($this->total_score);
        
        if ($grade) {
            $this->grade = $grade->grade;
            $this->points = $grade->points;
        }
    }
}
