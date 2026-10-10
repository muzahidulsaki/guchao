<?php

namespace App\Services;

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Send a raw formatted text message to WhatsApp group.
     */
    public static function sendMessage(string $message, ?string $groupId = null): bool
    {
        if (! config('services.whatsapp.enabled', true)) {
            Log::info('WhatsApp notification skipped: WHATSAPP_BOT_ENABLED is false.');
            return false;
        }

        $botUrl = config('services.whatsapp.bot_url', 'http://127.0.0.1:3001');
        $targetGroup = $groupId ?: config('services.whatsapp.group_id');

        if (empty($targetGroup)) {
            Log::warning('WhatsApp notification skipped: WHATSAPP_GROUP_ID is not configured in .env');
            return false;
        }

        try {
            $response = Http::timeout(4)->post("{$botUrl}/send-message", [
                'message' => $message,
                'groupId' => $targetGroup,
            ]);

            if ($response->successful()) {
                Log::info("WhatsApp notification sent successfully to group: {$targetGroup}");
                return true;
            }

            Log::warning("WhatsApp bot returned status {$response->status()}: " . $response->body());
            return false;
        } catch (\Throwable $e) {
            Log::warning('WhatsApp bot connection error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify when a new task is created.
     */
    public static function notifyTaskCreated(Task $task, Board $board, ?User $actor = null): bool
    {
        try {
            $actorName = $actor ? $actor->name : 'Team Member';
            $columnTitle = 'To Do';
            try {
                if ($task->column) {
                    $columnTitle = $task->column->title;
                } elseif ($task->column_id) {
                    $c = Column::find($task->column_id);
                    if ($c) $columnTitle = $c->title;
                }
            } catch (\Throwable $e) {
                // Column fallback
            }

            $priorityEmoji = match ($task->priority) {
                'urgent' => '🔴 *Urgent*',
                'high' => '🟠 *High*',
                'low' => '🟢 *Low*',
                default => '🔵 *Medium*',
            };

            $assignees = [];
            try {
                $assignees = $task->assignees()->pluck('name')->toArray();
            } catch (\Throwable $e) {
                // Assignees table fallback
            }

            if (empty($assignees) && ! empty($task->assignee_name)) {
                $assignees = [$task->assignee_name];
            }
            $assigneeStr = ! empty($assignees) ? implode(', ', $assignees) : 'Unassigned';

            $dueDateStr = $task->due_date ? date('M d, Y', strtotime($task->due_date)) : 'None';
            $labelsStr = ! empty($task->labels) ? implode(', ', $task->labels) : '';

            $boardUrl = self::getBoardUrl($board);

            $msg = "📋 *[HeiSeenBug Guchao]* *New Task Created*\n\n"
                 . "🔹 *Task:* `{$task->task_key}` — {$task->title}\n"
                 . "📁 *Board:* {$board->title}\n"
                 . "🏷 *Status:* {$columnTitle}\n"
                 . "⚡ *Priority:* {$priorityEmoji}\n"
                 . "👥 *Assignees:* {$assigneeStr}\n"
                 . ($dueDateStr !== 'None' ? "📅 *Due Date:* {$dueDateStr}\n" : '')
                 . ($labelsStr !== '' ? "🏷️ *Labels:* {$labelsStr}\n" : '')
                 . (! empty($task->description) ? "📄 *Description:* _" . mb_strimwidth($task->description, 0, 120, '...') . "_\n" : '')
                 . "✍️ *Created by:* {$actorName}\n\n"
                 . "🔗 *View Task:* {$boardUrl}";

            return self::sendMessage($msg);
        } catch (\Throwable $e) {
            Log::error('Error building task created notification: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify when a task is updated with details (assignee, priority, due date, description, labels).
     */
    public static function notifyTaskUpdated(Task $task, Board $board, ?User $actor = null): bool
    {
        try {
            $actorName = $actor ? $actor->name : 'Team Member';
            $columnTitle = 'To Do';
            try {
                if ($task->column) {
                    $columnTitle = $task->column->title;
                } elseif ($task->column_id) {
                    $c = Column::find($task->column_id);
                    if ($c) $columnTitle = $c->title;
                }
            } catch (\Throwable $e) {
                // Column fallback
            }

            $priorityEmoji = match ($task->priority) {
                'urgent' => '🔴 *Urgent*',
                'high' => '🟠 *High*',
                'low' => '🟢 *Low*',
                default => '🔵 *Medium*',
            };

            $assignees = [];
            try {
                $assignees = $task->assignees()->pluck('name')->toArray();
            } catch (\Throwable $e) {
                // Assignees table fallback
            }

            if (empty($assignees) && ! empty($task->assignee_name)) {
                $assignees = [$task->assignee_name];
            }
            $assigneeStr = ! empty($assignees) ? implode(', ', $assignees) : 'Unassigned';

            $dueDateStr = $task->due_date ? date('M d, Y', strtotime($task->due_date)) : 'None';
            $labelsStr = ! empty($task->labels) ? implode(', ', $task->labels) : '';

            $boardUrl = self::getBoardUrl($board);

            $msg = "📝 *[HeiSeenBug Guchao]* *Task Details Updated*\n\n"
                 . "🔹 *Task:* `{$task->task_key}` — {$task->title}\n"
                 . "📁 *Board:* {$board->title}\n"
                 . "🏷 *Status:* {$columnTitle}\n"
                 . "⚡ *Priority:* {$priorityEmoji}\n"
                 . "👥 *Assignees:* {$assigneeStr}\n"
                 . ($dueDateStr !== 'None' ? "📅 *Due Date:* {$dueDateStr}\n" : '')
                 . ($labelsStr !== '' ? "🏷️ *Labels:* {$labelsStr}\n" : '')
                 . (! empty($task->description) ? "📄 *Description:* _" . mb_strimwidth($task->description, 0, 120, '...') . "_\n" : '')
                 . "✍️ *Updated by:* {$actorName}\n\n"
                 . "🔗 *View Task:* {$boardUrl}";

            return self::sendMessage($msg);
        } catch (\Throwable $e) {
            Log::error('Error building task updated notification: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify when a task moves between columns.
     */
    public static function notifyTaskMoved(Task $task, Column $oldColumn, Column $newColumn, Board $board, ?User $actor = null): bool
    {
        try {
            // If moved to Done / Completed, send completion message instead
            if (str_contains(strtolower($newColumn->title), 'done') || str_contains(strtolower($newColumn->title), 'completed')) {
                return self::notifyTaskCompleted($task, $board, $actor);
            }

            $actorName = $actor ? $actor->name : 'Team Member';
            $assignees = [];
            try {
                $assignees = $task->assignees()->pluck('name')->toArray();
            } catch (\Throwable $e) {
                // Assignees table fallback
            }

            if (empty($assignees) && ! empty($task->assignee_name)) {
                $assignees = [$task->assignee_name];
            }
            $assigneeStr = ! empty($assignees) ? implode(', ', $assignees) : 'None';

            $boardUrl = self::getBoardUrl($board);

            $msg = "🔄 *[HeiSeenBug Guchao]* *Task Status Updated*\n\n"
                 . "🔹 *Task:* `{$task->task_key}` — {$task->title}\n"
                 . "📌 *Movement:* `{$oldColumn->title}` ➔ *`{$newColumn->title}`* ⏳\n"
                 . "👤 *Updated by:* {$actorName}\n"
                 . "👥 *Assignees:* {$assigneeStr}\n\n"
                 . "🔗 *Board:* {$boardUrl}";

            return self::sendMessage($msg);
        } catch (\Throwable $e) {
            Log::error('Error building task moved notification: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify when a task is completed.
     */
    public static function notifyTaskCompleted(Task $task, Board $board, ?User $actor = null): bool
    {
        try {
            $actorName = $actor ? $actor->name : 'Team Member';
            $assignees = [];
            try {
                $assignees = $task->assignees()->pluck('name')->toArray();
            } catch (\Throwable $e) {
                // Assignees table fallback
            }

            if (empty($assignees) && ! empty($task->assignee_name)) {
                $assignees = [$task->assignee_name];
            }
            $assigneeStr = ! empty($assignees) ? implode(', ', $assignees) : 'Team';

            $boardUrl = self::getBoardUrl($board);

            $msg = "🎉 *[HeiSeenBug Guchao]* *Task Completed!* ✅\n\n"
                 . "🔹 *Task:* `{$task->task_key}` — {$task->title}\n"
                 . "🏆 *Status:* *`Done`*\n"
                 . "👤 *Completed by:* {$actorName}\n"
                 . "👥 *Contributors:* {$assigneeStr}\n\n"
                 . "🔗 *Board:* {$boardUrl}";

            return self::sendMessage($msg);
        } catch (\Throwable $e) {
            Log::error('Error building task completed notification: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify when a comment is added to a task.
     */
    public static function notifyCommentAdded(Task $task, string $comment, Board $board, ?User $actor = null): bool
    {
        try {
            $actorName = $actor ? $actor->name : 'Team Member';
            $boardUrl = self::getBoardUrl($board);

            $cleanComment = mb_strimwidth($comment, 0, 150, '...');

            $msg = "💬 *[HeiSeenBug Guchao]* *New Comment*\n\n"
                 . "🔹 *Task:* `{$task->task_key}` — {$task->title}\n"
                 . "👤 *{$actorName}:*\n"
                 . "_{$cleanComment}_\n\n"
                 . "🔗 *Reply on Guchao:* {$boardUrl}";

            return self::sendMessage($msg);
        } catch (\Throwable $e) {
            Log::error('Error building comment added notification: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Generate canonical board URL for https://guchao.heiseenbug.com.
     */
    private static function getBoardUrl(Board $board): string
    {
        $appUrl = config('app.url');
        if (empty($appUrl) || str_contains($appUrl, 'localhost') || str_contains($appUrl, '127.0.0.1')) {
            $appUrl = 'https://guchao.heiseenbug.com';
        }
        $baseUrl = rtrim($appUrl, '/');
        return "{$baseUrl}/boards/{$board->id}";
    }
}
