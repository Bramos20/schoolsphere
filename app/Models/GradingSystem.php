<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GradingSystem extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'description',
        'type', // 'letter', 'number', 'percentage'
        'is_default',
        'is_active'
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean'
    ];

    // Relationships
    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class)->orderBy('min_score', 'desc');
    }

    public function exams()
    {
        return $this->hasMany(Exam::class);
    }

    // Get grade for a specific score
    public function getGradeForScore($score)
    {
        return $this->grades()
            ->where('min_score', '<=', $score)
            ->where('max_score', '>=', $score)
            ->first();
    }

    // Get grade letter for score
    public function getGradeLetterForScore($score)
    {
        $grade = $this->getGradeForScore($score);
        return $grade ? $grade->grade : 'N/A';
    }

    // Get points for score
    public function getPointsForScore($score)
    {
        $grade = $this->getGradeForScore($score);
        return $grade ? $grade->points : 0;
    }

    // Calculate mean grade from points (for KCSE-style reporting)
    public function calculateMeanGrade($totalPoints, $numberOfSubjects)
    {
        if ($numberOfSubjects == 0) return 'N/A';
        
        $meanPoints = $totalPoints / $numberOfSubjects;
        
        // Find the grade that corresponds to this mean point
        $grade = $this->grades()
            ->where('points', '>=', floor($meanPoints))
            ->orderBy('points', 'asc')
            ->first();
            
        if ($grade) {
            // Handle mean grades with + or - modifiers
            $remainder = $meanPoints - floor($meanPoints);
            
            if ($remainder >= 0.67) {
                return $grade->grade . '+';
            } elseif ($remainder >= 0.33) {
                return $grade->grade;
            } else {
                return $grade->grade . '-';
            }
        }
        
        return 'N/A';
    }

    // Validate grade boundaries
    public function validateGradeBoundaries()
    {
        $grades = $this->grades()->orderBy('min_score')->get();
        $errors = [];

        for ($i = 0; $i < $grades->count() - 1; $i++) {
            $current = $grades[$i];
            $next = $grades[$i + 1];

            // Check for gaps
            if ($current->max_score + 1 != $next->min_score) {
                $errors[] = "Gap between {$current->grade} and {$next->grade}";
            }

            // Check for overlaps
            if ($current->max_score >= $next->min_score) {
                $errors[] = "Overlap between {$current->grade} and {$next->grade}";
            }
        }

        // Check if grades cover 0-100 range
        $firstGrade = $grades->first();
        $lastGrade = $grades->last();

        if ($firstGrade && $firstGrade->min_score != 0) {
            $errors[] = "Grading scale doesn't start from 0";
        }

        if ($lastGrade && $lastGrade->max_score != 100) {
            $errors[] = "Grading scale doesn't end at 100";
        }

        return $errors;
    }

    // Get statistical breakdown of grades for a set of results
    public function getGradeDistribution($results)
    {
        $distribution = [];
        
        foreach ($this->grades as $grade) {
            $distribution[$grade->grade] = [
                'count' => 0,
                'percentage' => 0,
                'grade_info' => $grade
            ];
        }

        $totalResults = $results->count();
        
        foreach ($results as $result) {
            if (!$result->is_absent && $result->grade) {
                if (isset($distribution[$result->grade])) {
                    $distribution[$result->grade]['count']++;
                }
            }
        }

        // Calculate percentages
        foreach ($distribution as $grade => &$data) {
            $data['percentage'] = $totalResults > 0 ? 
                round(($data['count'] / $totalResults) * 100, 2) : 0;
        }

        return $distribution;
    }

    // Create default KCSE grading system
    public static function createKCSESystem($school)
    {
        $gradingSystem = self::create([
            'school_id' => $school->id,
            'name' => 'KCSE Grading System',
            'description' => 'Kenya Certificate of Secondary Education 12-point grading system',
            'type' => 'letter',
            'is_default' => true,
            'is_active' => true
        ]);

        $grades = [
            ['grade' => 'A', 'min_score' => 80, 'max_score' => 100, 'points' => 12, 'remarks' => 'Excellent'],
            ['grade' => 'A-', 'min_score' => 75, 'max_score' => 79, 'points' => 11, 'remarks' => 'Very Good'],
            ['grade' => 'B+', 'min_score' => 70, 'max_score' => 74, 'points' => 10, 'remarks' => 'Good Plus'],
            ['grade' => 'B', 'min_score' => 65, 'max_score' => 69, 'points' => 9, 'remarks' => 'Good'],
            ['grade' => 'B-', 'min_score' => 60, 'max_score' => 64, 'points' => 8, 'remarks' => 'Good Minus'],
            ['grade' => 'C+', 'min_score' => 55, 'max_score' => 59, 'points' => 7, 'remarks' => 'Credit Plus'],
            ['grade' => 'C', 'min_score' => 50, 'max_score' => 54, 'points' => 6, 'remarks' => 'Credit'],
            ['grade' => 'C-', 'min_score' => 45, 'max_score' => 49, 'points' => 5, 'remarks' => 'Credit Minus'],
            ['grade' => 'D+', 'min_score' => 40, 'max_score' => 44, 'points' => 4, 'remarks' => 'Pass Plus'],
            ['grade' => 'D', 'min_score' => 35, 'max_score' => 39, 'points' => 3, 'remarks' => 'Pass'],
            ['grade' => 'D-', 'min_score' => 30, 'max_score' => 34, 'points' => 2, 'remarks' => 'Pass Minus'],
            ['grade' => 'E', 'min_score' => 0, 'max_score' => 29, 'points' => 1, 'remarks' => 'Fail'],
        ];

        foreach ($grades as $gradeData) {
            $gradingSystem->grades()->create($gradeData);
        }

        return $gradingSystem;
    }

    // Create primary school grading system
    public static function createPrimarySystem($school)
    {
        $gradingSystem = self::create([
            'school_id' => $school->id,
            'name' => 'Primary School Grading',
            'description' => 'Kenya Primary School grading system',
            'type' => 'letter',
            'is_default' => false,
            'is_active' => true
        ]);

        $grades = [
            ['grade' => 'A', 'min_score' => 80, 'max_score' => 100, 'points' => 4, 'remarks' => 'Excellent'],
            ['grade' => 'B', 'min_score' => 60, 'max_score' => 79, 'points' => 3, 'remarks' => 'Good'],
            ['grade' => 'C', 'min_score' => 40, 'max_score' => 59, 'points' => 2, 'remarks' => 'Satisfactory'],
            ['grade' => 'D', 'min_score' => 0, 'max_score' => 39, 'points' => 1, 'remarks' => 'Below Expectation'],
        ];

        foreach ($grades as $gradeData) {
            $gradingSystem->grades()->create($gradeData);
        }

        return $gradingSystem;
    }
}

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'grading_system_id',
        'grade',
        'min_score',
        'max_score',
        'points',
        'remarks',
        'color' // For UI display
    ];

    protected $casts = [
        'min_score' => 'decimal:2',
        'max_score' => 'decimal:2',
        'points' => 'decimal:2'
    ];

    public function gradingSystem()
    {
        return $this->belongsTo(GradingSystem::class);
    }

    // Check if a score falls within this grade's range
    public function containsScore($score)
    {
        return $score >= $this->min_score && $score <= $this->max_score;
    }

    // Get color for grade display
    public function getDisplayColor()
    {
        if ($this->color) {
            return $this->color;
        }

        // Default colors based on grade performance
        if ($this->points >= 10) return '#10B981'; // Green for A grades
        if ($this->points >= 7) return '#3B82F6';  // Blue for B grades  
        if ($this->points >= 5) return '#F59E0B';  // Yellow for C grades
        if ($this->points >= 2) return '#EF4444';  // Red for D grades
        return '#6B7280'; // Gray for E/F grades
    }

    // Get grade classification
    public function getClassification()
    {
        if ($this->points >= 10) return 'Distinction';
        if ($this->points >= 7) return 'Credit';
        if ($this->points >= 5) return 'Pass';
        if ($this->points >= 2) return 'Below Average';
        return 'Fail';
    }
}

