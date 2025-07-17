<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(School $school, Request $request)
    {
        $this->authorizeHOD();

        $students = Student::with(['user', 'class', 'stream'])
            ->where('school_id', $school->id)
            ->when($request->search, function ($query, $search) {
                $query->whereHas('user', fn($q) =>
                    $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                );
            })
            ->get();

        return Inertia::render('HOD/StudentList', [
            'school' => $school,
            'students' => $students,
            'search' => $request->search ?? '',
        ]);
    }

    public function edit(School $school, Student $student)
    {
        $this->authorizeHOD();

        $classes = SchoolClass::with('streams')->where('school_id', $school->id)->get();

        return Inertia::render('HOD/EditStudent', [
            'school' => $school,
            'student' => $student->load('user'),
            'classes' => $classes,
        ]);
    }

    public function update(Request $request, School $school, Student $student)
    {
        $this->authorizeHOD();

        $data = $request->validate([
            'name' => 'required|string',
            'email' => "required|email|unique:users,email,{$student->user_id}",
            'class_id' => 'required|exists:school_classes,id',
            'stream_id' => 'required|exists:streams,id',
        ]);

        $student->user->update([
            'name' => $data['name'],
            'email' => $data['email'],
        ]);

        $student->update([
            'class_id' => $data['class_id'],
            'stream_id' => $data['stream_id'],
        ]);

        return redirect()->route('students.index', $school->id)->with('success', 'Student updated successfully.');
    }
    public function create(School $school)
    {
        $this->authorizeHOD();

        return Inertia::render('HOD/RegisterStudent', [
            'school' => $school,
            'classes' => SchoolClass::with('streams')->where('school_id', $school->id)->get()
        ]);
    }

    public function store(Request $request, School $school)
    {
        $this->authorizeHOD();

        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'class_id' => 'required|exists:school_classes,id',
            'stream_id' => 'required|exists:streams,id',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'school_id' => $school->id,
            'company_id' => $school->company_id,
        ]);

        $studentRole = Role::where('slug', 'student')->first();
        $user->roles()->attach($studentRole);

        Student::create([
            'user_id' => $user->id,
            'school_id' => $school->id,
            'class_id' => $data['class_id'],
            'stream_id' => $data['stream_id'],
        ]);

        return redirect()->back()->with('success', 'Student registered successfully.');
    }

    protected function authorizeHOD()
    {
        $user = auth()->user();

        if (!$user->hasRole('hod')) {
            abort(403, 'Unauthorized: You must be a HOD to perform this action.');
        }
    }
}
