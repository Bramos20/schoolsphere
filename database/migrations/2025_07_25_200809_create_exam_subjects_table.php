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
        Schema::create('exam_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->integer('total_marks');
            $table->integer('pass_mark')->default(40);
            $table->boolean('has_papers')->default(false);
            $table->json('paper_breakdown')->nullable(); // Store paper configuration
            $table->timestamps();
            
            $table->unique(['exam_id', 'subject_id']);
            $table->index(['exam_id']);
            $table->index(['subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_subjects');
    }
};
