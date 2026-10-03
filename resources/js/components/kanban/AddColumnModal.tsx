import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { XIcon, PlusIcon, PaletteIcon } from 'lucide-react';
import type { Board } from '../../types/kanban';

type AddColumnModalProps = {
  board: Board;
  isOpen: boolean;
  onClose: () => void;
};

const COLOR_OPTIONS = [
  '#64748B', // Slate
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EF4444', // Red
];

export function AddColumnModal({ board, isOpen, onClose }: AddColumnModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    router.post(
      `/boards/${board.id}/columns`,
      {
        title: title.trim(),
        color: selectedColor,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setTitle('');
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

      <div className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/60 overflow-hidden my-auto">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-900/90">
          <h3 className="font-display text-sm font-semibold text-white">Add New List / Column</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Column Title *
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. In QA, Blocked, Ready..."
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <PaletteIcon className="h-3 w-3" />
              Theme Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`h-6 w-6 rounded-full transition-transform ${
                    selectedColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
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
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 disabled:opacity-50 transition-all"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Adding...' : 'Add List'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
