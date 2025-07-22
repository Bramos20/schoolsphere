<?php

namespace App\Traits;

use App\Models\Role;
use Illuminate\Support\Collection;

trait HasRoles
{
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function hasRole($role)
    {
        if (is_string($role)) {
            return $this->roles->contains('slug', $role);
        }

        return (bool) $role->intersect($this->roles)->count();
    }

    public function getRoleNames(): Collection
    {
        return $this->roles->pluck('name');
    }
}
