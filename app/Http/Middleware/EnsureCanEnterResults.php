<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\SubjectTeacherStream;

class EnsureCanEnterResults
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();
        $exam = $request->route('exam');
        $subject = $request->route('subject');

        // School admin can enter results for any subject
        if ($user->hasRole('school_admin') && $user->school_id === $exam->school_id) {
            return $next($request);
        }

        // Check if teacher can enter results for this specific subject in this exam
        if ($user->hasRole('teacher')) {
            $canEnterResults = SubjectTeacherStream::where('teacher_id', $user->id)
                ->where('subject_id', $subject->id)
                ->whereHas('stream.class', function($query) use ($exam) {
                    $query->whereIn('school_classes.id', $exam->classes()->pluck('school_classes.id'));
                })
                ->exists();

            if ($canEnterResults && in_array($exam->exam_status, ['active', 'completed'])) {
                return $next($request);
            }
        }

        abort(403, 'You are not authorized to enter results for this subject in this exam.');
    }
}