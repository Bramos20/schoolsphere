<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Capitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id', 'year', 'term', 'amount', 'received_date', 'remarks'
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
