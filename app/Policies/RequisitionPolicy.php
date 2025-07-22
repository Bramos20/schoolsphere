<?php

namespace App\Policies;

use App\Models\User;
use App\Models\School;
use App\Models\Requisition;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Log;

class RequisitionPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any requisitions.
     */
    public function viewAny(User $user, School $school)
    {
        // Check if user belongs to this school
        return $user->school_id === $school->id ||
               $user->hasRole(['super_admin', 'company_admin']);
    }

    /**
     * Determine whether the user can view the requisition.
     */
    public function view(User $user, Requisition $requisition, School $school)
    {
        // Users can view their own requisitions
        if ($requisition->user_id === $user->id) {
            return true;
        }

        // Accountants and admins can view all requisitions in their school
        if ($user->hasRole(['accountant', 'admin']) && 
            $user->school_id === $school->id) {
            return true;
        }

        // Super admins and company admins can view all
        return $user->hasRole(['super_admin', 'company_admin']);
    }

    /**
     * Determine whether the user can create requisitions.
     */
    public function create(User $user, School $school)
    {
        Log::info('Checking if user can create requisition', [
            'user_id' => $user->id,
            'user_roles' => $user->getRoleNames(),
            'user_school_id' => $user->school_id,
            'school_id' => $school->id,
        ]);

        // HODs, Librarians, and admins can create requisitions
        return $user->hasRole(['hod', 'librarian', 'admin']) &&
            $user->school_id === $school->id;
    }

    /**
     * Determine whether the user can update the requisition.
     */
    public function update(User $user, Requisition $requisition, School $school)
    {
        // Only the requisition creator can update their own requisition
        if ($requisition->user_id !== $user->id) {
            return false;
        }

        // Can only update if status allows editing
        if (!$requisition->canBeEdited()) {
            return false;
        }

        // Must belong to the school
        return $user->school_id === $school->id;
    }

    /**
     * Determine whether the user can delete the requisition.
     */
    public function delete(User $user, Requisition $requisition, School $school)
    {
        // Only the requisition creator can delete their own requisition
        if ($requisition->user_id !== $user->id) {
            return false;
        }

        // Can only delete if still pending initial approval
        if ($requisition->status !== 'pending_accountant_approval') {
            return false;
        }

        // Must belong to the school
        return $user->school_id === $school->id;
    }

    /**
     * Determine whether the user can approve the requisition.
     */
    public function approve(User $user, Requisition $requisition, School $school)
    {
        // Must belong to the school
        if ($user->school_id !== $school->id &&
            !$user->hasRole(['super_admin', 'company_admin'])) {
            return false;
        }

        // Accountants can approve if pending accountant approval
        if ($requisition->status === 'pending_accountant_approval' && $user->hasRole('accountant')) {
            return true;
        }

        // Admins can approve if pending admin approval
        if ($requisition->status === 'pending_admin_approval' && $user->hasRole(['admin', 'super_admin'])) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can reject the requisition.
     */
    public function reject(User $user, Requisition $requisition, School $school)
    {
        // Must belong to the school
        if ($user->school_id !== $school->id &&
            !$user->hasRole(['super_admin', 'company_admin'])) {
            return false;
        }

        // Accountants can reject if pending accountant approval
        if ($requisition->status === 'pending_accountant_approval' && $user->hasRole('accountant')) {
            return true;
        }

        // Admins can reject if pending admin approval
        if ($requisition->status === 'pending_admin_approval' && $user->hasRole(['admin', 'super_admin'])) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can export requisitions.
     */
    public function export(User $user, School $school)
    {
        // Accountants and admins can export requisitions
        return $user->hasRole(['accountant', 'admin', 'super_admin', 'company_admin']) && 
               ($user->school_id === $school->id ||
                $user->hasRole(['super_admin', 'company_admin']));
    }

    /**
     * Determine whether the user can view reports.
     */
    public function viewReports(User $user, School $school)
    {
        // Accountants and admins can view reports
        return $user->hasRole(['accountant', 'admin', 'super_admin', 'company_admin']) && 
               ($user->school_id === $school->id ||
                $user->hasRole(['super_admin', 'company_admin']));
    }

    /**
     * Determine whether the user can bulk approve requisitions.
     */
    public function bulkApprove(User $user, School $school)
    {
        // Only admins and super admins can bulk approve
        return $user->hasRole(['admin', 'super_admin']) && 
               ($user->school_id === $school->id ||
                $user->hasRole('super_admin'));
    }

    /**
     * Determine whether the user can view approval history.
     */
    public function viewApprovalHistory(User $user, Requisition $requisition, School $school)
    {
        // Users can view approval history of their own requisitions
        if ($requisition->user_id === $user->id) {
            return true;
        }

        // Accountants and admins can view approval history
        return $user->hasRole(['accountant', 'admin', 'super_admin', 'company_admin']) && 
               ($user->school_id === $school->id ||
                $user->hasRole(['super_admin', 'company_admin']));
    }
}