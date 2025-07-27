<?php

namespace App\Policies;

use App\Models\User;
use App\Models\School;
use App\Models\Subject;
use App\Models\SubjectTeacherStream;

class ExamGates
{
    public static function define()
    {
        \Gate::define('create-exam', [ExamPolicy::class, 'create']);
        \Gate::define('enter-exam-results', [ExamPolicy::class, 'enterResults']);
        \Gate::define('publish-exam-results', [ExamPolicy::class, 'publishResults']);
        \Gate::define('generate-reports', [ExamPolicy::class, 'generateReports']);
        \Gate::define('export-results', [ExamPolicy::class, 'exportResults']);
        \Gate::define('import-results', [ExamPolicy::class, 'importResults']);

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

        // Teacher can enter results for specific subject
        \Gate::define('enter-subject-results', function (User $user, Subject $subject) {
            if ($user->hasRole('school_admin') && $user->school_id === $subject->school_id) {
                return true;
            }

            return SubjectTeacherStream::where('teacher_id', $user->id)
                ->where('subject_id', $subject->id)
                ->where('can_enter_results', true)
                ->exists();
        });

        // Teacher can view analytics for subjects they teach
        \Gate::define('view-subject-analytics', function (User $user, Subject $subject) {
            if ($user->hasRole(['school_admin', 'hod']) && $user->school_id === $subject->school_id) {
                return true;
            }

            return SubjectTeacherStream::where('teacher_id', $user->id)
                ->where('subject_id', $subject->id)
                ->where('can_view_analytics', true)
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
