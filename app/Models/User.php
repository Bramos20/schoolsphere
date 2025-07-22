<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'company_id',
        'role',
        'school_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function hasRole($role)
    {
        if (is_string($role)) {
            return $this->roles->contains('slug', $role);
        }

        if (is_array($role)) {
            foreach ($role as $r) {
                if ($this->hasRole($r)) {
                    return true;
                }
            }
        }

        return false;
    }

    public function taughtSubjects()
    {
        return $this->belongsToMany(Subject::class, 'subject_teacher', 'teacher_id', 'subject_id');
    }

    public function streamsTaught()
    {
        return $this->belongsToMany(Stream::class, 'stream_teacher', 'teacher_id', 'stream_id');
    }

    public function subjectStreamAssignments()
    {
        return $this->hasMany(SubjectTeacherStream::class, 'teacher_id');
    }

    public function staff()
    {
        return $this->hasOne(Staff::class);
    }

    public function requisitions()
    {
        return $this->hasMany(Requisition::class);
    }

    public function approvals()
    {
        return $this->hasMany(RequisitionApproval::class);
    }

    public function getRoleNames()
    {
        return $this->roles->pluck('name');
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
