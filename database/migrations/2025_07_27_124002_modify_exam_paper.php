<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check what columns exist in exam_subjects pivot table
        $examSubjectsColumns = Schema::getColumnListing('exam_subjects');

        // Update exam_subjects pivot table
        Schema::table('exam_subjects', function (Blueprint $table) use ($examSubjectsColumns) {
            // Remove paper_breakdown column if it exists
            if (in_array('paper_breakdown', $examSubjectsColumns)) {
                $table->dropColumn('paper_breakdown');
            }
            
            // Add paper_count if it doesn't exist
            if (!in_array('paper_count', $examSubjectsColumns)) {
                $table->integer('paper_count')->default(1)->after('has_papers');
            }
        });

        // Check what columns exist in exam_papers table
        $examPapersColumns = Schema::getColumnListing('exam_papers');

        // Update exam_papers table for better structure
        Schema::table('exam_papers', function (Blueprint $table) use ($examPapersColumns) {
            // Add optional specific scheduling for papers if they don't exist
            if (!in_array('paper_date', $examPapersColumns)) {
                $table->date('paper_date')->nullable()->after('instructions');
            }
            if (!in_array('paper_time', $examPapersColumns)) {
                $table->time('paper_time')->nullable()->after('paper_date');
            }
        });

        // Check if index already exists before adding
        $indexes = collect(DB::select("SHOW INDEX FROM exam_papers"))->pluck('Key_name');
        
        if (!$indexes->contains('exam_papers_exam_id_subject_id_index')) {
            Schema::table('exam_papers', function (Blueprint $table) {
                $table->index(['exam_id', 'subject_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_subjects', function (Blueprint $table) {
            $table->dropColumn('paper_count');
            $table->json('paper_breakdown')->nullable()->after('has_papers');
        });

        // Reverse exam_papers table changes
        Schema::table('exam_papers', function (Blueprint $table) {
            $table->dropColumn(['paper_date', 'paper_time']);
            $table->dropIndex(['exam_id', 'subject_id']);
        });
    }
};
