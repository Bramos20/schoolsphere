<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\School;
use App\Models\StaffAttendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class StaffAttendanceController extends Controller
{
    public function index(School $school)
    {
        $user = Auth::user();

        // Check access
        if (!$user->hasRole('school_admin') && !$user->hasRole('hod')) {
            abort(403, 'Unauthorized');
        }

        // Base staff query
        $staffQuery = Staff::with('user', 'department')
            ->where('school_id', $school->id);

        // Restrict to department if HOD
        if ($user->hasRole('hod')) {
            $staff = $user->staff;
            if (!$staff) {
                abort(403, 'Unauthorized - not assigned as staff');
            }
            $staffQuery->where('department_id', $staff->department_id);
        }

        $staff = $staffQuery->get();

        // Get today's attendance for this staff group
        $today = now()->toDateString();

        $todayAttendance = StaffAttendance::whereDate('date', $today)
            ->whereIn('staff_id', $staff->pluck('id'))
            ->get();

        return Inertia::render('SchoolAdmin/StaffAttendance', [
            'auth' => [
                'user' => $user->load('roles', 'staff.department'),
            ],
            'staff' => $staff,
            'todayAttendance' => $todayAttendance,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $user = Auth::user();

        // Only school_admin or HOD can mark attendance
        if (!$user->hasRole('school_admin') && !$user->hasRole('hod')) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'attendance' => 'required|array',
            'attendance.*.staff_id' => 'required|exists:staff,id',
            'attendance.*.status' => 'required|in:present,absent',
        ]);

        $today = now()->toDateString();

        foreach ($request->attendance as $record) {
            \Log::info('Storing attendance for:', $record);
            StaffAttendance::updateOrCreate(
                ['staff_id' => $record['staff_id'], 'date' => $today],
                ['status' => $record['status']]
            );
        }

        return redirect()->back()->with('success', 'Attendance saved.');
    }
}
