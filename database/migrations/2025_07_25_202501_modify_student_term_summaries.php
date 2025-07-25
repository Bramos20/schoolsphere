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
        Schema::table('student_term_summaries', function (Blueprint $table) {
            // Add missing fields for comprehensive reporting
            // $table->string('academic_year')->after('stream_id');
            // $table->string('term')->after('academic_year'); // 1, 2, 3
            // $table->decimal('total_marks', 10, 2)->after('total_points');
            // $table->integer('stream_position')->nullable()->after('class_position');
            $table->text('teacher_comments')->nullable()->after('average_grade');
            $table->text('head_teacher_comments')->nullable()->after('teacher_comments');
            $table->timestamp('published_at')->nullable()->after('generated_at');
            
            // Indexes
            // $table->index(['academic_year', 'term']);
            // $table->index(['class_id', 'average_score']);
            // $table->index(['stream_id', 'average_score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_term_summaries', function (Blueprint $table) {
            $table->dropColumn([
                'academic_year', 'term', 'total_marks', 'stream_position', 
                'teacher_comments', 'head_teacher_comments', 'published_at'
            ]);
        });
    }
};
