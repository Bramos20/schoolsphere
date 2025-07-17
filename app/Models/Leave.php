<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Leave extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id', 'type', 'start_date', 'end_date',
        'reason', 'status', 'approved_by',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
