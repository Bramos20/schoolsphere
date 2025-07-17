<?php

namespace App\Http\Controllers;

use App\Models\Capitation;
use App\Models\Expenditure;
use App\Models\FeeStructure;
use App\Models\Payment;
use App\Models\School;
use Inertia\Inertia;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class AccountsDashboardController extends Controller
{
    public function index(School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $year = request('year') ?? now()->year;
        $term = request('term') ?? 'Term 1';

        // Step 1: Get all fee structures for the school, year, and term
        $feeStructures = FeeStructure::where('school_id', $school->id)
            ->where('year', $year)
            ->where('term', $term)
            ->get();

        // Step 2: Calculate expected fee by class × student count
        $expectedFee = 0;
        foreach ($feeStructures as $fee) {
            $studentCount = Student::where('school_id', $school->id)
                ->where('class_id', $fee->class_id)
                ->count();

            $expectedFee += $fee->amount * $studentCount;
        }

        // Step 3: Collected fees (term + year)
        $collectedFees = Payment::where('school_id', $school->id)
            ->where('year', $year)
            ->where('term', $term)
            ->sum('amount');

        // Step 4: Capitations (term + year)
        $capitations = Capitation::where('school_id', $school->id)
            ->where('year', $year)
            ->where('term', $term)
            ->sum('amount');

        // Step 5: Expenditures (only filter by year since no term column)
        $expenditures = Expenditure::where('school_id', $school->id)
            ->whereYear('date', $year)
            ->where('term', $term)
            ->sum('amount');

        // Grouped fee data
        $terms = ['Term 1', 'Term 2', 'Term 3'];
        $termWiseData = [];

        foreach ($terms as $t) {
            $expected = 0;
            $structures = FeeStructure::where('school_id', $school->id)
                ->where('year', $year)
                ->where('term', $t)
                ->get();

            foreach ($structures as $fee) {
                $students = Student::where('school_id', $school->id)
                    ->where('class_id', $fee->class_id)
                    ->count();

                $expected += $fee->amount * $students;
            }

            $collected = Payment::where('school_id', $school->id)
                ->where('year', $year)
                ->where('term', $t)
                ->sum('amount');

            $termWiseData[$t] = [
                'expected' => $expected,
                'collected' => $collected,
            ];
        }

        $terms = ['Term 1', 'Term 2', 'Term 3'];
        $capByTerm = [];
        $expByTerm = [];

        foreach ($terms as $t) {
            $capByTerm[] = Capitation::where('school_id', $school->id)
                ->where('year', $year)
                ->where('term', $t)
                ->sum('amount');

            $expByTerm[] = Expenditure::where('school_id', $school->id)
                ->where('term', $t)
                ->whereYear('date', $year)
                ->sum('amount');
        }

        $categoryBreakdown = Expenditure::where('school_id', $school->id)
            ->whereYear('date', $year)
            ->when($term, fn($query) => $query->where('term', $term))
            ->select('category', DB::raw('SUM(amount) as amount'))
            ->groupBy('category')
            ->get();

        return Inertia::render('SchoolAdmin/AccountsDashboard', [
            'school' => $school,
            'year' => $year,
            'term' => $term,
            'expectedFees' => $expectedFee,
            'collectedFees' => $collectedFees,
            'capitations' => $capitations,
            'expenditures' => $expenditures,
            'outstanding' => $expectedFee - $collectedFees,
            'balance' => ($capitations + $collectedFees) - $expenditures,
            'termWiseFeeStats' => $termWiseData,
            'categoryBreakdown' => $categoryBreakdown,
            'capVsExpStats' => [
                'labels' => $terms,
                'capitations' => $capByTerm,
                'expenditures' => $expByTerm,
            ]
        ]);
    }

    public function cashflow(School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $year = request('year', now()->year);
        $term = request('term', 'Term 1');

        $inflows = [
            'fees_collected' => \App\Models\Payment::where('school_id', $school->id)
                ->where('year', $year)
                ->where('term', $term)
                ->sum('amount'),

            'capitation_received' => \App\Models\Capitation::where('school_id', $school->id)
                ->where('year', $year)
                ->where('term', $term)
                ->sum('amount'),
        ];

        $outflows = [
            'expenditures' => \App\Models\Expenditure::where('school_id', $school->id)
                ->where('term', $term)
                ->whereYear('date', $year)
                ->sum('amount'),
        ];

        $net = ($inflows['fees_collected'] + $inflows['capitation_received']) - $outflows['expenditures'];

        return Inertia::render('SchoolAdmin/CashFlowStatement', [
            'school' => $school,
            'year' => $year,
            'term' => $term,
            'inflows' => $inflows,
            'outflows' => $outflows,
            'net' => $net,
        ]);
    }

    public function exportPdf(School $school)
    {
        $this->authorizeSchoolAdmin($school);

        $term = request('term', 'Term 1');
        $year = request('year', now()->year);

        $feesCollected = Payment::where('school_id', $school->id)
            ->where('term', $term)
            ->where('year', $year)
            ->sum('amount');

        $capitationReceived = Capitation::where('school_id', $school->id)
            ->where('term', $term)
            ->whereYear('created_at', $year)
            ->sum('amount');

        $expenditures = Expenditure::where('school_id', $school->id)
            ->where('term', $term)
            ->whereYear('date', $year)
            ->sum('amount');

        $net = $feesCollected + $capitationReceived - $expenditures;

        $pdf = Pdf::loadView('pdf.cashflow-statement', [
            'school' => $school,
            'term' => $term,
            'year' => $year,
            'feesCollected' => $feesCollected,
            'capitationReceived' => $capitationReceived,
            'expenditures' => $expenditures,
            'net' => $net,
        ]);

        return $pdf->download("CashFlow_Statement_{$school->id}_{$term}_{$year}.pdf");
    }

    protected function authorizeSchoolAdmin(School $school)
    {
        $user = auth()->user();

        if (!$user->hasRole('school_admin') || $user->school_id !== $school->id) {
            abort(403, 'Unauthorized');
        }
    }
}