<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use App\Models\TaskActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BoardController extends Controller
{
    /**
     * Display boards list or redirect to primary board.
     */
    public function index()
    {
        $board = Board::with(['columns.tasks.activities'])->first();

        if (! $board) {
            $board = Board::create([
                'title' => 'Main Product Board',
                'slug' => 'main-product-board',
                'prefix' => 'GUC',
                'color' => 'indigo',
                'description' => 'Agile task management and Kanban pipeline',
            ]);

            Column::create(['board_id' => $board->id, 'title' => 'To Do', 'order' => 1, 'color' => '#64748B']);
            Column::create(['board_id' => $board->id, 'title' => 'In Progress', 'order' => 2, 'color' => '#3B82F6']);
            Column::create(['board_id' => $board->id, 'title' => 'Done', 'order' => 3, 'color' => '#10B981']);
        }

        return redirect()->route('boards.show', $board->id);
    }

    /**
     * Show a specific Kanban board.
     */
    public function show(Board $board): Response
    {
        $allBoards = Board::select('id', 'title', 'prefix', 'slug', 'color')->get();

        $board->load([
            'columns' => function ($q) {
                $q->orderBy('order');
            },
            'columns.tasks' => function ($q) {
                $q->orderBy('order');
            },
            'columns.tasks.activities' => function ($q) {
                $q->latest();
            },
        ]);

        return Inertia::render('Board', [
            'board' => $board,
            'allBoards' => $allBoards,
        ]);
    }

    /**
     * Create a new task with automatic sequential task key (e.g. GUC-101).
     */
    public function storeTask(Request $request, Board $board)
    {
        $validated = $request->validate([
            'column_id' => 'required|exists:columns,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:urgent,high,medium,low',
            'due_date' => 'nullable|date',
            'labels' => 'nullable|array',
            'assignee_name' => 'nullable|string|max:100',
        ]);

        // Auto task ID generation: e.g. GUC-1, GUC-2, GUC-101
        $taskKey = $board->generateNextTaskKey();

        $maxOrder = Task::where('column_id', $validated['column_id'])->max('order') ?? 0;

        $task = Task::create([
            'board_id' => $board->id,
            'column_id' => $validated['column_id'],
            'task_key' => $taskKey,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'] ?? 'medium',
            'order' => $maxOrder + 1,
            'due_date' => $validated['due_date'] ?? null,
            'labels' => $validated['labels'] ?? [],
            'assignee_name' => $validated['assignee_name'] ?? 'Team Member',
            'assignee_avatar' => substr($validated['assignee_name'] ?? 'T', 0, 1),
        ]);

        TaskActivity::create([
            'task_id' => $task->id,
            'user_name' => 'Admin',
            'type' => 'activity',
            'content' => "Created task {$taskKey}",
        ]);

        return back()->with('success', "Task {$taskKey} created successfully!");
    }

    /**
     * Update task details (title, description, priority, due date, labels).
     */
    public function updateTask(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:urgent,high,medium,low',
            'due_date' => 'nullable|date',
            'labels' => 'nullable|array',
            'assignee_name' => 'nullable|string|max:100',
        ]);

        $task->update($validated);

        return back()->with('success', "Task {$task->task_key} updated.");
    }

    /**
     * Move task across columns or reorder within column (Drag & Drop persistence).
     */
    public function moveTask(Request $request, Task $task)
    {
        $validated = $request->validate([
            'column_id' => 'required|exists:columns,id',
            'order' => 'required|integer',
        ]);

        $oldColumn = $task->column;
        $newColumn = Column::findOrFail($validated['column_id']);

        $task->update([
            'column_id' => $validated['column_id'],
            'order' => $validated['order'],
        ]);

        if ($oldColumn->id !== $newColumn->id) {
            TaskActivity::create([
                'task_id' => $task->id,
                'user_name' => 'Member',
                'type' => 'activity',
                'content' => "Moved from {$oldColumn->title} to {$newColumn->title}",
            ]);
        }

        return back();
    }

    /**
     * Delete a task.
     */
    public function deleteTask(Task $task)
    {
        $key = $task->task_key;
        $task->delete();

        return back()->with('success', "Task {$key} deleted.");
    }

    /**
     * Add a new column/list to the board.
     */
    public function storeColumn(Request $request, Board $board)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'color' => 'nullable|string|max:50',
        ]);

        $maxOrder = Column::where('board_id', $board->id)->max('order') ?? 0;

        Column::create([
            'board_id' => $board->id,
            'title' => $validated['title'],
            'order' => $maxOrder + 1,
            'color' => $validated['color'] ?? '#64748B',
        ]);

        return back()->with('success', 'Column added.');
    }

    /**
     * Delete a column.
     */
    public function deleteColumn(Column $column)
    {
        $column->delete();

        return back()->with('success', 'Column deleted.');
    }

    /**
     * Add a comment to a task.
     */
    public function storeComment(Request $request, Task $task)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
            'user_name' => 'nullable|string|max:100',
        ]);

        TaskActivity::create([
            'task_id' => $task->id,
            'user_name' => $validated['user_name'] ?? 'Team Member',
            'type' => 'comment',
            'content' => $validated['content'],
        ]);

        return back()->with('success', 'Comment added.');
    }
}
