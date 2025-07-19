<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Requisition extends Model
{
    protected $fillable = ['school_id', 'user_id', 'title', 'description', 'status'];

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
}