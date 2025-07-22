<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('requisitions', function (Blueprint $table) {
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium')->after('status');
            $table->unsignedBigInteger('department_id')->nullable()->after('user_id');
            $table->decimal('total_estimated_cost', 10, 2)->default(0)->after('description');
            $table->timestamp('submission_date')->nullable()->after('total_estimated_cost');
            $table->timestamp('accountant_approval_at')->nullable();
            $table->unsignedBigInteger('accountant_approval_by')->nullable();
            $table->timestamp('admin_approval_at')->nullable();
            $table->unsignedBigInteger('admin_approval_by')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->unsignedBigInteger('rejected_by')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->foreign('department_id')->references('id')->on('departments')->onDelete('set null');
            $table->foreign('accountant_approval_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('admin_approval_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('rejected_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('requisitions', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['accountant_approval_by']);
            $table->dropForeign(['admin_approval_by']);
            $table->dropForeign(['rejected_by']);

            $table->dropColumn([
                'priority',
                'department_id',
                'total_estimated_cost',
                'submission_date',
                'accountant_approval_at',
                'accountant_approval_by',
                'admin_approval_at',
                'admin_approval_by',
                'rejected_at',
                'rejected_by',
                'rejection_reason'
            ]);
        });
    }
};
