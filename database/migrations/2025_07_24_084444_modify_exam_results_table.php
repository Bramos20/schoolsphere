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
            // Rename and modify existing columns
            $table->renameColumn('score', 'theory_score');
            
            // Add new columns
            $table->decimal('practical_score', 5, 2)->nullable()->after('theory_score');
            $table->decimal('total_score', 5, 2)->nullable()->after('practical_score');
            $table->decimal('points', 5, 2)->nullable()->after('grade');
            $table->integer('position')->nullable()->after('points');
            $table->text('remarks')->nullable()->after('position');
            $table->boolean('is_absent')->default(false)->after('remarks');
            $table->foreignId('entered_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('entered_at')->nullable();

            // Add indexes
            $table->index(['exam_id', 'total_score']);
            $table->index(['student_id', 'exam_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_results', function (Blueprint $table) {
            $table->renameColumn('theory_score', 'score');
            $table->dropForeign(['entered_by']);
            $table->dropColumn([
                'practical_score', 'total_score', 'points', 'position',
                'remarks', 'is_absent', 'entered_by', 'entered_at'
            ]);
        });
    }
};
