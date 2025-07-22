<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Requisition extends Model
{
    protected $fillable = [
        'school_id', 
        'user_id', 
        'title', 
        'description', 
        'status',
        'priority',
        'department_id',
        'total_estimated_cost',
        'submission_date',
        'accountant_approval_at',
        'accountant_approval_by',
        'admin_approval_at',
        'admin_approval_by',
        'rejected_at',
        'rejected_by',
        'rejection_reason'
    ];

    protected $casts = [
        'submission_date' => 'datetime',
        'accountant_approval_at' => 'datetime',
        'admin_approval_at' => 'datetime',
        'rejected_at' => 'datetime',
        'total_estimated_cost' => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(RequisitionItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function approvals()
    {
        return $this->hasMany(RequisitionApproval::class);
    }

    public function accountantApproval()
    {
        return $this->hasOne(RequisitionApproval::class)->where('approval_type', 'accountant_approval');
    }

    public function adminApproval()
    {
        return $this->hasOne(RequisitionApproval::class)->where('approval_type', 'admin_approval');
    }

    // Status helper methods
    public function isPendingAccountantApproval()
    {
        return $this->status === 'pending_accountant_approval';
    }

    public function isPendingAdminApproval()
    {
        return $this->status === 'pending_admin_approval';
    }

    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function isRejected()
    {
        return $this->status === 'rejected';
    }

    public function canBeEdited()
    {
        return in_array($this->status, ['pending_accountant_approval', 'rejected']);
    }

    // Get status badge color for frontend
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending_accountant_approval' => 'yellow',
            'pending_admin_approval' => 'blue',
            'approved' => 'green',
            'rejected' => 'red',
            default => 'gray'
        };
    }

    // Get priority color for frontend
    public function getPriorityColorAttribute()
    {
        return match($this->priority) {
            'low' => 'gray',
            'medium' => 'blue',
            'high' => 'orange',
            'urgent' => 'red',
            default => 'gray'
        };
    }
}