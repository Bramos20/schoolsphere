<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\School;
use App\Models\StaffAttendance;
use App\Http\Requests\StoreStaffAttendanceRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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
            ->get()
            ->keyBy('staff_id'); // Key by staff_id for easier lookup

        return Inertia::render('SchoolAdmin/StaffAttendance', [
            'auth' => [
                'user' => $user->load('roles', 'staff.department'),
            ],
            'staff' => $staff,
            'todayAttendance' => $todayAttendance,
            'school' => $school, // Add school data
        ]);
    }

    public function store(StoreStaffAttendanceRequest $request, School $school)
    {

        Log::info('Attendance data received:', $request->all());

        $today = now()->toDateString();

        foreach ($request->validated()['attendance'] as $record) {

            $staff = Staff::find($record['staff_id']);
            if ($staff && $staff->school_id === $school->id) {
                $attendance = StaffAttendance::updateOrCreate(
                    [
                        'staff_id' => $record['staff_id'],
                        'date' => $today
                    ],
                    [
                        'status' => $record['status']
                    ]
                );
            }
        }
        \Log::info('SQL queries:', \DB::getQueryLog());

        return redirect()->back()->with('success', 'Attendance saved successfully.');
    }
}