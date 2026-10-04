<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\WorkspaceController;
use Illuminate\Support\Facades\Route;

// Authentication routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');
Route::post('/auth/dev-login', [AuthController::class, 'devLogin'])->name('auth.dev-login');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Public Join link
Route::get('/join/{code}', [WorkspaceController::class, 'join'])->name('workspaces.join');

// Board & Kanban views
Route::get('/', [BoardController::class, 'index'])->name('boards.index');
Route::get('/boards/{board}', [BoardController::class, 'show'])->name('boards.show');

// Task actions
Route::post('/boards/{board}/tasks', [BoardController::class, 'storeTask'])->name('tasks.store');
Route::put('/tasks/{task}', [BoardController::class, 'updateTask'])->name('tasks.update');
Route::post('/tasks/{task}/move', [BoardController::class, 'moveTask'])->name('tasks.move');
Route::delete('/tasks/{task}', [BoardController::class, 'deleteTask'])->name('tasks.destroy');
Route::post('/tasks/{task}/comments', [BoardController::class, 'storeComment'])->name('tasks.comments.store');

// Column actions
Route::post('/boards/{board}/columns', [BoardController::class, 'storeColumn'])->name('columns.store');
Route::delete('/columns/{column}', [BoardController::class, 'deleteColumn'])->name('columns.destroy');

// Workspace actions
Route::post('/workspaces', [WorkspaceController::class, 'store'])->name('workspaces.store');
Route::post('/workspaces/{workspace}/invite', [WorkspaceController::class, 'invite'])->name('workspaces.invite');
Route::delete('/workspaces/{workspace}/members/{user}', [WorkspaceController::class, 'removeMember'])->name('workspaces.members.destroy');

// Web-based DB setup runner (for running new migrations on cPanel without terminal)
Route::get('/setup-db', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        $migrate = \Illuminate\Support\Facades\Artisan::output();

        return response()->json([
            'status' => 'success',
            'message' => 'New migrations executed successfully on MySQL!',
            'migrate_output' => $migrate,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});

Route::get('/clear-cache', function () {
    \Illuminate\Support\Facades\Artisan::call('config:clear');
    \Illuminate\Support\Facades\Artisan::call('cache:clear');
    \Illuminate\Support\Facades\Artisan::call('route:clear');
    \Illuminate\Support\Facades\Artisan::call('view:clear');
    \Illuminate\Support\Facades\Artisan::call('package:discover');
    return 'All cache and packages refreshed successfully!';
});
