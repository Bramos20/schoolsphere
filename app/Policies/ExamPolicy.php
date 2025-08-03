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
        // School admin can update exams that are not published
        if ($user->hasRole('school_admin') && $user->school_id === $exam->school_id) {
            // Allow updates unless exam is published and has results
            if ($exam->is_published && $exam->results()->count() > 0) {
                return false; // Cannot update published exams with results
            }
            return true;
        }

        return false;
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
     * Updated to allow result entry for active, completed, and even draft exams for school admins
     */
    public function enterResults(User $user, Exam $exam, Subject $subject = null)
    {
        // Check if exam allows result entry based on status
        if (!in_array($exam->exam_status, ['draft', 'active', 'completed'])) {
            return false;
        }

        // School admin can enter results for any exam status except published (with restrictions)
        if ($user->hasRole('school_admin') && $user->school_id === $exam->school_id) {
            // Allow for draft, active, and completed exams
            if (in_array($exam->exam_status, ['draft', 'active', 'completed'])) {
                return true;
            }
            
            // For published exams, allow only if explicitly needed (e.g., corrections)
            if ($exam->exam_status === 'published') {
                return false; // Generally don't allow editing published results
            }
        }

        // Teachers can enter results for active and completed exams for subjects they teach
        if ($user->hasRole('teacher') && in_array($exam->exam_status, ['active', 'completed'])) {
            if ($subject) {
                // Check if teacher is assigned to teach this subject in any stream that's part of this exam
                return SubjectTeacherStream::where('teacher_id', $user->id)
                    ->where('subject_id', $subject->id)
                    ->whereHas('stream.class', function($query) use ($exam) {
                        $query->whereIn('school_classes.id', $exam->classes()->pluck('school_classes.id'));
                    })
                    ->exists();
            }
            
            // If no specific subject provided, check if teacher teaches any subject in the exam
            return $exam->subjects()->whereHas('streamAssignments', function ($query) use ($user, $exam) {
                $query->where('teacher_id', $user->id)
                    ->whereHas('stream.class', function($q) use ($exam) {
                        $q->whereIn('school_classes.id', $exam->classes()->pluck('school_classes.id'));
                    });
            })->exists();
        }

        return false;
    }

    /**
     * Check if teacher can access specific subject results with proper stream validation
     */
    public function accessSubjectResults(User $user, Exam $exam, Subject $subject)
    {
        // School admin can access all subject results
        if ($user->hasRole('school_admin') && $user->school_id === $exam->school_id) {
            return true;
        }

        // Teachers can only access results for subjects they teach in streams that are part of this exam
        if ($user->hasRole('teacher')) {
            return SubjectTeacherStream::where('teacher_id', $user->id)
                ->where('subject_id', $subject->id)
                ->whereHas('stream.class', function($query) use ($exam) {
                    $query->whereIn('school_classes.id', $exam->classes()->pluck('school_classes.id'));
                })
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
               in_array($exam->exam_status, ['active', 'completed']); // Can publish active or completed exams
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
               in_array($exam->exam_status, ['draft', 'active']); // Allow managing papers for draft and active exams
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

        // School admin has more flexibility
        if ($user->hasRole('school_admin') && $user->school_id === $exam->school_id) {
            return in_array($exam->exam_status, ['draft', 'active', 'completed']);
        }

        // Teachers need exam to be active or completed and within reasonable date range
        if ($user->hasRole('teacher')) {
            return in_array($exam->exam_status, ['active', 'completed']) &&
                   now()->toDateString() >= $exam->start_date &&
                   now()->toDateString() <= $exam->end_date->addDays(30); // Allow 30 days after exam end
        }

        return false;
    }

    /**
     * Check if user can change exam status
     */
    public function changeStatus(User $user, Exam $exam)
    {
        if (!$user->hasRole('school_admin') || $user->school_id !== $exam->school_id) {
            return false;
        }

        // Define allowed status transitions
        $allowedTransitions = [
            'draft' => ['active'],
            'active' => ['completed', 'draft'], // Allow going back to draft if needed
            'completed' => ['published', 'active'], // Allow going back to active for corrections
            'published' => [] // Generally don't allow changing from published
        ];

        return isset($allowedTransitions[$exam->exam_status]);
    }

    /**
     * Check if user can activate exam (change from draft to active)
     */
    public function activate(User $user, Exam $exam)
    {
        return $user->hasRole('school_admin') && 
               $user->school_id === $exam->school_id &&
               $exam->exam_status === 'draft' &&
               $exam->subjects()->count() > 0 && // Must have subjects
               $exam->classes()->count() > 0;    // Must have classes
    }

    /**
     * Check if user can complete exam (change from active to completed)
     */
    public function complete(User $user, Exam $exam)
    {
        return $user->hasRole('school_admin') && 
               $user->school_id === $exam->school_id &&
               $exam->exam_status === 'active';
    }
}