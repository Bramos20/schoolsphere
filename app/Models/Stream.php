<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stream extends Model
{
    protected $fillable = ['name', 'class_id'];

    public function class()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'stream_subject');
    }

    public function teachers()
    {
        return $this->belongsToMany(User::class, 'stream_teacher', 'stream_id', 'teacher_id');
    }

    public function subjectTeacherAssignments()
    {
        return $this->hasMany(SubjectTeacherStream::class, 'stream_id');
    }
}
