<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Column;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WorkspaceController extends Controller
{
    /**
     * Create a new workspace.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'color' => 'nullable|string|max:30',
        ]);

        $user = Auth::user();

        $workspace = Workspace::create([
            'name' => $validated['name'],
            'owner_id' => $user->id,
            'description' => $validated['description'] ?? null,
            'color' => $validated['color'] ?? 'indigo',
        ]);

        $workspace->members()->attach($user->id, ['role' => 'owner']);

        // Create default board for new workspace
        $board = Board::create([
            'workspace_id' => $workspace->id,
            'title' => 'Project Pipeline',
            'prefix' => strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $validated['name']), 0, 3)) ?: 'PRJ',
            'color' => $workspace->color,
        ]);

        Column::create(['board_id' => $board->id, 'title' => 'To Do', 'order' => 1, 'color' => '#64748B']);
        Column::create(['board_id' => $board->id, 'title' => 'In Progress', 'order' => 2, 'color' => '#3B82F6']);
        Column::create(['board_id' => $board->id, 'title' => 'Done', 'order' => 3, 'color' => '#10B981']);

        return redirect()->route('boards.show', $board->id)->with('success', "Workspace '{$workspace->name}' created!");
    }

    /**
     * Invite or add member to workspace.
     */
    public function invite(Request $request, Workspace $workspace)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'role' => 'nullable|in:member,admin',
        ]);

        // Check if current user is owner or admin
        $currentMember = $workspace->members()->where('user_id', Auth::id())->first();
        if (! $currentMember || ! in_array($currentMember->pivot->role, ['owner', 'admin'])) {
            return back()->with('error', 'Only workspace owners or admins can invite members.');
        }

        $targetUser = User::where('email', $validated['email'])->first();

        if ($targetUser) {
            if ($workspace->members()->where('user_id', $targetUser->id)->exists()) {
                return back()->with('error', "{$targetUser->name} is already a member of this workspace.");
            }

            $workspace->members()->attach($targetUser->id, [
                'role' => $validated['role'] ?? 'member',
            ]);

            return back()->with('success', "Added {$targetUser->name} to {$workspace->name}!");
        }

        // Target user hasn't registered yet - provide invite link
        $inviteLink = route('workspaces.join', $workspace->invite_code);
        return back()->with('success', "Invitation link: {$inviteLink} (Share this with {$validated['email']})");
    }

    /**
     * Join workspace via shareable invite code link.
     */
    public function join(Request $request, string $code)
    {
        $workspace = Workspace::where('invite_code', $code)->firstOrFail();

        if (! Auth::check()) {
            session(['pending_invite_code' => $code]);
            return redirect()->route('login')->with('info', "Sign in with Google to join '{$workspace->name}'!");
        }

        $user = Auth::user();

        if (! $workspace->members()->where('user_id', $user->id)->exists()) {
            $workspace->members()->attach($user->id, ['role' => 'member']);
        }

        $board = $workspace->boards()->first();
        if ($board) {
            return redirect()->route('boards.show', $board->id)->with('success', "Welcome to {$workspace->name}!");
        }

        return redirect()->route('boards.index');
    }

    /**
     * Remove member from workspace.
     */
    public function removeMember(Workspace $workspace, User $user)
    {
        $currentMember = $workspace->members()->where('user_id', Auth::id())->first();
        if (! $currentMember || ! in_array($currentMember->pivot->role, ['owner', 'admin'])) {
            return back()->with('error', 'Unauthorized to remove members.');
        }

        if ($workspace->owner_id === $user->id) {
            return back()->with('error', 'Cannot remove the workspace owner.');
        }

        $workspace->members()->detach($user->id);

        return back()->with('success', "Removed {$user->name} from workspace.");
    }
}
