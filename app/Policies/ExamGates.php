<?php

namespace App\Policies;

use App\Models\User;
use App\Models\School;
use App\Models\Subject;
use App\Models\Exam;
use App\Models\SubjectTeacherStream;

class ExamGates
{
    public static function define()
    {
        \Gate::define('create-exam', [ExamPolicy::class, 'create']);
        \Gate::define('publish-exam-results', [ExamPolicy::class, 'publishResults']);
        \Gate::define('generate-reports', [ExamPolicy::class, 'generateReports']);
        \Gate::define('export-results', [ExamPolicy::class, 'exportResults']);
        \Gate::define('import-results', [ExamPolicy::class, 'importResults']);

        // Updated gate for entering exam results with proper validation
        \Gate::define('enter-exam-results', function (User $user, Exam $exam, Subject $subject) {
            // Check if exam allows result entry based on status
            if (!in_array($exam->exam_status, ['draft', 'active', 'completed'])) {
                return false;
            }

            // School admin can enter results
            if ($user->hasRole('school_admin') && $user->school_id === $exam->school_id) {
                return in_array($exam->exam_status, ['draft', 'active', 'completed']);
            }

            // Teachers can enter results for subjects they teach in streams that are part of this exam
            if ($user->hasRole('teacher') && in_array($exam->exam_status, ['active', 'completed'])) {
                return SubjectTeacherStream::where('teacher_id', $user->id)
                    ->where('subject_id', $subject->id)
                    ->whereHas('stream.class', function($query) use ($exam) {
                        $query->whereIn('school_classes.id', $exam->classes()->pluck('school_classes.id'));
                    })
                    ->exists();
            }

            return false;
        });

        // Custom gates for specific teacher permissions
        \Gate::define('manage-subject-results', function (User $user, School $school) {
            return $user->hasRole(['teacher', 'hod']) && $user->school_id === $school->id;
        });

        \Gate::define('view-class-reports', function (User $user, School $school) {
            return $user->hasRole(['school_admin', 'hod', 'teacher']) && $user->school_id === $school->id;
        });

        \Gate::define('view-subject-analysis', function (User $user, School $school) {
            return $user->hasRole(['school_admin', 'hod', 'teacher']) && $user->school_id === $school->id;
        });

        // Teacher can enter results for specific subject with stream validation
        \Gate::define('enter-subject-results', function (User $user, Subject $subject, Exam $exam) {
            if ($user->hasRole('school_admin') && $user->school_id === $subject->school_id) {
                return true;
            }

            return SubjectTeacherStream::where('teacher_id', $user->id)
                ->where('subject_id', $subject->id)
                ->whereHas('stream.class', function($query) use ($exam) {
                    $query->whereIn('school_classes.id', $exam->classes()->pluck('school_classes.id'));
                })
                ->exists();
        });

        // Teacher can view analytics for subjects they teach
        \Gate::define('view-subject-analytics', function (User $user, Subject $subject) {
            if ($user->hasRole(['school_admin', 'hod']) && $user->school_id === $subject->school_id) {
                return true;
            }

            return SubjectTeacherStream::where('teacher_id', $user->id)
                ->where('subject_id', $subject->id)
                ->exists();
        });

        // HOD permissions
        \Gate::define('manage-department-subjects', function (User $user, School $school) {
            return $user->hasRole('hod') && $user->school_id === $school->id;
        });

        \Gate::define('approve-results', function (User $user, School $school) {
            return $user->hasRole(['school_admin', 'hod']) && $user->school_id === $school->id;
        });
    }
}