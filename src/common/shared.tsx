// src/components/shared.tsx
// Shared sidebar layout, icons, skeleton, and formatters
// used by InvoicesPage, QuotesPage, and SettingsPage.

import { useNavigate } from 'react-router-dom';

// ── Formatters ─────────────────────────────────────────────────
export function fmt(n: number, currency = 'CAD') {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function orDash(v: string | null | undefined) {
  return v || '—';
}

// ── Skeleton ───────────────────────────────────────────────────
export function Skeleton({ className }: { className: string }) {
  return (
    <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
  );
}

// ── Icons ──────────────────────────────────────────────────────
export const IcCamera = ({ s = 16 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
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
export const IcFile = ({ s = 16 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
export const IcQuote = ({ s = 16 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
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
export const IcUser = ({ s = 16 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
export const IcHome = ({ s = 18 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
export const IcSettings = ({ s = 18 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
export const IcPlus = ({ s = 14 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IcX = ({ s = 18 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
export const IcMenu = ({ s = 20 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  >
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);
export const IcChevron = ({ s = 14 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
export const IcTrash = ({ s = 14 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);
export const IcEdit = ({ s = 14 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
export const IcSend = ({ s = 14 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
export const IcCheck = ({ s = 14 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
export const IcAlert = ({ s = 16 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
export const IcArrowLeft = ({ s = 16 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);
export const IcSave = ({ s = 14 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
export const IcConvert = ({ s = 14 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

// ── Nav items ──────────────────────────────────────────────────
export const navItems = [
  { id: 'home', label: 'Home', icon: <IcHome />, path: '/' },
  { id: 'invoices', label: 'Invoices', icon: <IcFile />, path: '/invoices' },
  { id: 'quotes', label: 'Quotes', icon: <IcQuote />, path: '/quotes' },
  { id: 'clients', label: 'Clients', icon: <IcUser />, path: '/clients' },
  {
    id: 'settings',
    label: 'Settings',
    icon: <IcSettings />,
    path: '/settings',
  },
];

// ── Sidebar ────────────────────────────────────────────────────
export function Sidebar({
  activeId,
  open,
  onClose,
}: {
  activeId: string;
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  return (
    <aside
      className={`
      fixed top-0 left-0 h-full z-40 w-60 bg-white border-r border-slate-100
      flex flex-col transition-transform duration-300 ease-in-out
      lg:translate-x-0 lg:static lg:z-auto
      ${open ? 'translate-x-0' : '-translate-x-full'}
    `}
    >
      <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white shrink-0">
            <IcCamera />
          </div>
          <div>
            <div className="text-slate-800 text-sm font-semibold leading-none">
              LensInvoice
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              Photography billing
            </div>
          </div>
        </div>
        <button
          className="lg:hidden text-slate-400 hover:text-slate-600"
          onClick={onClose}
        >
          <IcX />
        </button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
          Menu
        </p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onClose();
              navigate(item.path);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
              ${
                item.id === activeId
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
          >
            <span className="shrink-0">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

// ── Mobile bottom nav ──────────────────────────────────────────
export function BottomNav({ activeId }: { activeId: string }) {
  const navigate = useNavigate();
  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all
              ${item.id === activeId ? 'text-sky-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="lg:hidden h-20" />
    </>
  );
}

// ── Page shell ─────────────────────────────────────────────────
export function PageShell({
  activeId,
  children,
}: {
  activeId: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div
      className="min-h-screen bg-slate-50 flex"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
      <Sidebar activeId={activeId} open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* hamburger slot — each page renders its own header */}
        <div className="lg:hidden fixed top-0 left-0 z-20 px-4 py-4">
          <button
            onClick={() => setOpen(true)}
            className="text-slate-500 hover:text-slate-800"
          >
            <IcMenu />
          </button>
        </div>
        {children}
      </div>
      <BottomNav activeId={activeId} />
    </div>
  );
}

// Need React for JSX in this file
import React from 'react';

// ── Form field ────────────────────────────────────────────────
export function Field({
  label,
  name,
  value,
  onChange,
  required = false,
  type = 'text',
  placeholder = '',
  textarea = false,
  hint,
  className = '',
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
      Element
    >
  ) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  hint?: string;
  className?: string;
}) {
  const base =
    'w-full px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-300';
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={base}
        />
      )}
      {hint && <p className="text-slate-400 text-[11px] mt-1">{hint}</p>}
    </div>
  );
}

// ── Delete modal ───────────────────────────────────────────────
export function DeleteModal({
  title,
  message,
  onConfirm,
  onCancel,
  isPending,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-6 z-10">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 text-red-500 mx-auto mb-4">
          <IcAlert s={22} />
        </div>
        <h3 className="text-slate-800 text-base font-semibold text-center mb-1">
          {title}
        </h3>
        <p className="text-slate-400 text-sm text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-all"
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────
export const invoiceStatusConfig: Record<
  string,
  { label: string; classes: string }
> = {
  paid: {
    label: 'Paid',
    classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  },
  sent: {
    label: 'Sent',
    classes: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  },
  overdue: {
    label: 'Overdue',
    classes: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  },
  draft: {
    label: 'Draft',
    classes: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-slate-100 text-slate-400 ring-1 ring-slate-200',
  },
};

export const quoteStatusConfig: Record<
  string,
  { label: string; classes: string }
> = {
  draft: {
    label: 'Draft',
    classes: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
  },
  sent: {
    label: 'Sent',
    classes: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  },
  accepted: {
    label: 'Accepted',
    classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  },
  declined: {
    label: 'Declined',
    classes: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  },
  expired: {
    label: 'Expired',
    classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  },
};

export function StatusBadge({
  status,
  config,
}: {
  status: string;
  config: Record<string, { label: string; classes: string }>;
}) {
  const s = config[status] ?? {
    label: status,
    classes: 'bg-slate-100 text-slate-400',
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${s.classes}`}
    >
      {s.label}
    </span>
  );
}
