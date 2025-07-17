<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\School;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

class PaymentController extends Controller
{
    public function index(School $school)
    {
        $this->authorizeSchoolAdmin($school); // ✅ fixed

        $payments = Payment::with('student.user', 'class')
            ->where('school_id', $school->id)
            ->latest()->get();

        return Inertia::render('SchoolAdmin/StudentPayments', [
            'payments' => $payments,
            'school' => $school,
            'students' => Student::with('user', 'class')->where('school_id', $school->id)->get()
        ]);
    }

    public function store(Request $request, School $school)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'amount_paid' => 'required|numeric|min:1',
            'term' => 'required|string|max:20',
            'method' => 'nullable|string|max:50',
            'reference' => 'nullable|string|max:100',
            'payment_date' => 'nullable|date', // If not supplied, we'll default to today
        ]);

        $student = Student::findOrFail($request->student_id);

        Payment::create([
            'student_id' => $student->id,
            'school_id' => $school->id,
            'amount' => $request->amount_paid,
            'term' => $request->term,
            'year' => now()->year,
            'payment_date' => $request->payment_date ?? now(),
            'method' => $request->method,
            'reference' => $request->reference,
        ]);

        return back()->with('success', 'Payment recorded.');
    }
    protected function authorizeSchoolAdmin(School $school)
    {
        $user = auth()->user();
        if (!$user->hasRole('school_admin') || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized');
        }
    }
}
