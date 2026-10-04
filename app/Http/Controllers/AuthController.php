<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Column;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Show the login page.
     */
    public function showLogin(): Response|\Illuminate\Http\RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('boards.index');
        }

        return Inertia::render('Login', [
            'googleEnabled' => ! empty(config('services.google.client_id')),
        ]);
    }

    /**
     * Redirect to Google OAuth.
     */
    public function redirectToGoogle()
    {
        if (empty(config('services.google.client_id'))) {
            return back()->with('error', 'Google Client ID is not configured yet in .env');
        }

        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google OAuth Callback.
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            return redirect()->route('login')->with('error', 'Google sign-in failed: ' . $e->getMessage());
        }

        $user = User::updateOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName() ?: 'User',
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
            ]
        );

        Auth::login($user, true);

        // Check if there was a pending workspace invite in session
        if ($inviteCode = session('pending_invite_code')) {
            session()->forget('pending_invite_code');
            $workspace = Workspace::where('invite_code', $inviteCode)->first();
            if ($workspace && ! $workspace->members()->where('user_id', $user->id)->exists()) {
                $workspace->members()->attach($user->id, ['role' => 'member']);
                $board = $workspace->boards()->first();
                if ($board) {
                    return redirect()->route('boards.show', $board->id)->with('success', "Joined workspace {$workspace->name}!");
                }
            }
        }

        // If user has no workspace, initialize one for them
        if ($user->workspaces()->count() === 0) {
            $workspace = Workspace::create([
                'name' => "{$user->name}'s Workspace",
                'owner_id' => $user->id,
                'color' => 'indigo',
                'description' => 'Personal collaborative workspace',
            ]);

            $workspace->members()->attach($user->id, ['role' => 'owner']);

            $board = Board::create([
                'workspace_id' => $workspace->id,
                'title' => 'Sprint Tasks',
                'slug' => 'sprint-tasks-' . $user->id,
                'prefix' => 'GUC',
                'color' => 'indigo',
                'description' => 'Agile task pipeline',
            ]);

            Column::create(['board_id' => $board->id, 'title' => 'To Do', 'order' => 1, 'color' => '#64748B']);
            Column::create(['board_id' => $board->id, 'title' => 'In Progress', 'order' => 2, 'color' => '#3B82F6']);
            Column::create(['board_id' => $board->id, 'title' => 'In Review', 'order' => 3, 'color' => '#EAB308']);
            Column::create(['board_id' => $board->id, 'title' => 'Done', 'order' => 4, 'color' => '#10B981']);
        }

        return redirect()->intended(route('boards.index'));
    }

    /**
     * Demo / Fast Dev login for testing before Google credentials are set.
     */
    public function devLogin(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'name' => 'required|string|max:100',
        ]);

        $user = User::updateOrCreate(
            ['email' => $validated['email']],
            [
                'name' => $validated['name'],
                'avatar' => null,
            ]
        );

        Auth::login($user, true);

        if ($user->workspaces()->count() === 0) {
            $workspace = Workspace::create([
                'name' => "{$user->name}'s Workspace",
                'owner_id' => $user->id,
                'color' => 'indigo',
                'description' => 'Personal collaborative workspace',
            ]);

            $workspace->members()->attach($user->id, ['role' => 'owner']);

            $board = Board::create([
                'workspace_id' => $workspace->id,
                'title' => 'Sprint Tasks',
                'slug' => 'sprint-tasks-' . $user->id,
                'prefix' => 'GUC',
                'color' => 'indigo',
            ]);

            Column::create(['board_id' => $board->id, 'title' => 'To Do', 'order' => 1, 'color' => '#64748B']);
            Column::create(['board_id' => $board->id, 'title' => 'In Progress', 'order' => 2, 'color' => '#3B82F6']);
            Column::create(['board_id' => $board->id, 'title' => 'Done', 'order' => 3, 'color' => '#10B981']);
        }

        return redirect()->intended(route('boards.index'));
    }

    /**
     * Log out the authenticated user.
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
