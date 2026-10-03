<?php

namespace Database\Seeders;

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use App\Models\TaskActivity;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $board = Board::create([
            'title' => 'Guchao Product Sprint',
            'slug' => 'guchao-product-sprint',
            'prefix' => 'GUC',
            'task_counter' => 5,
            'color' => 'indigo',
            'description' => 'Main agile development sprint for Guchao Task Management platform.',
        ]);

        $todo = Column::create([
            'board_id' => $board->id,
            'title' => 'To Do / Backlog',
            'order' => 1,
            'color' => '#64748B', // slate
        ]);

        $inProgress = Column::create([
            'board_id' => $board->id,
            'title' => 'In Progress',
            'order' => 2,
            'color' => '#3B82F6', // blue
        ]);

        $review = Column::create([
            'board_id' => $board->id,
            'title' => 'In Review',
            'order' => 3,
            'color' => '#EAB308', // amber
        ]);

        $done = Column::create([
            'board_id' => $board->id,
            'title' => 'Done & Verified',
            'order' => 4,
            'color' => '#10B981', // emerald
        ]);

        // Tasks
        $task1 = Task::create([
            'board_id' => $board->id,
            'column_id' => $inProgress->id,
            'task_key' => 'GUC-1',
            'title' => 'Implement drag-and-drop Kanban cards',
            'description' => 'Enable smooth dragging across columns with instant state updates and reordering persistence.',
            'priority' => 'urgent',
            'order' => 1,
            'due_date' => now()->addDays(2)->format('Y-m-d'),
            'labels' => ['Frontend', 'Kanban', 'Feature'],
            'assignee_name' => 'Saki',
            'assignee_avatar' => 'S',
        ]);

        $task2 = Task::create([
            'board_id' => $board->id,
            'column_id' => $todo->id,
            'task_key' => 'GUC-2',
            'title' => 'Configure real-time sub-domain routing on cPanel',
            'description' => 'Connect guchao.heiseenbug.com to /guchao/public document root with SSL certificate.',
            'priority' => 'high',
            'order' => 1,
            'due_date' => now()->addDays(4)->format('Y-m-d'),
            'labels' => ['DevOps', 'cPanel', 'Infrastructure'],
            'assignee_name' => 'Engineer',
            'assignee_avatar' => 'E',
        ]);

        $task3 = Task::create([
            'board_id' => $board->id,
            'column_id' => $todo->id,
            'task_key' => 'GUC-3',
            'title' => 'Add task filter by priority and label tags',
            'description' => 'Allow quick search by task key (e.g. GUC-101) or filter by Urgent/High status.',
            'priority' => 'medium',
            'order' => 2,
            'due_date' => now()->addDays(7)->format('Y-m-d'),
            'labels' => ['UI/UX', 'Search'],
            'assignee_name' => 'Saki',
            'assignee_avatar' => 'S',
        ]);

        $task4 = Task::create([
            'board_id' => $board->id,
            'column_id' => $review->id,
            'task_key' => 'GUC-4',
            'title' => 'Automatic sequential task ID generator',
            'description' => 'Ensure every card created automatically gets the board prefix and incremental number (GUC-xxx).',
            'priority' => 'urgent',
            'order' => 1,
            'due_date' => now()->addDay()->format('Y-m-d'),
            'labels' => ['Backend', 'Core Engine'],
            'assignee_name' => 'Lead Dev',
            'assignee_avatar' => 'L',
        ]);

        $task5 = Task::create([
            'board_id' => $board->id,
            'column_id' => $done->id,
            'task_key' => 'GUC-5',
            'title' => 'Initialize Guchao Laravel + React architecture',
            'description' => 'Set up database schema, Inertia adapter, and Tailwind modern design tokens.',
            'priority' => 'high',
            'order' => 1,
            'due_date' => now()->subDay()->format('Y-m-d'),
            'labels' => ['Architecture', 'Setup'],
            'assignee_name' => 'Saki',
            'assignee_avatar' => 'S',
        ]);

        // Activities
        TaskActivity::create([
            'task_id' => $task1->id,
            'user_name' => 'Saki',
            'type' => 'activity',
            'content' => 'Moved task from To Do to In Progress',
        ]);

        TaskActivity::create([
            'task_id' => $task1->id,
            'user_name' => 'Saki',
            'type' => 'comment',
            'content' => 'Initial Drag-and-drop handler tested. Fluid movement and animations working smoothly.',
        ]);
    }
}
