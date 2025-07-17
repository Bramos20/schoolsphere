<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\Leave;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class LeaveController extends Controller
{
    public function index(School $school)
    {
        $user = auth()->user();

        if ($user->hasRole('school_admin')) {
            $leaves = Leave::with('staff.user', 'approver')
                ->whereHas('staff', fn ($q) => $q->where('school_id', $school->id))
                ->latest()
                ->get();
        } else {
            $staff = $user->staff;

            if (!$staff || $staff->school_id !== $school->id) {
                abort(403, 'Unauthorized access.');
            }

            $leaves = Leave::with('staff.user', 'approver')
                ->where('staff_id', $staff->id)
                ->latest()
                ->get();
        }

        return Inertia::render('SchoolAdmin/Leaves', [
            'leaves' => $leaves,
            'auth' => [
                'user' => $user,
                'roles' => $user->roles->pluck('slug')->toArray(), // ✅ send as string array
                'staff' => $user->staff,
            ],
        ]);
    }

    public function store(Request $request, School $school)
    {
        $user = auth()->user();
        $staff = $user->staff;

        if (!$staff || $staff->school_id !== $school->id) {
            abort(403, 'Unauthorized.');
        }

        $data = $request->validate([
            'type' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
        ]);

        // Save with staff ID from authenticated user
        Leave::create([
            'staff_id' => $staff->id,
            'type' => $data['type'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'reason' => $data['reason'],
        ]);

        return redirect()->back()->with('success', 'Leave application submitted.');
    }

    // public function updateStatus(Request $request, Leave $leave)
    // {
    //     $request->validate([
    //         'status' => 'required|in:approved,rejected',
    //     ]);

    //     $leave->update([
    //         'status' => $request->status,
    //         'approved_by' => auth()->id(),
    //     ]);

    //     return back()->with('success', 'Leave status updated.');
    // }

    public function updateStatus(Request $request, Leave $leave)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $user = auth()->user();

        // Ensure the current user is a school admin of the same school
        if (!$user->hasRole('school_admin') || $leave->staff->school_id !== $user->school_id) {
            abort(403, 'Unauthorized');
        }

        $leave->update([
            'status' => $request->status,
            'approved_by' => $user->id,
        ]);

        return back()->with('success', 'Leave status updated.');
    }

    protected function authorizeSchoolAdmin(School $school)
    {
        $user = auth()->user();
        if (!$user->hasRole('school_admin') || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized');
        }
    }
}
