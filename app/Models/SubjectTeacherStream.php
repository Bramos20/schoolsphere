<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubjectTeacherStream extends Model
{
    protected $table = 'subject_teacher_stream';
    protected $fillable = ['teacher_id', 'subject_id', 'stream_id'];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function stream()
    {
        return $this->belongsTo(Stream::class);
    }
}
