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
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grading_system_id')->constrained()->onDelete('cascade');
            $table->string('grade');
            $table->string('description')->nullable();
            $table->decimal('min_score', 5, 2);
            $table->decimal('max_score', 5, 2);
            $table->decimal('points', 5, 2)->default(0);
            $table->string('color', 7)->nullable(); // Hex color
            $table->string('remarks')->nullable();
            $table->timestamps();

            $table->index(['grading_system_id', 'min_score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
