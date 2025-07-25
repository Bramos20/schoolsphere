<?php

namespace App\Policies;

use App\Models\User;
use App\Models\School;
use App\Models\Exam;
use App\Models\Subject;
use App\Models\ExamResult;
use App\Models\SubjectTeacherStream;
use Illuminate\Auth\Access\HandlesAuthorization;

class ExamPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any exams.
     */
    public function viewAny(User $user, School $school)
    {
        return $user->hasRole(['school_admin', 'hod', 'teacher']) && 
               $user->school_id === $school->id;
    }

    /**
     * Determine whether the user can view the exam.
     */
    public function view(User $user, Exam $exam)
    {
        if ($user->hasRole('school_admin') && $user->school_id === $exam->school_id) {
            return true;
        }

        // Teachers can view exams for subjects they teach
        if ($user->hasRole('teacher')) {
            return $exam->subjects()->whereHas('streamAssignments', function ($query) use ($user) {
                $query->where('teacher_id', $user->id);
            })->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can create exams.
     */
    public function create(User $user, School $school)
    {
        return $user->hasRole('school_admin') && $user->school_id === $school->id;
    }

    /**
     * Determine whether the user can update the exam.
     */
    public function update(User $user, Exam $exam)
    {
        return $user->hasRole('school_admin') && 
               $user->school_id === $exam->school_id &&
               !$exam->is_published;
    }

    /**
     * Determine whether the user can delete the exam.
     */
    public function delete(User $user, Exam $exam)
    {
        return $user->hasRole('school_admin') && 
               $user->school_id === $exam->school_id &&
               !$exam->is_published &&
               $exam->results()->count() === 0;
    }

    /**
     * Determine whether the user can enter results for an exam.
     */
    public function enterResults(User $user, Exam $exam, Subject $subject)
    {
        // School admin can enter results for any subject
        if ($user->hasRole('school_admin') && $user->school_id === $exam->school_id) {
            return true;
        }

        // Teachers can only enter results for subjects they teach
        if ($user->hasRole('teacher')) {
            return SubjectTeacherStream::where('teacher_id', $user->id)
                ->where('subject_id', $subject->id)
                ->where('can_enter_results', true)
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can publish exam results.
     */
    public function publishResults(User $user, Exam $exam)
    {
        return $user->hasRole('school_admin') && $user->school_id === $exam->school_id;
    }

    /**
     * Determine whether the user can generate reports.
     */
    public function generateReports(User $user, School $school)
    {
        return $user->hasRole(['school_admin', 'hod']) && $user->school_id === $school->id;
    }

    /**
     * Determine whether the user can export results.
     */
    public function exportResults(User $user, School $school)
    {
        return $user->hasRole(['school_admin', 'hod']) && $user->school_id === $school->id;
    }

    /**
     * Determine whether the user can import results.
     */
    public function importResults(User $user, School $school)
    {
        return $user->hasRole('school_admin') && $user->school_id === $school->id;
    }
}

class ExamResultPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the exam result.
     */
    public function view(User $user, ExamResult $examResult)
    {
        // School admin can view all results
        if ($user->hasRole('school_admin') && $user->school_id === $examResult->exam->school_id) {
            return true;
        }

        // Teachers can view results for subjects they teach
        if ($user->hasRole('teacher')) {
            return SubjectTeacherStream::where('teacher_id', $user->id)
                ->where('subject_id', $examResult->subject_id)
                ->exists();
        }

        // Students can view their own results if published
        if ($user->hasRole('student') && $examResult->exam->is_published) {
            return $user->student && $user->student->id === $examResult->student_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create exam results.
     */
    public function create(User $user, Exam $exam, Subject $subject)
    {
        // School admin can create results for any subject
        if ($user->hasRole('school_admin') && $user->school_id === $exam->school_id) {
            return true;
        }

        // Teachers can create results only for subjects they teach
        if ($user->hasRole('teacher')) {
            return SubjectTeacherStream::where('teacher_id', $user->id)
                ->where('subject_id', $subject->id)
                ->where('can_enter_results', true)
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can update the exam result.
     */
    public function update(User $user, ExamResult $examResult)
    {
        // Cannot update published results
        if ($examResult->exam->is_published) {
            return false;
        }

        // School admin can update any result
        if ($user->hasRole('school_admin') && $user->school_id === $examResult->exam->school_id) {
            return true;
        }

        // Teachers can update results they entered for subjects they teach
        if ($user->hasRole('teacher') && $examResult->entered_by === $user->id) {
            return SubjectTeacherStream::where('teacher_id', $user->id)
                ->where('subject_id', $examResult->subject_id)
                ->where('can_enter_results', true)
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can delete the exam result.
     */
    public function delete(User $user, ExamResult $examResult)
    {
        // Cannot delete published results
        if ($examResult->exam->is_published) {
            return false;
        }

        // School admin can delete any result
        if ($user->hasRole('school_admin') && $user->school_id === $examResult->exam->school_id) {
            return true;
        }

        // Teachers can delete results they entered for subjects they teach
        if ($user->hasRole('teacher') && $examResult->entered_by === $user->id) {
            return SubjectTeacherStream::where('teacher_id', $user->id)
                ->where('subject_id', $examResult->subject_id)
                ->where('can_enter_results', true)
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can verify the exam result.
     */
    public function verify(User $user, ExamResult $examResult)
    {
        return $user->hasRole(['school_admin', 'hod']) && 
               $user->school_id === $examResult->exam->school_id;
    }
}

// Custom Gate definitions for specific permissions
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

// Middleware for exam-specific permissions
class EnsureCanEnterResults
{
    public function handle($request, \Closure $next, ...$guards)
    {
        $user = auth()->user();
        $exam = $request->route('exam');
        $subject = $request->route('subject');

        if (!$user || !$exam || !$subject) {
            abort(403);
        }

        // School admin can enter any results
        if ($user->hasRole('school_admin') && $user->school_id === $exam->school_id) {
            return $next($request);
        }

        // Teachers can only enter results for subjects they teach
        if ($user->hasRole('teacher')) {
            $canEnter = SubjectTeacherStream::where('teacher_id', $user->id)
                ->where('subject_id', $subject->id)
                ->where('can_enter_results', true)
                ->exists();

            if ($canEnter) {
                return $next($request);
            }
        }

        abort(403, 'You are not authorized to enter results for this subject.');
    }
}

// Service class for permission checks
class ExamPermissionService
{
    /**
     * Check if user can enter results for specific exam and subject
     */
    public static function canEnterResults(User $user, Exam $exam, Subject $subject): bool
    {
        if ($user->hasRole('school_admin') && $user->school_id === $exam->school_id) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            return SubjectTeacherStream::where('teacher_id', $user->id)
                ->where('subject_id', $subject->id)
                ->where('can_enter_results', true)
                ->exists();
        }

        return false;
    }

    /**
     * Get subjects a teacher can enter results for
     */
    public static function getTeacherSubjects(User $teacher): \Illuminate\Database\Eloquent\Collection
    {
        return Subject::whereHas('streamAssignments', function ($query) use ($teacher) {
            $query->where('teacher_id', $teacher->id)
                  ->where('can_enter_results', true);
        })->with(['streamAssignments' => function ($query) use ($teacher) {
            $query->where('teacher_id', $teacher->id);
        }])->get();
    }

    /**
     * Check if results can be modified (not published)
     */
    public static function canModifyResults(Exam $exam): bool
    {
        return !$exam->is_published && in_array($exam->exam_status, ['draft', 'active']);
    }

    /**
     * Get teacher's assigned streams for a subject
     */
    public static function getTeacherStreamsForSubject(User $teacher, Subject $subject): array
    {
        return SubjectTeacherStream::where('teacher_id', $teacher->id)
            ->where('subject_id', $subject->id)
            ->pluck('stream_id')
            ->toArray();
    }
}