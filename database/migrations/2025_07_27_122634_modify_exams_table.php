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
        Schema::table('exams', function (Blueprint $table) {
            // Remove columns we don't need
            $table->dropColumn(['start_time', 'end_time', 'duration_minutes', 'date']);
            
            // Add simplified date columns
            $table->date('start_date')->after('description');
            $table->date('end_date')->after('start_date');
            
            // Remove term and academic_year as they come from exam_series
            $table->dropColumn(['term', 'academic_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn(['start_date', 'end_date']);
            $table->date('date')->after('description');
            $table->time('start_time')->after('date');
            $table->time('end_time')->after('start_time');
            $table->integer('duration_minutes')->after('end_time');
            $table->integer('term')->nullable()->after('exam_status');
            $table->string('academic_year')->nullable()->after('term');
        });
    }
};
