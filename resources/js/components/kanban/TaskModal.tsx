import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
  XIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
  MessageSquareIcon,
  Trash2Icon,
  SaveIcon,
  AlertCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  SendIcon,
  ClockIcon,
} from 'lucide-react';
import type { Task, Priority } from '../../types/kanban';

type TaskModalProps = {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
};

const PRIORITIES: { value: Priority; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { value: 'urgent', label: 'Urgent', icon: AlertCircleIcon, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  { value: 'high', label: 'High', icon: ArrowUpIcon, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { value: 'medium', label: 'Medium', icon: MinusIcon, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { value: 'low', label: 'Low', icon: ArrowDownIcon, color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
];

export function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
  if (!isOpen || !task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [assigneeName, setAssigneeName] = useState(task.assignee_name || '');
  const [labels, setLabels] = useState<string[]>(task.labels || []);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setDueDate(task.due_date || '');
    setAssigneeName(task.assignee_name || '');
    setLabels(task.labels || []);
  }, [task]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    router.put(
      `/tasks/${task.id}`,
      {
        title,
        description,
        priority,
        due_date: dueDate || null,
        assignee_name: assigneeName || null,
        labels,
      },
      {
        preserveScroll: true,
        onFinish: () => {
          setIsSaving(false);
          onClose();
        },
      }
    );
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete task ${task.task_key}?`)) {
      router.delete(`/tasks/${task.id}`, {
        preserveScroll: true,
        onSuccess: () => onClose(),
      });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsCommenting(true);
    router.post(
      `/tasks/${task.id}/comments`,
      {
        content: commentText.trim(),
        user_name: 'Team Member',
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setCommentText('');
        },
        onFinish: () => setIsCommenting(false),
      }
    );
  };

  const handleAddLabel = () => {
    const trimmed = newLabelInput.trim();
    if (trimmed && !labels.includes(trimmed)) {
      setLabels([...labels, trimmed]);
      setNewLabelInput('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter((l) => l !== labelToRemove));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/60 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-brand-400 bg-brand-500/10 border border-brand-500/25 px-2.5 py-1 rounded-lg">
              {task.task_key}
            </span>
            <span className="text-xs text-slate-400">Task Details & Activity</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              title="Delete task"
            >
              <Trash2Icon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <form id="task-edit-form" onSubmit={handleSave} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                placeholder="Task title..."
              />
            </div>

            {/* Grid: Priority, Due Date, Assignee */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Priority
                </label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <CalendarIcon className="h-3 w-3" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                />
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <UserIcon className="h-3 w-3" />
                  Assignee
                </label>
                <input
                  type="text"
                  value={assigneeName}
                  onChange={(e) => setAssigneeName(e.target.value)}
                  placeholder="Assignee name..."
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details, specs, or acceptance criteria..."
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-2.5 text-xs font-normal text-slate-200 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-y transition-all"
              />
            </div>

            {/* Labels */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <TagIcon className="h-3 w-3" />
                Tags / Labels
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {labels.map((lbl, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 border border-slate-700"
                  >
                    <span>{lbl}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(lbl)}
                      className="text-slate-400 hover:text-red-400 ml-0.5"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLabelInput}
                  onChange={(e) => setNewLabelInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLabel();
                    }
                  }}
                  placeholder="Type tag and press Add (e.g. Frontend, Bug, V1)"
                  className="flex-1 rounded-lg border border-slate-700/80 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddLabel}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </form>

          {/* Activity / Comments Timeline */}
          <div className="border-t border-slate-800 pt-5">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <MessageSquareIcon className="h-3.5 w-3.5" />
              Activity & Comments
            </h4>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment or update..."
                className="flex-1 rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              <button
                type="submit"
                disabled={isCommenting || !commentText.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-medium text-white hover:bg-brand-500 disabled:opacity-50 transition-colors"
              >
                <SendIcon className="h-3.5 w-3.5" />
                <span>Post</span>
              </button>
            </form>

            {/* Activity Stream */}
            <div className="space-y-3">
              {task.activities && task.activities.length > 0 ? (
                task.activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 rounded-xl bg-slate-950/60 p-3 border border-slate-800/80"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                      {act.user_name.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-300">
                          {act.user_name}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <ClockIcon className="h-2.5 w-2.5" />
                          {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 break-words">
                        {act.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-3">No activity logged yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-900/90 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-edit-form"
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 disabled:opacity-50 transition-all"
          >
            <SaveIcon className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
