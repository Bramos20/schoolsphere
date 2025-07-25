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
        Schema::create('exam_papers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->integer('paper_number'); // 1, 2, 3
            $table->string('paper_name'); // 'Theory', 'Practical', 'Project'
            $table->integer('total_marks');
            $table->integer('pass_mark')->default(40);
            $table->integer('duration_minutes');
            $table->decimal('percentage_weight', 5, 2); // How much this paper contributes to total
            $table->text('instructions')->nullable();
            $table->boolean('is_practical')->default(false);
            $table->timestamps();
            
            $table->unique(['exam_id', 'subject_id', 'paper_number']);
            $table->index(['exam_id', 'subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_papers');
    }
};
