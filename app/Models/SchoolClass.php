<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    protected $fillable = ['name', 'school_id'];

    public function streams()
    {
        return $this->hasMany(Stream::class, 'class_id');
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function feeStructures()
    {
        return $this->hasMany(\App\Models\FeeStructure::class, 'class_id');
    }
}
