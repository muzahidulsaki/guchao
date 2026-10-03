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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('board_id')->constrained('boards')->cascadeOnDelete();
            $table->foreignId('column_id')->constrained('columns')->cascadeOnDelete();
            $table->string('task_key')->index(); // e.g. GUC-101
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('priority')->default('medium'); // urgent, high, medium, low
            $table->unsignedInteger('order')->default(0);
            $table->date('due_date')->nullable();
            $table->json('labels')->nullable();
            $table->string('assignee_name')->nullable();
            $table->string('assignee_avatar')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
