import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { XIcon, PlusIcon, CalendarIcon, UserIcon, AlertCircleIcon, LayersIcon } from 'lucide-react';
import type { Board, Priority, User } from '../../types/kanban';

type NewTaskModalProps = {
  board: Board;
  members?: User[];
  isOpen: boolean;
  onClose: () => void;
};

export function NewTaskModal({ board, members = [], isOpen, onClose }: NewTaskModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [columnId, setColumnId] = useState<number>(board.columns[0]?.id || 0);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState<number | ''>(members[0]?.id || '');
  const [assigneeName, setAssigneeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !columnId) return;

    setIsSubmitting(true);
    router.post(
      `/boards/${board.id}/tasks`,
      {
        column_id: columnId,
        title: title.trim(),
        description: description.trim() || null,
        priority,
        due_date: dueDate || null,
        assignee_id: assigneeId ? Number(assigneeId) : null,
        assignee_name: assigneeName.trim() || null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setDueDate('');
          onClose();
        },
        onFinish: () => setIsSubmitting(false),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/60 overflow-hidden my-auto">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
              <PlusIcon className="h-4 w-4" />
            </div>
            <h3 className="font-display text-sm font-semibold text-white">Create New Task</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Design auth flow, fix responsive bug..."
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <LayersIcon className="h-3 w-3" />
                Column / Stage
              </label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                {board.columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <AlertCircleIcon className="h-3 w-3" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <CalendarIcon className="h-3 w-3" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <UserIcon className="h-3 w-3" />
                Assignee
              </label>
              {members.length > 0 ? (
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={assigneeName}
                  onChange={(e) => setAssigneeName(e.target.value)}
                  placeholder="Name..."
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes, requirements, checklist..."
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 disabled:opacity-50 transition-all"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Creating...' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
