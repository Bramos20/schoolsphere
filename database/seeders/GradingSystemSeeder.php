<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\School;

class GradingSystemSeeder extends Seeder
{
    public function run()
    {
        // This will create default grading systems for existing schools
        $schools = School::all();

        foreach ($schools as $school) {
            // Create KCSE Grading System
            $kcseGrading = $school->gradingSystems()->create([
                'name' => 'KCSE Grading System',
                'description' => 'Kenya Certificate of Secondary Education grading system',
                'type' => 'letter',
                'is_default' => true,
                'is_active' => true,
            ]);

            $kcseGrades = [
                ['grade' => 'A', 'min_score' => 80, 'max_score' => 100, 'points' => 12, 'color' => '#10B981', 'remarks' => 'Excellent'],
                ['grade' => 'A-', 'min_score' => 75, 'max_score' => 79, 'points' => 11, 'color' => '#34D399', 'remarks' => 'Very Good'],
                ['grade' => 'B+', 'min_score' => 70, 'max_score' => 74, 'points' => 10, 'color' => '#60A5FA', 'remarks' => 'Good Plus'],
                ['grade' => 'B', 'min_score' => 65, 'max_score' => 69, 'points' => 9, 'color' => '#3B82F6', 'remarks' => 'Good'],
                ['grade' => 'B-', 'min_score' => 60, 'max_score' => 64, 'points' => 8, 'color' => '#6366F1', 'remarks' => 'Good Minus'],
                ['grade' => 'C+', 'min_score' => 55, 'max_score' => 59, 'points' => 7, 'color' => '#8B5CF6', 'remarks' => 'Credit Plus'],
                ['grade' => 'C', 'min_score' => 50, 'max_score' => 54, 'points' => 6, 'color' => '#A855F7', 'remarks' => 'Credit'],
                ['grade' => 'C-', 'min_score' => 45, 'max_score' => 49, 'points' => 5, 'color' => '#D946EF', 'remarks' => 'Credit Minus'],
                ['grade' => 'D+', 'min_score' => 40, 'max_score' => 44, 'points' => 4, 'color' => '#F59E0B', 'remarks' => 'Pass Plus'],
                ['grade' => 'D', 'min_score' => 35, 'max_score' => 39, 'points' => 3, 'color' => '#F97316', 'remarks' => 'Pass'],
                ['grade' => 'D-', 'min_score' => 30, 'max_score' => 34, 'points' => 2, 'color' => '#EF4444', 'remarks' => 'Pass Minus'],
                ['grade' => 'E', 'min_score' => 0, 'max_score' => 29, 'points' => 1, 'color' => '#DC2626', 'remarks' => 'Fail'],
            ];

            foreach ($kcseGrades as $gradeData) {
                $kcseGrading->grades()->create($gradeData);
            }

            // Create default exam categories
            $categories = [
                ['name' => 'CAT 1', 'description' => 'Continuous Assessment Test 1', 'weight_percentage' => 10, 'color' => '#3B82F6'],
                ['name' => 'CAT 2', 'description' => 'Continuous Assessment Test 2', 'weight_percentage' => 10, 'color' => '#10B981'],
                ['name' => 'Mid-Term', 'description' => 'Mid-Term Examination', 'weight_percentage' => 20, 'color' => '#F59E0B'],
                ['name' => 'End-Term', 'description' => 'End of Term Examination', 'weight_percentage' => 60, 'color' => '#EF4444'],
            ];

            foreach ($categories as $categoryData) {
                $school->examCategories()->create($categoryData);
            }
        }
    }
}

