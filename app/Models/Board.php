<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Board extends Model
{
    protected $fillable = [
        'workspace_id',
        'title',
        'slug',
        'prefix',
        'task_counter',
        'color',
        'description',
    ];

    protected static function booted()
    {
        static::creating(function ($board) {
            if (empty($board->slug)) {
                $board->slug = Str::slug($board->title ?: 'board') . '-' . Str::random(6);
            }
        });
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

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
