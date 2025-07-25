<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('exam_categories', function (Blueprint $table) {
            // Add more fields for exam categorization
            // $table->enum('exam_type', ['continuous_assessment', 'mid_term', 'end_term', 'mock', 'national'])->after('name');
            // $table->boolean('counts_towards_promotion')->default(true)->after('weight_percentage');
            // $table->integer('sort_order')->default(0)->after('counts_towards_promotion');
            // $table->boolean('is_active')->default(true)->after('color');
            
            // Indexes
            $table->index(['school_id', 'exam_type']);
            $table->index(['is_active', 'sort_order']);
        });
    }

    public function down()
    {
        Schema::table('exam_categories', function (Blueprint $table) {
            $table->dropColumn(['exam_type', 'counts_towards_promotion', 'sort_order', 'is_active']);
        });
    }
};
