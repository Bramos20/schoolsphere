<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = ['school_id', 'department_id', 'name'];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function teachers()
    {
        return $this->belongsToMany(User::class, 'subject_teacher', 'subject_id', 'teacher_id');
    }

    public function streams()
    {
        return $this->belongsToMany(Stream::class, 'stream_subject');
    }

    public function streamAssignments()
    {
        return $this->hasMany(SubjectTeacherStream::class);
    }
}
