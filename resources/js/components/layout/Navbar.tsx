import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  LayersIcon,
  SearchIcon,
  PlusIcon,
  ExternalLinkIcon,
  BriefcaseIcon,
  UsersIcon,
  ChevronDownIcon,
  LogOutIcon,
  LogInIcon,
} from 'lucide-react';
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

  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-3">
        {/* Left: Brand & Workspace Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-md shadow-brand-500/20 text-white font-bold shrink-0">
              <LayersIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-base font-bold tracking-tight text-white">
                  গুছাও <span className="text-xs font-mono font-normal text-brand-400">Guchao</span>
                </span>
                <span className="hidden sm:inline-block rounded-full bg-brand-500/10 border border-brand-500/25 px-2 py-0.5 text-[10px] font-mono text-brand-300">
                  {board.prefix}
                </span>
              </div>
            </div>
          </div>

          {/* Workspace Switcher */}
          {workspace && (
            <div className="relative pl-3 border-l border-slate-800">
              <button
                type="button"
                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800/80 bg-slate-900/90 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-700 hover:bg-slate-850 transition-colors"
              >
                <BriefcaseIcon className="h-3.5 w-3.5 text-brand-400" />
                <span className="max-w-[120px] truncate">{workspace.name}</span>
                <ChevronDownIcon className="h-3 w-3 text-slate-400" />
              </button>

              {isWorkspaceMenuOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsWorkspaceMenuOpen(false)}
                />
              )}

              {isWorkspaceMenuOpen && (
                <div className="absolute left-3 top-full mt-1.5 z-50 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl shadow-black/80">
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
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-800/80 bg-slate-900/90 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            >
              <UsersIcon className="h-3.5 w-3.5 text-brand-400" />
              <span>Members</span>
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-800 px-1 text-[10px] text-slate-400">
                {membersCount}
              </span>
            </button>
          )}
        </div>

        {/* Center: Search & Filter */}
        <div className="flex flex-1 max-w-sm lg:max-w-md items-center gap-2">
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

        {/* Right: Actions & User Avatar */}
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

          {/* User Profile / Logout */}
          {authUser ? (
            <div className="relative pl-1">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-800 transition-colors"
              >
                {authUser.avatar ? (
                  <img
                    src={authUser.avatar}
                    alt={authUser.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-500/30"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-xs font-bold text-white shadow-sm">
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
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogInIcon className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
