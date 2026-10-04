import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { LayersIcon, ArrowRightIcon, UsersIcon, CheckCircle2Icon, ShieldCheckIcon } from 'lucide-react';

type LoginProps = {
  googleEnabled: boolean;
};

export default function Login({ googleEnabled }: LoginProps) {
  const [devEmail, setDevEmail] = useState('');
  const [devName, setDevName] = useState('');
  const [showDevLogin, setShowDevLogin] = useState(!googleEnabled);

  const handleDevLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devEmail || !devName) return;
    router.post('/auth/dev-login', { email: devEmail, name: devName });
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden select-none">
      <Head title="Sign In — গুছাও (Guchao)" />

      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl shadow-black/80 backdrop-blur-xl">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-xl shadow-brand-500/25 mb-4">
            <LayersIcon className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">
            গুছাও <span className="text-sm font-mono font-medium text-brand-400">Guchao</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400 max-w-xs">
            Trello-style Workspace Task Management & Team Pipeline
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="mt-6 space-y-2 rounded-2xl bg-slate-950/60 p-3.5 border border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Create collaborative team Workspaces</span>
          </div>
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-brand-400 shrink-0" />
            <span>Invite members & assign tasks directly</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>Automatic sequential task keys (GUC-xxx)</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <div className="mt-6">
          <a
            href="/auth/google"
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-white/10 hover:bg-slate-100 hover:shadow-white/20 transition-all duration-200 group"
          >
            {/* Google Colorful G SVG */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.99 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
            <ArrowRightIcon className="h-4 w-4 ml-auto text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Development Fallback Login */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => setShowDevLogin(!showDevLogin)}
            className="text-[11px] text-slate-500 hover:text-slate-300 underline underline-offset-4"
          >
            {showDevLogin ? 'Hide Dev Sign In' : 'Sign in with Email / Dev Mode'}
          </button>

          {showDevLogin && (
            <form onSubmit={handleDevLogin} className="mt-4 space-y-3 text-left">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={devName}
                  onChange={(e) => setDevName(e.target.value)}
                  placeholder="e.g. Saki"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={devEmail}
                  onChange={(e) => setDevEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Sign In
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500">
        <a href="https://heiseenbug.com" className="hover:text-brand-400 transition-colors">
          Heiseenbug
        </a>{' '}
        &bull; Guchao Task Engine
      </div>
    </div>
  );
}
