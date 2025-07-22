<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('requisition_approvals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('requisition_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('approval_type', ['accountant_approval', 'admin_approval']);
            $table->enum('status', ['approved', 'rejected']);
            $table->text('comments')->nullable();
            $table->timestamp('approved_at');
            $table->timestamps();

            $table->foreign('requisition_id')->references('id')->on('requisitions')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->unique(['requisition_id', 'approval_type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('requisition_approvals');
    }
};
