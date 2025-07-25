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
        Schema::create('exam_paper_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_result_id')->constrained()->onDelete('cascade');
            $table->foreignId('exam_paper_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->decimal('marks', 8, 2);
            $table->boolean('is_absent')->default(false);
            $table->foreignId('entered_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('entered_at');
            $table->timestamps();
            
            $table->unique(['exam_result_id', 'exam_paper_id']);
            $table->index(['exam_paper_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_paper_results');
    }
};
