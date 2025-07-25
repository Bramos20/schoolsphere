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
            // Remove old single-class/subject constraints
               $table->dropForeign(['class_id']);
                $table->dropForeign(['stream_id']);
                $table->dropForeign(['subject_id']);
                
                // Then drop the columns
                $table->dropColumn([
                    'class_id', 
                    'stream_id', 
                    'subject_id', 
                    'total_marks', 
                    'pass_mark', 
                    'has_practical', 
                    'practical_percentage', 
                    'theory_percentage'
                ]);

            // Add new flexible scope fields
            $table->enum('scope_type', ['all_school', 'selected_classes', 'single_class'])->after('created_by');
            $table->enum('subject_scope_type', ['all_subjects', 'selected_subjects', 'single_subject'])->after('scope_type');
            $table->enum('exam_status', ['draft', 'active', 'completed', 'published'])->default('draft')->after('subject_scope_type');
            $table->string('term')->after('exam_status'); // 1, 2, 3
            $table->string('academic_year')->after('term');
            
            // Add indexes for better performance
            $table->index(['school_id', 'exam_status']);
            $table->index(['academic_year', 'term']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn(['scope_type', 'subject_scope_type', 'exam_status', 'term', 'academic_year']);
            
            // Re-add old columns (for rollback)
            $table->unsignedBigInteger('class_id')->nullable();
            $table->unsignedBigInteger('stream_id')->nullable();
            $table->unsignedBigInteger('subject_id');
            $table->integer('total_marks');
            $table->integer('pass_mark');
            $table->boolean('has_practical')->default(false);
            $table->decimal('practical_percentage', 5, 2)->nullable();
            $table->decimal('theory_percentage', 5, 2)->nullable();
        });
    }
};
