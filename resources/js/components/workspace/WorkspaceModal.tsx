import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { XIcon, PlusIcon, BriefcaseIcon, PaletteIcon } from 'lucide-react';

type WorkspaceModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const COLOR_OPTIONS = [
  'indigo',
  'blue',
  'emerald',
  'purple',
  'amber',
  'rose',
  'cyan',
];

export function WorkspaceModal({ isOpen, onClose }: WorkspaceModalProps) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    router.post(
      '/workspaces',
      {
        name: name.trim(),
        description: description.trim() || null,
        color: selectedColor,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setName('');
          setDescription('');
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

      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/80 overflow-hidden my-auto">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
              <BriefcaseIcon className="h-4 w-4" />
            </div>
            <h3 className="font-display text-sm font-semibold text-white">Create New Workspace</h3>
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
              Workspace Name *
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Heiseenbug Core, Mobile Team, Marketing..."
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your team work on in this workspace?"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <PaletteIcon className="h-3 w-3" />
              Theme Accent
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`h-6 w-6 rounded-full capitalize text-[10px] font-bold transition-transform ${
                    selectedColor === c ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor:
                      c === 'indigo'
                        ? '#6366f1'
                        : c === 'blue'
                        ? '#3b82f6'
                        : c === 'emerald'
                        ? '#10b981'
                        : c === 'purple'
                        ? '#a855f7'
                        : c === 'amber'
                        ? '#f59e0b'
                        : c === 'rose'
                        ? '#f43f5e'
                        : '#06b6d4',
                  }}
                />
              ))}
            </div>
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
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 disabled:opacity-50 transition-all"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Creating...' : 'Create Workspace'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
