<?php

use App\Http\Controllers\BoardController;
use Illuminate\Support\Facades\Route;

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

// Browser-based DB Setup (No terminal needed)
Route::get('/setup-db', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        $migrate = \Illuminate\Support\Facades\Artisan::output();

        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        $seed = \Illuminate\Support\Facades\Artisan::output();

        return response()->json([
            'status' => 'success',
            'message' => 'Database migrated and seeded successfully!',
            'migrate_output' => $migrate,
            'seed_output' => $seed,
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
    return 'All cache cleared successfully!';
});

