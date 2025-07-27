<?php

namespace App\Services;

use App\Models\User;
use App\Models\Exam;
use App\Models\Subject;
use App\Models\SubjectTeacherStream;

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
