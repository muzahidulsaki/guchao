import React, { useState } from 'react';
import { PlusIcon, MoreHorizontalIcon, Trash2Icon, XIcon } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { Column, Task } from '../../types/kanban';

type KanbanColumnProps = {
  column: Column;
  allColumns?: Column[];
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onAddTask: (columnId: number, title: string) => void;
  onDeleteColumn: (columnId: number) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
  onDropTask: (columnId: number) => void;
  onMoveTask?: (taskId: number, targetColumnId: number) => void;
  onDeleteTask?: (taskId: number, taskKey: string) => void;
};

export function KanbanColumn({
  column,
  allColumns = [],
  tasks,
  onSelectTask,
  onAddTask,
  onDeleteColumn,
  onDragStart,
  onDropTask,
  onMoveTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(column.id, newTitle.trim());
    setNewTitle('');
    setIsAdding(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDropTask(column.id);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex h-full w-[84vw] max-w-[330px] sm:w-[310px] min-w-[84vw] sm:min-w-[310px] snap-center shrink-0 flex-col rounded-2xl border transition-colors duration-150 ${
        isDragOver
          ? 'border-brand-500/70 bg-slate-900/90 ring-2 ring-brand-500/20'
          : 'border-slate-800/80 bg-slate-950/70'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 rounded-full ring-2 ring-slate-800"
            style={{ backgroundColor: column.color || '#6366f1' }}
          />
          <h3 className="font-display text-sm font-semibold tracking-wide text-slate-100">
            {column.title}
          </h3>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-800/90 px-1.5 text-[11px] font-mono font-medium text-slate-400">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800/80 hover:text-red-400 transition-colors"
            title="Delete column"
          >
            <Trash2Icon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Task Cards List (Scrollable) */}
      <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5 sm:p-3 max-h-[calc(100vh-230px)] sm:max-h-[calc(100vh-250px)]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            allColumns={allColumns}
            onSelect={onSelectTask}
            onDragStart={onDragStart}
            onMoveTask={onMoveTask}
            onDeleteTask={onDeleteTask}
          />
        ))}

        {tasks.length === 0 && !isAdding && (
          <div className="rounded-xl border border-dashed border-slate-800/80 py-8 text-center text-xs text-slate-500">
            No tasks yet. Drop here or add one below.
          </div>
        )}
      </div>

      {/* Bottom: Quick Add Task */}
      <div className="p-3 pt-1 border-t border-slate-800/40">
        {isAdding ? (
          <form onSubmit={handleAddSubmit} className="space-y-2">
            <textarea
              autoFocus
              rows={2}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddSubmit(e);
                }
              }}
              placeholder="What needs to be done?"
              className="w-full rounded-xl border border-brand-500/50 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-500 transition-colors"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Add Card
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewTitle('');
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-transparent py-2 text-xs font-medium text-slate-400 hover:border-slate-800 hover:bg-slate-900/60 hover:text-slate-200 transition-all"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            <span>Add a card</span>
          </button>
        )}
      </div>
    </div>
  );
}
