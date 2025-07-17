<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\School;
use App\Models\StaffAttendance;
use App\Http\Requests\StoreStaffAttendanceRequest;
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

    public function store(StoreStaffAttendanceRequest $request, School $school)
    {
        \Log::info('StaffAttendanceController@store called');
        \Log::info('Request data:', $request->all());
        \DB::enableQueryLog();

        $today = now()->toDateString();

        foreach ($request->validated()['attendance'] as $record) {
            \Log::info('Processing record:', $record);
            $staff = Staff::find($record['staff_id']);
            \Log::info('Staff found:', ['staff' => $staff]);
            if ($staff && $staff->school_id === $school->id) {
                \Log::info('Staff belongs to the correct school');
                $attendance = StaffAttendance::firstOrNew([
                    'staff_id' => $record['staff_id'],
                    'date' => $today
                ]);
                $attendance->status = $record['status'];
                $attendance->save();
                \Log::info('Attendance record saved:', ['attendance' => $attendance]);
            } else {
                \Log::warning('Staff not found or does not belong to the correct school', ['staff_id' => $record['staff_id'], 'school_id' => $school->id]);
            }
        }
        \Log::info('SQL queries:', \DB::getQueryLog());

        return redirect()->back()->with('success', 'Attendance saved.');
    }
}
