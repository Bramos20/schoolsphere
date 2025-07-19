<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\Requisition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RequisitionController extends Controller
{
    public function index(School $school)
    {
        $requisitions = Requisition::with(['user'])
            ->where('school_id', $school->id)
            ->latest()
            ->get();

        return Inertia::render('SchoolAdmin/Requisitions/Index', [
            'requisitions' => $requisitions,
            'school' => $school,
        ]);
    }

    public function create(School $school)
    {
        return Inertia::render('SchoolAdmin/Requisitions/Create', [
            'school' => $school,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.estimated_cost' => 'nullable|numeric|min:0',
        ]);

        $user = Auth::user();

        $requisition = $school->requisitions()->create([
            'user_id' => $user->id,
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'pending_accountant_approval',
        ]);

        foreach ($request->items as $item) {
            $requisition->items()->create([
                'item_name' => $item['item_name'],
                'quantity' => $item['quantity'],
                'estimated_cost' => $item['estimated_cost'] ?? null,
            ]);
        }

        return redirect()->route('requisitions.index', $school)->with('success', 'Requisition submitted successfully.');
    }

    public function show(School $school, Requisition $requisition)
    {
        $requisition->load(['items', 'user']);

        return Inertia::render('SchoolAdmin/Requisitions/Show', [
            'requisition' => $requisition,
            'school' => $school,
        ]);
    }

    public function approve(Request $request, School $school, Requisition $requisition)
    {
        $requisition->update(['status' => 'approved_by_admin']);

        return back()->with('success', 'Requisition approved.');
    }

    public function reject(Request $request, School $school, Requisition $requisition)
    {
        $requisition->update(['status' => 'rejected']);

        return back()->with('success', 'Requisition rejected.');
    }
}
