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
            // Add new columns
            $table->foreignId('exam_series_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('exam_category_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('grading_system_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('stream_id')->nullable()->constrained()->onDelete('cascade');
            $table->text('description')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->integer('total_marks')->default(100);
            $table->integer('pass_mark')->default(50);
            $table->boolean('has_practical')->default(false);
            $table->decimal('practical_percentage', 5, 2)->nullable();
            $table->decimal('theory_percentage', 5, 2)->nullable();
            $table->text('instructions')->nullable();
            $table->boolean('is_published')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');

            // Add indexes
            $table->index(['school_id', 'exam_series_id']);
            $table->index(['class_id', 'subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropForeign(['exam_series_id']);
            $table->dropForeign(['exam_category_id']);
            $table->dropForeign(['grading_system_id']);
            $table->dropForeign(['stream_id']);
            $table->dropForeign(['created_by']);
            
            $table->dropColumn([
                'exam_series_id', 'exam_category_id', 'grading_system_id', 'stream_id',
                'description', 'duration_minutes', 'total_marks', 'pass_mark',
                'has_practical', 'practical_percentage', 'theory_percentage',
                'instructions', 'is_published', 'created_by'
            ]);
        });
    }
};
