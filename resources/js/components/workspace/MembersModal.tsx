import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  XIcon,
  UserPlusIcon,
  UsersIcon,
  CopyIcon,
  CheckIcon,
  Trash2Icon,
  ShieldCheckIcon,
  MailIcon,
} from 'lucide-react';
import type { Workspace, User } from '../../types/kanban';

type MembersModalProps = {
  workspace: Workspace | null;
  members: User[];
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
};

export function MembersModal({
  workspace,
  members,
  currentUser,
  isOpen,
  onClose,
}: MembersModalProps) {
  if (!isOpen || !workspace) return null;

  const [inviteEmail, setInviteEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inviteUrl = `${window.location.origin}/join/${workspace.invite_code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSubmitting(true);
    router.post(
      `/workspaces/${workspace.id}/invite`,
      {
        email: inviteEmail.trim(),
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setInviteEmail('');
        },
        onFinish: () => setIsSubmitting(false),
      }
    );
  };

  const handleRemoveMember = (user: User) => {
    if (confirm(`Remove ${user.name} from ${workspace.name}?`)) {
      router.delete(`/workspaces/${workspace.id}/members/${user.id}`, {
        preserveScroll: true,
      });
    }
  };

  const isOwner = currentUser?.id === workspace.owner_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/80 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
              <UsersIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-white">
                Workspace Members
              </h3>
              <p className="text-[11px] text-slate-400 leading-none">
                {workspace.name} &bull; {members.length} {members.length === 1 ? 'member' : 'members'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Shareable Invite Link */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Shareable Invitation Link</span>
              <span className="text-[10px] text-brand-400 font-normal">Anyone with link can join</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-500 transition-all shrink-0"
              >
                {copiedLink ? (
                  <>
                    <CheckIcon className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-3.5 w-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Invite by Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <MailIcon className="h-3.5 w-3.5" />
              Invite by Email
            </label>
            <form onSubmit={handleInviteSubmit} className="flex gap-2">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="flex-1 rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              <button
                type="submit"
                disabled={isSubmitting || !inviteEmail.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-brand-600 hover:text-white disabled:opacity-50 transition-colors"
              >
                <UserPlusIcon className="h-3.5 w-3.5" />
                <span>Invite</span>
              </button>
            </form>
          </div>

          {/* Members List */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Team Members ({members.length})
            </h4>

            <div className="space-y-2.5">
              {members.map((member) => {
                const isMemberOwner = member.id === workspace.owner_id;
                const isCurrent = member.id === currentUser?.id;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-3"
                  >
                    <div className="flex items-center gap-3">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-xs font-bold text-white">
                          {member.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">
                            {member.name}
                          </span>
                          {isCurrent && (
                            <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block leading-tight">
                          {member.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMemberOwner ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 text-[10px] font-medium text-amber-400">
                          <ShieldCheckIcon className="h-3 w-3" />
                          Owner
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-400">
                          Member
                        </span>
                      )}

                      {isOwner && !isMemberOwner && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Remove from workspace"
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-slate-800 bg-slate-900/90 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
