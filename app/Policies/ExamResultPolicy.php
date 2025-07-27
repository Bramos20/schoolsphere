<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Subject;
use App\Models\SubjectTeacherStream;
use Illuminate\Auth\Access\HandlesAuthorization;

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
