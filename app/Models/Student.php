<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'school_id', 'class_id', 'stream_id'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function school() {
        return $this->belongsTo(School::class);
    }

    public function class() {
        return $this->belongsTo(SchoolClass::class);
    }

    public function stream() {
        return $this->belongsTo(Stream::class);
    }
}
