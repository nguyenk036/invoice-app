// src/pages/AuthPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

// ── Decorative aperture SVG ────────────────────────────────────
function ApertureGlyph({ size = 120 }: { size?: number }) {
  const cx = size / 2;
  const blades = 8;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({ length: blades }).map((_, i) => {
        const angle = (i / blades) * Math.PI * 2;
        const x1 = cx + Math.cos(angle) * (size * 0.1);
        const y1 = cx + Math.sin(angle) * (size * 0.1);
        const x2 = cx + Math.cos(angle + Math.PI * 0.7) * (size * 0.44);
        const y2 = cx + Math.sin(angle + Math.PI * 0.7) * (size * 0.44);
        const x3 = cx + Math.cos(angle + Math.PI * 0.85) * (size * 0.44);
        const y3 = cx + Math.sin(angle + Math.PI * 0.85) * (size * 0.44);
        return (
          <polygon
            key={i}
            points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
            fill="currentColor"
          />
        );
      })}
      <circle
        cx={cx}
        cy={cx}
        r={size * 0.12}
        fill="none"
        stroke="currentColor"
        strokeWidth={size * 0.025}
      />
    </svg>
  );
}

// ── Feature bullet ─────────────────────────────────────────────
function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-sky-300">
        {icon}
      </div>
      <span className="text-slate-300 text-sm">{text}</span>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────
const IcInvoice = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="12" y2="17" />
  </svg>
);
const IcClients = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IcQuote = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IcCamera = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const IcEyeOpen = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IcEyeOff = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ══════════════════════════════════════════════════════════════
// AuthPage
// ══════════════════════════════════════════════════════════════
export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : error.message
      );
    }

    if (data.session?.access_token) navigate('/');
    setLoading(false);
  }

  const transBase = 'transition-all duration-700 ease-out';
  const visible = `${transBase} opacity-100 translate-y-0`;
  const hidden = `${transBase} opacity-0 translate-y-4`;

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── Left panel — brand ───────────────────────────────── */}
      <div
        className="
        relative lg:w-[52%] bg-slate-900
        flex flex-col justify-center
        px-8 py-10 lg:px-16 lg:py-0
        overflow-hidden shrink-0
        min-h-65 lg:min-h-screen
      "
      >
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {/* Large aperture — top right */}
          <div
            className="absolute -top-24 -right-24 text-sky-500"
            style={{ opacity: 0.055 }}
          >
            <ApertureGlyph size={500} />
          </div>
          {/* Medium — bottom left */}
          <div
            className="absolute -bottom-20 -left-20 text-sky-400"
            style={{ opacity: 0.04 }}
          >
            <ApertureGlyph size={340} />
          </div>
          {/* Small accent */}
          <div
            className="absolute top-1/2 right-16 -translate-y-1/2 text-white"
            style={{ opacity: 0.025 }}
          >
            <ApertureGlyph size={180} />
          </div>
          {/* Grid */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <pattern
                id="g"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.35"
                  strokeOpacity="0.04"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)" />
          </svg>
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(56,189,248,0.35), transparent)',
            }}
          />
          {/* Right edge fade — desktop only */}
          <div
            className="hidden lg:block absolute top-0 right-0 bottom-0 w-24"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(15,23,42,0.6))',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 lg:max-w-90">
          {/* Logo */}
          <div
            className={`flex items-center gap-3 mb-8 lg:mb-14 ${mounted ? visible : hidden}`}
            style={{ transitionDelay: '0ms' }}
          >
            <div
              className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white shrink-0"
              style={{ boxShadow: '0 8px 24px rgba(14,165,233,0.3)' }}
            >
              <IcCamera />
            </div>
            <div>
              <div className="text-white text-[15px] font-semibold leading-none tracking-tight">
                LensInvoice
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5 tracking-wide">
                Photography billing
              </div>
            </div>
          </div>

          {/* Headline */}
          <div
            className={`mb-8 lg:mb-12 ${mounted ? visible : hidden}`}
            style={{ transitionDelay: '80ms' }}
          >
            <h1 className="text-white text-2xl lg:text-[2.25rem] font-semibold leading-tight tracking-tight mb-3">
              Invoice clients.
              <br />
              <span className="text-sky-400">Get paid faster.</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Purpose-built for photographers — manage clients, send quotes, and
              track invoices in one place.
            </p>
          </div>

          {/* Features — desktop only */}
          <div
            className={`hidden lg:flex flex-col gap-3.5 ${mounted ? visible : hidden}`}
            style={{ transitionDelay: '160ms' }}
          >
            <Feature
              icon={<IcClients />}
              text="Client address book with full contact details"
            />
            <Feature
              icon={<IcQuote />}
              text="Send professional quotes, track responses"
            />
            <Feature
              icon={<IcInvoice />}
              text="Convert accepted quotes to invoices instantly"
            />
          </div>

          {/* Footer — desktop */}
          <div
            className={`hidden lg:block mt-12 ${mounted ? visible : hidden}`}
            style={{ transitionDelay: '240ms' }}
          >
            <p className="text-slate-600 text-xs">
              Private beta · All rights reserved
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ───────────────────────────────── */}
      <div className="flex-1 bg-white lg:bg-slate-50 flex items-center justify-center px-6 py-12 lg:px-16">
        <div
          className={`w-full max-w-sm ${mounted ? visible : hidden}`}
          style={{ transitionDelay: '100ms' }}
        >
          {/* Mobile-only logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white shrink-0">
              <IcCamera />
            </div>
            <span className="text-slate-800 text-sm font-semibold">
              LensInvoice
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-slate-900 text-2xl font-semibold tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-400 text-sm mt-1.5">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-5 animate-in">
              <svg
                className="shrink-0 mt-0.5"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl outline-none transition-all placeholder:text-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 hover:border-slate-300"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl outline-none transition-all placeholder:text-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 hover:border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <IcEyeOff /> : <IcEyeOpen />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-3 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2"
                style={{ boxShadow: '0 4px 14px rgba(14,165,233,0.25)' }}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeOpacity="0.25"
                      />
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white lg:bg-slate-50 text-slate-400 text-xs">
                Private beta access only
              </span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-400 text-xs leading-relaxed">
            Access is restricted to invited users.
            <br />
            Contact your administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
