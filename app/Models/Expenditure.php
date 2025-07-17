<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expenditure extends Model
{
    protected $fillable = ['school_id', 'description', 'amount', 'date', 'category', 'paid_to', 'term'];

    public function school() {
        return $this->belongsTo(School::class);
    }
}
