<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\Student;
use App\Models\Payment;
use App\Models\FeeStructure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class PaymentLedgerController extends Controller
{
    public function show(School $school, Student $student)
    {

        $this->authorizeSchoolAdmin($school);

        // Fetch related user/class/stream info
        $student->load('user', 'class', 'stream');

        // Get all payments
        $payments = Payment::where('student_id', $student->id)
            ->orderBy('year')
            ->orderBy('term')
            ->orderBy('payment_date') // crucial for correct running balance
            ->get();

        // Group payments by year + term
        $grouped = $payments->groupBy(fn($p) => "{$p->year} - {$p->term}");

        // Construct ledger with running balance per group
        $ledger = $grouped->map(function ($items, $termLabel) use ($student) {
            [$year, $term] = explode(' - ', $termLabel);

            // Fetch fee structure for class
            $fee = FeeStructure::where('class_id', $student->class_id)
                ->where('year', $year)
                ->where('term', $term)
                ->first();

            $expected = $fee ? $fee->amount : 0;
            $balance = $expected;

            return $items->map(function ($payment) use (&$balance) {
                $balance -= $payment->amount;

                return [
                    'date' => $payment->payment_date
                        ? Carbon::parse($payment->payment_date)->format('Y-m-d')
                        : 'N/A',
                    'amount' => $payment->amount,
                    'method' => $payment->method ?? 'N/A',
                    'description' => $payment->reference ?? '-',
                    'balance_after' => max($balance, 0),
                ];
            });
        });

        return Inertia::render('SchoolAdmin/PaymentLedger', [
            'school' => $school,
            'student' => [
                'id' => $student->id,
                'name' => optional($student->user)->name,
                'class' => optional($student->class)->name,
                'stream' => optional($student->stream)->name,
            ],
            'ledger' => $ledger,
        ]);
    }

    public function exportPdf(School $school, Student $student)
    {
        $student->load(['user', 'class']);

        $payments = Payment::where('student_id', $student->id)
            ->orderBy('year')
            ->orderBy('term')
            ->orderBy('payment_date')
            ->get();

        $class = $student->class;

        $ledger = $payments->groupBy(function ($payment) {
            return $payment->term . ' - ' . $payment->year;
        })->map(function ($items) use ($class) {
            $first = $items->first();
            $feeStructure = FeeStructure::where('class_id', $class->id)
                ->where('year', $first->year)
                ->where('term', $first->term)
                ->first();

            $balance = $feeStructure ? $feeStructure->amount : 0;

            return $items->map(function ($payment) use (&$balance) {
                $balance -= $payment->amount;

                return [
                    'date' => $payment->payment_date,
                    'amount' => $payment->amount,
                    'method' => $payment->method,
                    'balance' => $balance,
                    'term' => $payment->term,
                    'year' => $payment->year,
                    'reference' => $payment->reference,
                ];
            });
        });

        $pdf = Pdf::loadView('pdf.payment_ledger', [
            'student' => $student,
            'ledger' => $ledger,
        ]);

        return $pdf->stream('payment_ledger.pdf'); // 👈 Ensures correct response headers
    }

    protected function authorizeSchoolAdmin(School $school)
    {
        $user = auth()->user();

        if (!$user->hasRole('school_admin') || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized');
        }
    }
}
