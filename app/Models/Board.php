<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Board extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'prefix',
        'task_counter',
        'color',
        'description',
    ];

    public function columns(): HasMany
    {
        return $this->hasMany(Column::class)->orderBy('order');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class)->orderBy('order');
    }

    public function generateNextTaskKey(): string
    {
        $this->increment('task_counter');
        $prefix = strtoupper(trim($this->prefix ?: 'GUC'));
        return "{$prefix}-{$this->task_counter}";
    }
}
