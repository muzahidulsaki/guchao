import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { PhoneIcon, MessageCircleIcon, ShieldCheckIcon, AlertCircleIcon, ArrowRightIcon, Loader2Icon } from 'lucide-react';
import type { User } from '../../types/kanban';

type MandatoryPhoneModalProps = {
  user: User | null | undefined;
};

export function MandatoryPhoneModal({ user }: MandatoryPhoneModalProps) {
  // If user is not logged in or already has a valid phone saved, do not show
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
      setError('অনুগ্রহ করে একটি সঠিক মোবাইল নম্বর লিখুন (কমপক্ষে ১০ বা ১১ ডিজিট)');
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
          setError(errors.phone || 'নম্বর সংরক্ষণ করতে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন।');
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
      {/* Un-skippable Backdrop */}
      <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity" />

      {/* Modal Container */}
      <div className="relative w-full max-w-md rounded-2xl border border-emerald-500/30 bg-slate-900 shadow-2xl shadow-emerald-950/50 overflow-hidden my-auto p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/30 mb-4 ring-4 ring-emerald-500/20">
            <MessageCircleIcon className="h-8 w-8" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            বাধ্যতামূলক ধাপ (Mandatory Step)
          </span>

          <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-2">
            আপনার WhatsApp নম্বর প্রদান করুন
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mb-6">
            HeiSeenBug Guchao-তে আপনাকে কোনো টাস্কে অ্যাসাইন করা হলে বা গুরুত্বপূর্ণ আপডেট এলে দ্রুত <strong className="text-emerald-400 font-medium">WhatsApp @mention</strong> নোটিফিকেশন পেতে আপনার নম্বরটি দেওয়া আবশ্যক। একবার সাবমিট করলেই আর দিতে হবে না।
          </p>
        </div>

        {/* Phone Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <PhoneIcon className="h-3.5 w-3.5 text-emerald-400" />
                WhatsApp মোবাইল নম্বর
              </span>
              <span className="text-[11px] text-slate-500 font-mono">01XXXXXXXXX</span>
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError('');
                }}
                placeholder="যেমন: 017XXXXXXXX বা 88017XXXXXXXX"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-mono text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
              />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-rose-400 text-xs mt-2 animate-in fade-in">
                <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-[11px] text-slate-400 leading-relaxed">
            💡 <strong className="text-slate-300">তথ্য সুরক্ষা:</strong> এই নম্বরটি শুধুমাত্র HeiSeenBug টিমের প্রজেক্ট টাস্ক নোটিফিকেশন ও গ্রুপ মেনশনের জন্য ব্যবহার করা হবে।
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !phone.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span>সংরক্ষণ করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <span>নম্বর সংরক্ষণ করুন ও ড্যাশবোর্ডে যান</span>
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
