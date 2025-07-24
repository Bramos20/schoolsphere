<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'company_id'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function departments()
    {
        return $this->hasMany(\App\Models\Department::class);
    }

    public function classes()
    {
        return $this->hasMany(SchoolClass::class);
    }

    public function requisitions()
    {
        return $this->hasMany(Requisition::class);
    }

    public function exams()
    {
        return $this->hasMany(Exam::class);
    }

    public function timetables()
    {
        return $this->hasMany(Timetable::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }

    public function gradingSystems()
    {
        return $this->hasMany(GradingSystem::class);
    }

    public function examCategories()
    {
        return $this->hasMany(ExamCategory::class);
    }

    public function examSeries()
    {
        return $this->hasMany(ExamSeries::class);
    }

    public function getDefaultGradingSystem()
    {
        return $this->gradingSystems()->where('is_default', true)->first();
    }
}
