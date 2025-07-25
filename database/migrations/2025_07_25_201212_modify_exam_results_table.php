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
        Schema::table('exam_results', function (Blueprint $table) {
            
            
            // Enhanced positioning
            $table->integer('class_position')->nullable()->after('position');
            $table->integer('stream_position')->nullable()->after('class_position');
            
            // Verification system
            $table->foreignId('verified_by')->nullable()->after('entered_by')->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable()->after('entered_at');
            
            // Indexes for better performance
            $table->index(['exam_id', 'subject_id']);
            $table->index(['student_id', 'subject_id']);
            $table->index(['total_score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_results', function (Blueprint $table) {
            $table->dropForeign(['subject_id']);
            $table->dropColumn(['subject_id', 'class_position', 'stream_position', 'verified_by', 'verified_at']);
            
            $table->decimal('theory_score', 8, 2)->nullable();
            $table->decimal('practical_score', 8, 2)->nullable();
        });
    }
};
