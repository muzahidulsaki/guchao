<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('task_assignees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['task_id', 'user_id']);
        });

        // Populate task_assignees from existing tasks with assignee_id
        if (Schema::hasColumn('tasks', 'assignee_id')) {
            $existingTasks = DB::table('tasks')
                ->whereNotNull('assignee_id')
                ->select('id', 'assignee_id')
                ->get();

            foreach ($existingTasks as $t) {
                DB::table('task_assignees')->insertOrIgnore([
                    'task_id' => $t->id,
                    'user_id' => $t->assignee_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_assignees');
    }
};
