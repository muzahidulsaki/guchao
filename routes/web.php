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
