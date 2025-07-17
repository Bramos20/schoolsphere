<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function schools()
    {
        return $this->hasMany(School::class);
    }
    public function admins()
    {
        return $this->hasMany(User::class)->whereHas('roles', function ($q) {
            $q->where('slug', 'company_admin');
        });
    }
}
