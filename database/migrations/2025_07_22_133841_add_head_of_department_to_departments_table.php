<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->unsignedBigInteger('head_of_department_id')->nullable()->after('school_id');
            $table->text('description')->nullable()->after('name');
            $table->boolean('is_active')->default(true)->after('description');

            $table->foreign('head_of_department_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropForeign(['head_of_department_id']);
            $table->dropColumn(['head_of_department_id', 'description', 'is_active']);
        });
    }
};
