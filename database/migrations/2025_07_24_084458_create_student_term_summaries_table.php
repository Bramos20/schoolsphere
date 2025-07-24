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
        Schema::create('student_term_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('exam_series_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained('school_classes')->onDelete('cascade');
            $table->foreignId('stream_id')->nullable()->constrained()->onDelete('cascade');
            $table->integer('total_subjects');
            $table->decimal('total_points', 8, 2);
            $table->decimal('average_score', 5, 2);
            $table->string('average_grade');
            $table->integer('overall_position')->nullable();
            $table->integer('class_position')->nullable();
            $table->integer('stream_position')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamp('generated_at');
            $table->timestamps();

            $table->unique(['student_id', 'exam_series_id']);
            $table->index(['exam_series_id', 'class_id']);
            $table->index(['exam_series_id', 'average_score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_term_summaries');
    }
};
