<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreStaffAttendanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = Auth::user();
        $school = $this->route('school');

        // Check if user has required roles
        if ($user->hasRole('school_admin')) {
            return true;
        }

        if ($user->hasRole('hod')) {
            // Check if user is staff of this school
            $staff = $user->staff;
            return $staff && $staff->school_id === $school->id;
        }

        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'attendance' => 'required|array',
            'attendance.*.staff_id' => 'required|exists:staff,id',
            'attendance.*.status' => 'required|in:present,absent',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'attendance.required' => 'Attendance data is required.',
            'attendance.array' => 'Attendance must be an array.',
            'attendance.*.staff_id.required' => 'Staff ID is required for each attendance record.',
            'attendance.*.staff_id.exists' => 'Selected staff member does not exist.',
            'attendance.*.status.required' => 'Status is required for each attendance record.',
            'attendance.*.status.in' => 'Status must be either present or absent.',
        ];
    }
}
