<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('subjects', function (Blueprint $table) {
            // Add fields for subject configuration
            $table->string('subject_code', 10)->nullable()->after('name');
            $table->enum('category', ['core', 'optional', 'extra'])->default('core')->after('subject_code');
            $table->boolean('has_practicals')->default(false)->after('category');
            $table->json('paper_structure')->nullable()->after('has_practicals'); // Default paper structure
            $table->boolean('is_active')->default(true)->after('paper_structure');
            
            // Indexes
            $table->index(['school_id', 'is_active']);
            $table->index(['category']);
        });
    }

    public function down()
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropColumn(['subject_code', 'category', 'has_practicals', 'paper_structure', 'is_active']);
        });
    }
};
