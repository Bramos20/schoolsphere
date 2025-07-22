<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['name', 'school_id', 'head_of_department_id', 'description', 'is_active'];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function staff()
    {
        return $this->hasMany(Staff::class);
    }

    public function headOfDepartment()
    {
        return $this->belongsTo(User::class, 'head_of_department_id');
    }
}
