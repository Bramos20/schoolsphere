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
               !$exam->is_published &&
               in_array($exam->exam_status, ['draft', 'active']);
    }

    /**
     * Determine whether the user can delete the exam.
     */
    public function delete(User $user, Exam $exam)
    {
        return $user->hasRole('school_admin') && 
               $user->school_id === $exam->school_id &&
               !$exam->is_published &&
               $exam->exam_status === 'draft' &&
               $exam->results()->count() === 0;
    }

    /**
     * Determine whether the user can enter results for an exam.
     */
    public function enterResults(User $user, Exam $exam, Subject $subject)
    {
        // Check if exam is in a state that allows result entry
        if (!in_array($exam->exam_status, ['active', 'completed'])) {
            return false;
        }

        // School admin can enter results for any subject
        if ($user->hasRole('school_admin') && $user->school_id === $exam->school_id) {
            return true;
        }

        // Teachers can only enter results for subjects they teach
        if ($user->hasRole('teacher')) {
            return SubjectTeacherStream::where('teacher_id', $user->id)
                ->where('subject_id', $subject->id)
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can publish exam results.
     */
    public function publishResults(User $user, Exam $exam)
    {
        return $user->hasRole('school_admin') && 
               $user->school_id === $exam->school_id &&
               $exam->exam_status !== 'draft';
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

    /**
     * Determine whether the user can manage exam papers.
     */
    public function managePapers(User $user, Exam $exam)
    {
        return $user->hasRole('school_admin') && 
               $user->school_id === $exam->school_id &&
               $exam->exam_status === 'draft';
    }

    /**
     * Determine whether the user can view statistics.
     */
    public function viewStatistics(User $user, Exam $exam)
    {
        if ($user->hasRole('school_admin') && $user->school_id === $exam->school_id) {
            return true;
        }

        // Teachers can view statistics for subjects they teach
        if ($user->hasRole('teacher')) {
            return $exam->subjects()->whereHas('streamAssignments', function ($query) use ($user) {
                $query->where('teacher_id', $user->id);
            })->exists();
        }

        return false;
    }

    /**
     * Check if user can access a specific subject's results in the exam.
     */
    public function accessSubjectResults(User $user, Exam $exam, Subject $subject)
    {
        // School admin can access all subject results
        if ($user->hasRole('school_admin') && $user->school_id === $exam->school_id) {
            return true;
        }

        // Teachers can only access results for subjects they teach
        if ($user->hasRole('teacher')) {
            return SubjectTeacherStream::where('teacher_id', $user->id)
                                     ->where('subject_id', $subject->id)
                                     ->exists();
        }

        return false;
    }

    /**
     * Check if user can modify exam structure (add/remove subjects, change dates, etc.)
     */
    public function modifyStructure(User $user, Exam $exam)
    {
        return $user->hasRole('school_admin') && 
               $user->school_id === $exam->school_id &&
               in_array($exam->exam_status, ['draft', 'active']) &&
               !$exam->is_published;
    }

    /**
     * Check if the exam allows result entry based on dates and status
     */
    public function canEnterResults(User $user, Exam $exam)
    {
        if (!$this->view($user, $exam)) {
            return false;
        }

        // Check if exam is in correct status and within date range
        return in_array($exam->exam_status, ['active', 'completed']) &&
               now()->toDateString() >= $exam->start_date &&
               now()->toDateString() <= $exam->end_date->addDays(30); // Allow 30 days after exam end for result entry
    }
}