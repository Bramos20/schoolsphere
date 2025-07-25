<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('subject_teacher_stream', function (Blueprint $table) {
            // Add authorization fields
            $table->boolean('can_enter_results')->default(true)->after('stream_id');
            $table->boolean('can_view_analytics')->default(false)->after('can_enter_results');
            $table->boolean('is_head_of_department')->default(false)->after('can_view_analytics');
            $table->timestamp('assigned_at')->nullable()->after('is_head_of_department');
            $table->foreignId('assigned_by')->nullable()->after('assigned_at')->constrained('users')->onDelete('set null');
            
            // Indexes
            $table->index(['teacher_id', 'can_enter_results']);
            $table->index(['subject_id', 'is_head_of_department']);
        });
    }

    public function down()
    {
        Schema::table('subject_teacher_stream', function (Blueprint $table) {
            $table->dropColumn(['can_enter_results', 'can_view_analytics', 'is_head_of_department', 'assigned_at', 'assigned_by']);
        });
    }
};
