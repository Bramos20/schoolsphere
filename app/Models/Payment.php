<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = ['student_id','school_id', 'amount', 'method', 'payment_date', 'reference', 'term', 'year'];

    public function student() {
        return $this->belongsTo(Student::class);
    }

    public function class()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
