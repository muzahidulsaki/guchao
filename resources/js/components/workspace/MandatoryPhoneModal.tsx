import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { PhoneIcon, MessageCircleIcon, AlertCircleIcon, ArrowRightIcon, Loader2Icon } from 'lucide-react';
import type { User } from '../../types/kanban';

type MandatoryPhoneModalProps = {
  user: User | null | undefined;
};

export function MandatoryPhoneModal({ user }: MandatoryPhoneModalProps) {
  const hasPhone = Boolean(user?.phone && user.phone.trim().length >= 8);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!user || hasPhone || isSaved) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanDigits = phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits).');
      return;
    }

    setIsSubmitting(true);
    router.post(
      '/profile/phone',
      { phone: phone.trim() },
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsSaved(true);
        },
        onError: (errors) => {
          setError(errors.phone || 'Failed to save phone number. Please try again.');
          setIsSubmitting(false);
        },
        onFinish: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Non-dismissible Backdrop */}
      <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md" />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/80 overflow-hidden my-auto p-6 sm:p-7">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 ring-1 ring-emerald-500/20">
            <MessageCircleIcon className="h-6 w-6" />
          </div>

          <h3 className="font-display text-lg font-semibold text-white mb-1.5">
            WhatsApp Number Required
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Enter your WhatsApp number to receive task updates and @mention notifications.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <PhoneIcon className="h-3.5 w-3.5 text-emerald-400" />
              WhatsApp Number
            </label>
            <input
              type="text"
              autoFocus
              required
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. 01712345678"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {error && (
              <div className="flex items-center gap-1.5 text-rose-400 text-xs mt-2">
                <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !phone.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Save & Continue</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
