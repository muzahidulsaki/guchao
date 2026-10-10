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
            return false;
        }

        $botUrl = config('services.whatsapp.bot_url', 'http://127.0.0.1:3001');
        $targetGroup = $groupId ?: config('services.whatsapp.group_id');

        try {
            $response = Http::timeout(3)->post("{$botUrl}/send-message", [
                'message' => $message,
                'groupId' => $targetGroup,
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::warning('WhatsApp bot responded with error: ' . $response->body());
            return false;
        } catch (\Throwable $e) {
            // Silently log error without interrupting user workflow
            Log::debug('WhatsApp notification could not be delivered: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify when a new task is created.
     */
    public static function notifyTaskCreated(Task $task, Board $board, ?User $actor = null): bool
    {
        $actorName = $actor ? $actor->name : 'Team Member';
        $columnTitle = $task->column ? $task->column->title : 'To Do';
        $priorityEmoji = match ($task->priority) {
            'urgent' => '🔴 *Urgent*',
            'high' => '🟠 *High*',
            'low' => '🟢 *Low*',
            default => '🔵 *Medium*',
        };

        $assignees = $task->assignees()->pluck('name')->toArray();
        if (empty($assignees) && $task->assignee_name) {
            $assignees = [$task->assignee_name];
        }
        $assigneeStr = ! empty($assignees) ? implode(', ', $assignees) : 'Unassigned';

        $boardUrl = url("/boards/{$board->id}");

        $msg = "📋 *[HeiSeenBug Guchao]* *New Task Created*\n\n"
             . "🔹 *Task:* `{$task->task_key}` — {$task->title}\n"
             . "📁 *Board:* {$board->title}\n"
             . "🏷 *Status:* {$columnTitle}\n"
             . "⚡ *Priority:* {$priorityEmoji}\n"
             . "👥 *Assignees:* {$assigneeStr}\n"
             . "✍️ *Created by:* {$actorName}\n\n"
             . "🔗 *View Task:* {$boardUrl}";

        return self::sendMessage($msg);
    }

    /**
     * Notify when a task moves between columns.
     */
    public static function notifyTaskMoved(Task $task, Column $oldColumn, Column $newColumn, Board $board, ?User $actor = null): bool
    {
        // If moved to Done / Completed, send completion message instead
        if (str_contains(strtolower($newColumn->title), 'done') || str_contains(strtolower($newColumn->title), 'completed')) {
            return self::notifyTaskCompleted($task, $board, $actor);
        }

        $actorName = $actor ? $actor->name : 'Team Member';
        $assignees = $task->assignees()->pluck('name')->toArray();
        if (empty($assignees) && $task->assignee_name) {
            $assignees = [$task->assignee_name];
        }
        $assigneeStr = ! empty($assignees) ? implode(', ', $assignees) : 'None';

        $boardUrl = url("/boards/{$board->id}");

        $msg = "🔄 *[HeiSeenBug Guchao]* *Task Status Updated*\n\n"
             . "🔹 *Task:* `{$task->task_key}` — {$task->title}\n"
             . "📌 *Movement:* `{$oldColumn->title}` ➔ *`{$newColumn->title}`* ⏳\n"
             . "👤 *Updated by:* {$actorName}\n"
             . "👥 *Assignees:* {$assigneeStr}\n\n"
             . "🔗 *Board:* {$boardUrl}";

        return self::sendMessage($msg);
    }

    /**
     * Notify when a task is completed.
     */
    public static function notifyTaskCompleted(Task $task, Board $board, ?User $actor = null): bool
    {
        $actorName = $actor ? $actor->name : 'Team Member';
        $assignees = $task->assignees()->pluck('name')->toArray();
        if (empty($assignees) && $task->assignee_name) {
            $assignees = [$task->assignee_name];
        }
        $assigneeStr = ! empty($assignees) ? implode(', ', $assignees) : 'Team';

        $boardUrl = url("/boards/{$board->id}");

        $msg = "🎉 *[HeiSeenBug Guchao]* *Task Completed!* ✅\n\n"
             . "🔹 *Task:* `{$task->task_key}` — {$task->title}\n"
             . "🏆 *Status:* *`Done`*\n"
             . "👤 *Completed by:* {$actorName}\n"
             . "👥 *Contributors:* {$assigneeStr}\n\n"
             . "🔗 *Board:* {$boardUrl}";

        return self::sendMessage($msg);
    }

    /**
     * Notify when a comment is added to a task.
     */
    public static function notifyCommentAdded(Task $task, string $comment, Board $board, ?User $actor = null): bool
    {
        $actorName = $actor ? $actor->name : 'Team Member';
        $boardUrl = url("/boards/{$board->id}");

        $cleanComment = mb_strimwidth($comment, 0, 150, '...');

        $msg = "💬 *[HeiSeenBug Guchao]* *New Comment*\n\n"
             . "🔹 *Task:* `{$task->task_key}` — {$task->title}\n"
             . "👤 *{$actorName}:*\n"
             . "_{$cleanComment}_\n\n"
             . "🔗 *Reply on Guchao:* {$boardUrl}";

        return self::sendMessage($msg);
    }
}
