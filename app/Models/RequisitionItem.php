<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequisitionItem extends Model
{
    protected $fillable = [
        'requisition_id', 
        'item_name', 
        'quantity', 
        'estimated_cost',
        'description',
        'category'
    ];

    protected $casts = [
        'estimated_cost' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function requisition()
    {
        return $this->belongsTo(Requisition::class);
    }

    // Calculate total cost for this item
    public function getTotalCostAttribute()
    {
        return $this->quantity * $this->estimated_cost;
    }
}