import React from 'react';
import {
  LayersIcon,
  SearchIcon,
  PlusIcon,
  ExternalLinkIcon,
  FilterIcon,
  SlidersHorizontalIcon,
} from 'lucide-react';
import type { Board, Priority } from '../../types/kanban';

type NavbarProps = {
  board: Board;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPriority: Priority | 'all';
  onPriorityChange: (priority: Priority | 'all') => void;
  onOpenNewTaskModal: () => void;
  onOpenAddColumnModal: () => void;
};

const PRIORITY_FILTERS: { value: Priority | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function Navbar({
  board,
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  onOpenNewTaskModal,
  onOpenAddColumnModal,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-4">
        {/* Left: Brand & Board Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-md shadow-brand-500/20 text-white font-bold">
              <LayersIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-bold tracking-tight text-white">
                  গুছাও <span className="text-xs font-mono font-normal text-brand-400">Guchao</span>
                </span>
                <span className="hidden sm:inline-block rounded-full bg-brand-500/10 border border-brand-500/25 px-2 py-0.5 text-[10px] font-mono text-brand-300">
                  {board.prefix}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none hidden md:block">
                {board.title}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 pl-4 border-l border-slate-800">
            <a
              href="https://heiseenbug.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand-400 transition-colors"
            >
              <span>heiseenbug.com</span>
              <ExternalLinkIcon className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>

        {/* Center: Search & Filter */}
        <div className="flex flex-1 max-w-md items-center gap-2">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by ID (GUC-1) or title..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>

          {/* Priority filter pills on tablet+ */}
          <div className="hidden xl:flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-xl border border-slate-800">
            {PRIORITY_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => onPriorityChange(f.value)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  selectedPriority === f.value
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddColumnModal}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-all"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            <span>Add List</span>
          </button>

          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 transition-all"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}
