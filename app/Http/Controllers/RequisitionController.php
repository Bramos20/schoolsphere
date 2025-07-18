<?php

namespace App\Http\Controllers;

use App\Models\Requisition;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class RequisitionController extends Controller
{
    public function index(School $school)
    {
        $user = Auth::user();
        $query = Requisition::where('school_id', $school->id)->with('user', 'items');

        if ($user->hasRole('librarian')) {
            $query->where('user_id', $user->id);
        } elseif ($user->hasRole('hod')) {
            $query->whereHas('user.staff', function ($q) use ($user) {
                $q->where('department_id', $user->staff->department_id);
            });
        }

        if ($user->hasRole('school_admin')) {
            $query->where('status', 'approved_by_accountant');
        }

        $requisitions = $query->get();

        return Inertia::render('SchoolAdmin/Library/Requisitions/Index', [
            'school' => $school,
            'requisitions' => $requisitions,
        ]);
    }

    public function create(School $school)
    {
        return Inertia::render('SchoolAdmin/Library/Requisitions/Create', [
            'school' => $school,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        $requisition = new Requisition();
        $requisition->school_id = $school->id;
        $requisition->user_id = Auth::id();
        $requisition->save();

        foreach ($request->items as $item) {
            $requisition->items()->create($item);
        }

        return redirect()->route('requisitions.index', $school)->with('success', 'Requisition created successfully.');
    }

    public function show(School $school, Requisition $requisition)
    {
        $requisition->load('user', 'items');
        return Inertia::render('SchoolAdmin/Library/Requisitions/Show', [
            'school' => $school,
            'requisition' => $requisition,
        ]);
    }

    public function update(Request $request, School $school, Requisition $requisition)
    {
        $request->validate([
            'status' => 'required|in:approved_by_accountant,approved_by_admin,rejected',
        ]);

        $user = Auth::user();

        if ($request->status === 'approved_by_accountant' && !$user->hasRole('accountant')) {
            abort(403);
        }

        if ($request->status === 'approved_by_admin' && !$user->hasRole('school_admin')) {
            abort(403);
        }

        if ($request->status === 'rejected' && !$user->hasAnyRole(['accountant', 'school_admin', 'hod'])) {
            abort(403);
        }

        $requisition->update($request->only('status'));

        return redirect()->route('requisitions.index', $school)->with('success', 'Requisition updated successfully.');
    }
}