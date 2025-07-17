<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['slug' => 'super_admin', 'name' => 'Super Admin'],
            ['slug' => 'company_admin', 'name' => 'Company Admin'],
            ['slug' => 'school_admin', 'name' => 'School Admin'],
            ['slug' => 'teacher', 'name' => 'Teacher'],
            ['slug' => 'student', 'name' => 'Student'],
            ['slug' => 'accountant', 'name' => 'Accountant'],
            ['slug' => 'librarian', 'name' => 'Librarian'],
            ['slug' => 'receptionist', 'name' => 'Receptionist'],
            ['slug' => 'it_officer', 'name' => 'IT Officer'],
            ['slug' => 'security', 'name' => 'Security'],
            ['slug' => 'hod', 'name' => 'Head of Department'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate($role);
        }
    }
}