// Service class for grade calculations
class GradeCalculationService
{
    /**
     * Calculate student's overall performance for a term
     */
    public static function calculateTermPerformance($studentId, $examSeriesId, $gradingSystem)
    {
        $results = ExamResult::where('student_id', $studentId)
            ->whereHas('exam', function ($query) use ($examSeriesId) {
                $query->where('exam_series_id', $examSeriesId);
            })
            ->where('is_absent', false)
            ->get();

        if ($results->isEmpty()) {
            return null;
        }

        $totalPoints = $results->sum('points');
        $totalMarks = $results->sum('total_marks');
        $numberOfSubjects = $results->count();
        $averageScore = round($totalMarks / $numberOfSubjects, 2);
        
        $meanGrade = $gradingSystem->calculateMeanGrade($totalPoints, $numberOfSubjects);

        return [
            'total_subjects' => $numberOfSubjects,
            'total_points' => $totalPoints,
            'total_marks' => $totalMarks,
            'average_score' => $averageScore,
            'mean_grade' => $meanGrade,
            'results' => $results
        ];
    }

    /**
     * Calculate class averages for a subject
     */
    public static function calculateClassAverages($examId, $subjectId, $classId = null)
    {
        $query = ExamResult::where('exam_id', $examId)
            ->where('subject_id', $subjectId)
            ->where('is_absent', false);

        if ($classId) {
            $query->whereHas('student', function ($q) use ($classId) {
                $q->where('class_id', $classId);
            });
        }

        $results = $query->get();

        if ($results->isEmpty()) {
            return null;
        }

        return [
            'count' => $results->count(),
            'average_score' => round($results->avg('total_marks'), 2),
            'highest_score' => $results->max('total_marks'),
            'lowest_score' => $results->min('total_marks'),
            'pass_rate' => self::calculatePassRate($results),
            'grade_distribution' => self::getGradeDistribution($results)
        ];
    }

    /**
     * Calculate pass rate
     */
    private static function calculatePassRate($results, $passScore = 50)
    {
        $total = $results->count();
        $passed = $results->where('total_marks', '>=', $passScore)->count();
        
        return $total > 0 ? round(($passed / $total) * 100, 2) : 0;
    }

    /**
     * Get grade distribution
     */
    private static function getGradeDistribution($results)
    {
        return $results->groupBy('grade')
            ->map(function ($group, $grade) use ($results) {
                return [
                    'grade' => $grade,
                    'count' => $group->count(),
                    'percentage' => round(($group->count() / $results->count()) * 100, 2)
                ];
            })
            ->values()
            ->toArray();
    }
}