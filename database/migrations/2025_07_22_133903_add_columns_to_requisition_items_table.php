<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('requisition_items', function (Blueprint $table) {
            $table->text('description')->nullable()->after('estimated_cost');
            $table->string('category')->nullable()->after('description');
        });
    }

    public function down()
    {
        Schema::table('requisition_items', function (Blueprint $table) {
            $table->dropColumn(['description', 'category']);
        });
    }
};
