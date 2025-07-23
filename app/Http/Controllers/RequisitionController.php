<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\Requisition;
use App\Models\RequisitionApproval;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class RequisitionController extends Controller
{
    use AuthorizesRequests;
    public function index(School $school)
    {
        // Check if user has access to this school
        $this->authorize('viewAny', [Requisition::class, $school]);

        $user = Auth::user();
        
        // Filter requisitions based on user role
        $query = Requisition::with(['user', 'approvals.user', 'items'])
            ->where('school_id', $school->id);
            
        // If user is HOD or Librarian, only show their requisitions
        if ($user->hasRole(['hod', 'librarian'])) {
            $query->where('user_id', $user->id);
        }
        
        $requisitions = $query->latest()->get();

        return Inertia::render('SchoolAdmin/Requisitions/Index', [
            'requisitions' => $requisitions,
            'school' => $school,
            'userRole' => $user->getRoleNames()->first(),
            'canCreate' => $user->can('create', [Requisition::class, $school]),
        ]);
    }

    public function create(School $school)
    {
        $this->authorize('create', [Requisition::class, $school]);

        $departments = $school->departments()->get();

        return Inertia::render('SchoolAdmin/Requisitions/Create', [
            'school' => $school,
            'departments' => $departments,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $this->authorize('create', [Requisition::class, $school]);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.estimated_cost' => 'nullable|numeric|min:0',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'department_id' => 'required|exists:departments,id',
        ]);

        $user = Auth::user();

        $requisition = $school->requisitions()->create([
            'user_id' => $user->id,
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'pending_accountant_approval',
            'priority' => $request->priority ?? 'medium',
            'department_id' => $request->department_id,
            'submission_date' => now(),
        ]);

        // Calculate total estimated cost
        $totalCost = 0;
        foreach ($request->items as $item) {
            $cost = $item['estimated_cost'] ?? 0;
            $requisition->items()->create([
                'item_name' => $item['item_name'],
                'quantity' => $item['quantity'],
                'estimated_cost' => $cost,
            ]);
            $totalCost += $cost * $item['quantity'];
        }

        $requisition->update(['total_estimated_cost' => $totalCost]);

        return redirect()->route('requisitions.index', $school)
            ->with('success', 'Requisition submitted successfully and is awaiting accountant approval.');
    }

    public function show(School $school, Requisition $requisition)
    {
        $this->authorize('view', [$requisition, $school]);

        $requisition->load(['items', 'user', 'approvals.user', 'department']);

        $user = Auth::user();
        $canApprove = false;
        $canReject = false;

        // Check approval permissions based on current status and user role
        if ($requisition->status === 'pending_accountant_approval' && $user->hasRole('accountant')) {
            $canApprove = $canReject = true;
        } elseif ($requisition->status === 'pending_admin_approval' && $user->hasRole('school_admin')) {
            $canApprove = $canReject = true;
        }

        return Inertia::render('SchoolAdmin/Requisitions/Show', [
            'requisition' => $requisition,
            'school' => $school,
            'canApprove' => $canApprove,
            'canReject' => $canReject,
            'userRole' => $user->getRoleNames()->first(),
        ]);
    }

    public function approve(Request $request, School $school, Requisition $requisition)
    {
        $this->authorize('approve', [$requisition, $school]);

        $user = Auth::user();
        $currentStatus = $requisition->status;

        // Validate approval based on current status and user role
        if ($currentStatus === 'pending_accountant_approval' && $user->hasRole('accountant')) {
            $newStatus = 'pending_admin_approval';
            $approvalType = 'accountant_approval';
        } elseif ($currentStatus === 'pending_admin_approval' && $user->hasRole('school_admin')) {
            $newStatus = 'approved_by_admin';
            $approvalType = 'admin_approval';
        } else {
            return back()->withErrors(['error' => 'You are not authorized to approve this requisition at this stage.']);
        }

        // Create approval record
        RequisitionApproval::create([
            'requisition_id' => $requisition->id,
            'user_id' => $user->id,
            'approval_type' => $approvalType,
            'status' => 'approved',
            'comments' => $request->comments,
            'approved_at' => now(),
        ]);

        // Update requisition status
        $requisition->update([
            'status' => $newStatus,
            $approvalType . '_at' => now(),
            $approvalType . '_by' => $user->id,
        ]);

        $message = $newStatus === 'approved' 
            ? 'Requisition fully approved and ready for procurement.' 
            : 'Requisition approved and forwarded to admin for final approval.';

        return back()->with('success', $message);
    }

    public function reject(Request $request, School $school, Requisition $requisition)
    {
        $this->authorize('reject', [$requisition, $school]);

        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $user = Auth::user();
        
        // Determine rejection type based on current status
        if ($requisition->status === 'pending_accountant_approval' && $user->hasRole('accountant')) {
            $approvalType = 'accountant_approval';
        } elseif ($requisition->status === 'pending_admin_approval' && $user->hasRole('school_admin')) {
            $approvalType = 'admin_approval';
        } else {
            return back()->withErrors(['error' => 'You are not authorized to reject this requisition at this stage.']);
        }

        // Create rejection record
        RequisitionApproval::create([
            'requisition_id' => $requisition->id,
            'user_id' => $user->id,
            'approval_type' => $approvalType,
            'status' => 'rejected',
            'comments' => $request->rejection_reason,
            'approved_at' => now(),
        ]);

        // Update requisition status
        $requisition->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejected_by' => $user->id,
            'rejection_reason' => $request->rejection_reason,
        ]);

        return back()->with('success', 'Requisition rejected successfully.');
    }

    public function edit(School $school, Requisition $requisition)
    {
        $this->authorize('update', [$requisition, $school]);

        // Only allow editing if requisition is pending or rejected
        if (!in_array($requisition->status, ['pending_accountant_approval', 'rejected'])) {
            return back()->withErrors(['error' => 'This requisition cannot be edited in its current state.']);
        }

        $requisition->load(['items', 'department']);

        return Inertia::render('SchoolAdmin/Requisitions/Edit', [
            'requisition' => $requisition,
            'school' => $school,
        ]);
    }

    public function update(Request $request, School $school, Requisition $requisition)
    {
        $this->authorize('update', [$requisition, $school]);

        if (!in_array($requisition->status, ['pending_accountant_approval', 'rejected'])) {
            return back()->withErrors(['error' => 'This requisition cannot be updated in its current state.']);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.estimated_cost' => 'nullable|numeric|min:0',
            'priority' => 'sometimes|in:low,medium,high,urgent',
        ]);

        // Update requisition
        $requisition->update([
            'title' => $request->title,
            'description' => $request->description,
            'priority' => $request->priority ?? $requisition->priority,
            'status' => 'pending_accountant_approval', // Reset to initial status
        ]);

        // Delete existing items and create new ones
        $requisition->items()->delete();
        
        $totalCost = 0;
        foreach ($request->items as $item) {
            $cost = $item['estimated_cost'] ?? 0;
            $requisition->items()->create([
                'item_name' => $item['item_name'],
                'quantity' => $item['quantity'],
                'estimated_cost' => $cost,
            ]);
            $totalCost += $cost * $item['quantity'];
        }

        $requisition->update(['total_estimated_cost' => $totalCost]);

        return redirect()->route('requisitions.show', [$school, $requisition])
            ->with('success', 'Requisition updated successfully.');
    }
}