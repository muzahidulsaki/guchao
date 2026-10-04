import React from 'react';
import { CalendarIcon, MessageSquareIcon, AlertCircleIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import type { Task, Priority } from '../../types/kanban';

type TaskCardProps = {
  task: Task;
  onSelect: (task: Task) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
};

const PRIORITY_CONFIG: Record<Priority, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  urgent: { label: 'Urgent', bg: 'bg-red-500/15 border-red-500/30', text: 'text-red-400', icon: AlertCircleIcon },
  high: { label: 'High', bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-400', icon: ArrowUpIcon },
  medium: { label: 'Medium', bg: 'bg-blue-500/15 border-blue-500/30', text: 'text-blue-400', icon: MinusIcon },
  low: { label: 'Low', bg: 'bg-slate-500/15 border-slate-500/30', text: 'text-slate-400', icon: ArrowDownIcon },
};

export function TaskCard({ task, onSelect, onDragStart }: TaskCardProps) {
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const PriorityIcon = priority.icon;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onSelect(task)}
      className="group relative cursor-grab active:cursor-grabbing rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900 hover:shadow-md hover:shadow-indigo-500/5 select-none"
    >
      {/* Top Header: Task Key + Priority */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-semibold tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-md">
          {task.task_key}
        </span>

        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${priority.bg} ${priority.text}`}>
          <PriorityIcon className="h-3 w-3" />
          <span>{priority.label}</span>
        </span>
      </div>

      {/* Title */}
      <h4 className="mt-2.5 text-sm font-semibold text-slate-100 leading-snug line-clamp-2 group-hover:text-white">
        {task.title}
      </h4>

      {/* Description Snippet */}
      {task.description && (
        <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {task.labels.map((label, idx) => (
            <span
              key={idx}
              className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700/60"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Footer Meta: Due Date & Assignee */}
      <div className="mt-3.5 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          {task.due_date && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] ${
                isOverdue ? 'text-red-400 font-medium' : 'text-slate-400'
              }`}
            >
              <CalendarIcon className="h-3 w-3" />
              <span>{task.due_date}</span>
            </span>
          )}

          {task.activities && task.activities.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <MessageSquareIcon className="h-3 w-3" />
              <span>{task.activities.length}</span>
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        <div className="flex items-center gap-1.5" title={task.assignee_name || 'Assignee'}>
          {task.assignee_avatar && (task.assignee_avatar.startsWith('http') || task.assignee_avatar.startsWith('/')) ? (
            <img
              src={task.assignee_avatar}
              alt={task.assignee_name || 'Assignee'}
              className="h-6 w-6 rounded-full object-cover ring-1 ring-white/10 shrink-0"
            />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-indigo-400 text-[10px] font-bold text-white shadow-sm ring-1 ring-white/10 shrink-0">
              {task.assignee_avatar || (task.assignee_name ? task.assignee_name.slice(0, 1).toUpperCase() : 'M')}
            </span>
          )}
          {task.assignee_name && (
            <span className="text-[11px] text-slate-300 max-w-[70px] truncate hidden sm:inline">
              {task.assignee_name.split(' ')[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
