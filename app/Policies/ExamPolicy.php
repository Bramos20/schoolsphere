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