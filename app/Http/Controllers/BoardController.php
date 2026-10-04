<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BoardController extends Controller
{
    /**
     * Display boards list or redirect to primary board.
     */
    public function index()
    {
        $user = Auth::user();

        if ($user) {
            $workspace = $user->workspaces()->first();
            if (! $workspace) {
                $workspace = Workspace::create([
                    'name' => "{$user->name}'s Workspace",
                    'owner_id' => $user->id,
                    'color' => 'indigo',
                ]);
                $workspace->members()->attach($user->id, ['role' => 'owner']);
            }

            $board = $workspace->boards()->first();
            if (! $board) {
                $board = Board::create([
                    'workspace_id' => $workspace->id,
                    'title' => 'Product Pipeline',
                    'slug' => \Illuminate\Support\Str::slug('product-pipeline') . '-' . \Illuminate\Support\Str::random(5),
                    'prefix' => 'GUC',
                    'color' => 'indigo',
                ]);
                Column::create(['board_id' => $board->id, 'title' => 'To Do', 'order' => 1, 'color' => '#64748B']);
                Column::create(['board_id' => $board->id, 'title' => 'In Progress', 'order' => 2, 'color' => '#3B82F6']);
                Column::create(['board_id' => $board->id, 'title' => 'Done', 'order' => 3, 'color' => '#10B981']);
            }

            return redirect()->route('boards.show', $board->id);
        }

        // Fallback for unauthenticated access or initial visit
        $board = Board::first();
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
        $user = Auth::user();

        // Load board's workspace and members
        $workspace = $board->workspace;
        if (! $workspace && $user) {
            $workspace = $user->workspaces()->first();
            if ($workspace) {
                $board->update(['workspace_id' => $workspace->id]);
            }
        }

        $allWorkspaces = $user ? $user->workspaces()->with('boards')->get() : [];
        $workspaceMembers = $workspace ? $workspace->members()->select('users.id', 'users.name', 'users.email', 'users.avatar')->get() : [];

        $allBoards = $workspace
            ? $workspace->boards()->select('id', 'title', 'prefix', 'slug', 'color')->get()
            : Board::select('id', 'title', 'prefix', 'slug', 'color')->get();

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
            'columns.tasks.assignee',
        ]);

        return Inertia::render('Board', [
            'board' => $board,
            'allBoards' => $allBoards,
            'workspace' => $workspace,
            'allWorkspaces' => $allWorkspaces,
            'workspaceMembers' => $workspaceMembers,
            'authUser' => $user,
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
            'assignee_id' => 'nullable|exists:users,id',
            'assignee_name' => 'nullable|string|max:100',
        ]);

        // Auto task ID generation: e.g. GUC-1, GUC-2, GUC-101
        $taskKey = $board->generateNextTaskKey();

        $maxOrder = Task::where('column_id', $validated['column_id'])->max('order') ?? 0;

        $assigneeName = $validated['assignee_name'] ?? null;
        $assigneeAvatar = null;

        if (! empty($validated['assignee_id'])) {
            $assigneeUser = User::find($validated['assignee_id']);
            if ($assigneeUser) {
                $assigneeName = $assigneeUser->name;
                $assigneeAvatar = $assigneeUser->avatar ?: substr($assigneeUser->name, 0, 1);
            }
        } elseif ($assigneeName) {
            $assigneeAvatar = substr($assigneeName, 0, 1);
        }

        $task = Task::create([
            'board_id' => $board->id,
            'column_id' => $validated['column_id'],
            'assignee_id' => $validated['assignee_id'] ?? null,
            'task_key' => $taskKey,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'] ?? 'medium',
            'order' => $maxOrder + 1,
            'due_date' => $validated['due_date'] ?? null,
            'labels' => $validated['labels'] ?? [],
            'assignee_name' => $assigneeName,
            'assignee_avatar' => $assigneeAvatar,
        ]);

        $creatorName = Auth::user() ? Auth::user()->name : 'Member';
        TaskActivity::create([
            'task_id' => $task->id,
            'user_name' => $creatorName,
            'type' => 'activity',
            'content' => "Created task {$taskKey}",
        ]);

        return back()->with('success', "Task {$taskKey} created successfully!");
    }

    /**
     * Update task details (title, description, priority, due date, labels, assignee).
     */
    public function updateTask(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:urgent,high,medium,low',
            'due_date' => 'nullable|date',
            'labels' => 'nullable|array',
            'assignee_id' => 'nullable',
            'assignee_name' => 'nullable|string|max:100',
        ]);

        $assigneeName = $validated['assignee_name'] ?? $task->assignee_name;
        $assigneeAvatar = $task->assignee_avatar;

        if (array_key_exists('assignee_id', $validated)) {
            if (! empty($validated['assignee_id'])) {
                $assigneeUser = User::find($validated['assignee_id']);
                if ($assigneeUser) {
                    $assigneeName = $assigneeUser->name;
                    $assigneeAvatar = $assigneeUser->avatar ?: substr($assigneeUser->name, 0, 1);
                }
            } else {
                $assigneeName = null;
                $assigneeAvatar = null;
            }
        }

        $task->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'] ?? $task->priority,
            'due_date' => $validated['due_date'] ?? null,
            'labels' => $validated['labels'] ?? [],
            'assignee_id' => $validated['assignee_id'] ?? null,
            'assignee_name' => $assigneeName,
            'assignee_avatar' => $assigneeAvatar,
        ]);

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

        if ($oldColumn && $oldColumn->id !== $newColumn->id) {
            $userName = Auth::user() ? Auth::user()->name : 'Member';
            TaskActivity::create([
                'task_id' => $task->id,
                'user_name' => $userName,
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

        $userName = Auth::user() ? Auth::user()->name : ($validated['user_name'] ?? 'Team Member');

        TaskActivity::create([
            'task_id' => $task->id,
            'user_name' => $userName,
            'type' => 'comment',
            'content' => $validated['content'],
        ]);

        return back()->with('success', 'Comment added.');
    }
}
