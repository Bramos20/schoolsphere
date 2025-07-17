<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeeStructure extends Model
{
    protected $fillable = ['school_id', 'class_id', 'amount', 'term', 'year'];

    public function school() {
        return $this->belongsTo(School::class);
    }

    public function class() {
        return $this->belongsTo(SchoolClass::class);
    }
}
