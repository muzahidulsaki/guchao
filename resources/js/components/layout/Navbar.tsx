import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  SearchIcon,
  PlusIcon,
  BriefcaseIcon,
  UsersIcon,
  ChevronDownIcon,
  LogOutIcon,
  LogInIcon,
  XIcon,
  FilterIcon,
} from 'lucide-react';
import { BugMark } from '../brand/BugMark';
import type { Board, Priority, Workspace, User } from '../../types/kanban';

type NavbarProps = {
  board: Board;
  workspace?: Workspace | null;
  allWorkspaces?: Workspace[];
  membersCount?: number;
  authUser?: User | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPriority: Priority | 'all';
  onPriorityChange: (priority: Priority | 'all') => void;
  onOpenNewTaskModal: () => void;
  onOpenAddColumnModal: () => void;
  onOpenWorkspaceModal: () => void;
  onOpenMembersModal: () => void;
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
  workspace,
  allWorkspaces = [],
  membersCount = 1,
  authUser,
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  onOpenNewTaskModal,
  onOpenAddColumnModal,
  onOpenWorkspaceModal,
  onOpenMembersModal,
}: NavbarProps) {
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 gap-2 sm:gap-3">
        {/* Left: Brand & Workspace Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://heiseenbug.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2.5 group"
            >
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 group-hover:border-brand-500/50 shadow-md shadow-brand-500/10 text-brand-400 shrink-0 transition-colors">
                <BugMark className="h-4 w-auto text-brand-400 group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-display text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-brand-300 transition-colors">
                  <span className="hidden xs:inline">HeiSeenBug</span>
                  <span className="text-xs font-mono font-normal text-brand-400 ml-1">Guchao</span>
                </span>
                <span className="hidden md:inline-block rounded-full bg-brand-500/10 border border-brand-500/25 px-2 py-0.5 text-[10px] font-mono text-brand-300">
                  {board.prefix}
                </span>
              </div>
            </a>
          </div>

          {/* Workspace Switcher */}
          {workspace && (
            <div className="relative pl-2 sm:pl-3 border-l border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                className="flex items-center gap-1 sm:gap-1.5 rounded-xl border border-slate-800/80 bg-slate-900/90 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-medium text-slate-200 hover:border-slate-700 hover:bg-slate-850 transition-colors max-w-[100px] xs:max-w-[140px] sm:max-w-[180px]"
              >
                <BriefcaseIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-400 shrink-0" />
                <span className="truncate">{workspace.name}</span>
                <ChevronDownIcon className="h-3 w-3 text-slate-400 shrink-0" />
              </button>

              {isWorkspaceMenuOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsWorkspaceMenuOpen(false)}
                />
              )}

              {isWorkspaceMenuOpen && (
                <div className="absolute left-2 sm:left-3 top-full mt-1.5 z-50 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl shadow-black/80">
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Workspaces
                  </div>
                  <div className="space-y-0.5 max-h-48 overflow-y-auto">
                    {allWorkspaces.map((ws) => (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => {
                          setIsWorkspaceMenuOpen(false);
                          if (ws.boards && ws.boards[0]) {
                            router.visit(`/boards/${ws.boards[0].id}`);
                          }
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors ${
                          ws.id === workspace.id
                            ? 'bg-brand-600/20 text-brand-300 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{ws.name}</span>
                        {ws.id === workspace.id && (
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-1 pt-1 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsWorkspaceMenuOpen(false);
                        onOpenWorkspaceModal();
                      }}
                      className="flex w-full items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-brand-400 hover:bg-slate-800 transition-colors"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      <span>Create Workspace</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Members Button */}
          {workspace && (
            <button
              type="button"
              onClick={onOpenMembersModal}
              className="flex items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-900/90 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors shrink-0"
              title="Workspace Members & Invitations"
            >
              <UsersIcon className="h-3.5 w-3.5 text-brand-400" />
              <span className="hidden lg:inline">Members</span>
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-800 px-1 text-[10px] text-slate-400 font-mono">
                {membersCount}
              </span>
            </button>
          )}
        </div>

        {/* Center: Search & Filter (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md items-center gap-2">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by ID (HEI-1) or title..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>

          <div className="hidden xl:flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-xl border border-slate-800 shrink-0">
            {PRIORITY_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => onPriorityChange(f.value)}
                className={`rounded-lg px-2 py-1 text-[10px] font-medium transition-colors ${
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

        {/* Right: Actions & User Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            aria-label="Toggle search"
          >
            {isMobileSearchOpen ? <XIcon className="h-4 w-4" /> : <SearchIcon className="h-4 w-4" />}
          </button>

          <button
            onClick={onOpenAddColumnModal}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-all"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Add List</span>
          </button>

          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1 rounded-xl bg-brand-600 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 transition-all shrink-0"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">New Task</span>
            <span className="xs:hidden">Task</span>
          </button>

          {/* User Profile / Logout */}
          {authUser ? (
            <div className="relative pl-0.5 sm:pl-1">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-xl p-0.5 sm:p-1 hover:bg-slate-800 transition-colors"
              >
                {authUser.avatar ? (
                  <img
                    src={authUser.avatar}
                    alt={authUser.name}
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover ring-2 ring-brand-500/30"
                  />
                ) : (
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-xs font-bold text-white shadow-sm">
                    {authUser.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </button>

              {isUserMenuOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
              )}

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl shadow-black/80">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white truncate">{authUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{authUser.email}</p>
                  </div>
                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOutIcon className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/login"
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogInIcon className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </a>
          )}
        </div>
      </div>

      {/* Mobile Expandable Search & Priority Filter Drawer */}
      {isMobileSearchOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-900/95 px-3 py-2.5 space-y-2">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by ID or title..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 pl-1 pr-1.5 shrink-0">
              <FilterIcon className="h-3 w-3" />
            </span>
            {PRIORITY_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => onPriorityChange(f.value)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors shrink-0 ${
                  selectedPriority === f.value
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
