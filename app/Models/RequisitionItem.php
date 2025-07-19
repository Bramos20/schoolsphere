<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequisitionItem extends Model
{
    protected $fillable = ['requisition_id', 'item_name', 'quantity', 'estimated_cost'];

    public function requisition()
    {
        return $this->belongsTo(Requisition::class);
    }
}