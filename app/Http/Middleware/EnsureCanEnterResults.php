<?php

namespace App\Http\Middleware;

use App\Models\SubjectTeacherStream;
use Closure;

class EnsureCanEnterResults
{
    public function handle($request, Closure $next, ...$guards)
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
