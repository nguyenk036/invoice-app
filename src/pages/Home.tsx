import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useDashboardStats,
  useProfile,
  useInvoices,
  useUpdateInvoiceStatus,
} from '../hooks/useSupabase';
import type { InvoiceStatus } from '../types';

// ── Status config ──────────────────────────────────────────────────────────
const statusConfig: Record<InvoiceStatus, { label: string; classes: string }> =
  {
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

// ── Currency formatter ─────────────────────────────────────────────────────
function fmt(n: number, currency = 'CAD') {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

// ── Date formatter ─────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
  });
}

// ── Icons ──────────────────────────────────────────────────────────────────
const IcCamera = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
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
const IcFile = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
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
const IcQuote = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
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
const IcUser = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
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
const IcHome = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
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
const IcSettings = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
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
const IcPlus = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IcChevron = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
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
const IcArrow = ({ size = 12 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);
const IcMenu = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  >
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);
const IcX = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton({ className }: { className: string }) {
  return (
    <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
  );
}

// ── Nav items ──────────────────────────────────────────────────────────────
const navItems = [
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

// ── Quick actions ──────────────────────────────────────────────────────────
const quickActions = [
  {
    label: 'New invoice',
    sub: 'Bill a client',
    icon: <IcFile size={15} />,
    color: 'bg-sky-50 text-sky-600 ring-1 ring-sky-200',
    path: '/invoices/new',
  },
  {
    label: 'New quote',
    sub: 'Send a proposal',
    icon: <IcQuote size={15} />,
    color: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200',
    path: '/quotes/new',
  },
  {
    label: 'Add client',
    sub: 'Save contact',
    icon: <IcUser size={15} />,
    color: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
    path: '/clients/new',
  },
];

// ══════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════
export default function HomePage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Queries ──────────────────────────────────────────────────
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const updateStatus = useUpdateInvoiceStatus();

  // ── Derived values ───────────────────────────────────────────
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const currency = profile?.currency ?? 'CAD';

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const recentInvoices = (invoices ?? []).slice(0, 5);

  const statCards = [
    {
      label: 'This month',
      value: statsLoading ? null : fmt(stats?.thisMonthRevenue ?? 0, currency),
      sub: `${recentInvoices.filter((i) => i.status === 'paid').length} paid`,
      trend: null,
    },
    {
      label: 'Outstanding',
      value: statsLoading ? null : fmt(stats?.outstanding ?? 0, currency),
      sub: `${(invoices ?? []).filter((i) => i.status === 'sent' || i.status === 'overdue').length} invoices`,
      trend: null,
    },
    {
      label: 'Paid this year',
      value: statsLoading ? null : fmt(stats?.paidThisYear ?? 0, currency),
      sub: `${(invoices ?? []).filter((i) => i.status === 'paid').length} invoices`,
      trend: null,
    },
    {
      label: 'Active clients',
      value: statsLoading ? null : String(stats?.activeClients ?? 0),
      sub: 'total clients',
      trend: null,
    },
  ];

  // ── Handlers ─────────────────────────────────────────────────
  function handleNav(path: string, id: string) {
    setActiveNav(id);
    setMobileOpen(false);
    navigate(path);
  }

  function handleMarkPaid(invoiceId: string, e: React.MouseEvent) {
    e.stopPropagation();
    updateStatus.mutate({ id: invoiceId, status: 'paid' });
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-slate-50 flex"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside
        className={`
        fixed top-0 left-0 h-full z-40 w-60 bg-white border-r border-slate-100
        flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white shrink-0">
              <IcCamera size={16} />
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
            onClick={() => setMobileOpen(false)}
          >
            <IcX size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Menu
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.path, item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left
                ${
                  activeNav === item.id
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-slate-100">
          {profileLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="w-24 h-3" />
                <Skeleton className="w-32 h-2.5" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 text-xs font-bold shrink-0">
                {profile?.full_name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() ?? '??'}
              </div>
              <div className="min-w-0">
                <div className="text-slate-700 text-xs font-semibold truncate">
                  {profile?.full_name ?? '—'}
                </div>
                <div className="text-slate-400 text-[11px] truncate">
                  {profile?.business_name ?? profile?.email ?? '—'}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-slate-500 hover:text-slate-800 p-1 -ml-1"
              onClick={() => setMobileOpen(true)}
            >
              <IcMenu />
            </button>
            <div>
              <h1 className="text-slate-800 text-base font-semibold leading-none">
                {greeting}, {firstName}
              </h1>
              <p className="text-slate-400 text-xs mt-1 hidden sm:block">
                {new Date().toLocaleDateString('en-CA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/quotes/new')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:border-sky-300 hover:text-sky-600 transition-all"
            >
              <IcQuote size={14} />
              New quote
            </button>
            <button
              onClick={() => navigate('/invoices/new')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-all shadow-sm shadow-sky-200"
            >
              <IcPlus size={14} />
              <span className="hidden xs:inline">New invoice</span>
              <span className="xs:hidden">Invoice</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={() => navigate(a.path)}
                className="flex items-center gap-3 p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-sm transition-all group text-left"
              >
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${a.color}`}
                >
                  {a.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-slate-700 text-xs sm:text-sm font-semibold truncate">
                    {a.label}
                  </div>
                  <div className="text-slate-400 text-[11px] sm:text-xs hidden sm:block">
                    {a.sub}
                  </div>
                </div>
                <span className="ml-auto text-slate-300 group-hover:text-sky-400 transition-colors shrink-0">
                  <IcChevron />
                </span>
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 hover:border-sky-100 transition-all"
              >
                <div className="text-slate-400 text-xs font-medium mb-2">
                  {s.label}
                </div>
                {s.value === null ? (
                  <>
                    <Skeleton className="h-7 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </>
                ) : (
                  <>
                    <div className="text-slate-900 text-xl sm:text-2xl font-bold tracking-tight">
                      {s.value}
                    </div>
                    <div className="flex items-center justify-between mt-1.5 gap-2">
                      <span className="text-slate-400 text-xs truncate">
                        {s.sub}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-50">
              <h2 className="text-slate-800 text-sm font-semibold">
                Recent activity
              </h2>
              <button
                onClick={() => navigate('/invoices')}
                className="text-sky-500 text-xs font-semibold hover:text-sky-600 flex items-center gap-1 transition-colors"
              >
                View all <IcArrow />
              </button>
            </div>

            {/* Loading skeletons */}
            {invoicesLoading && (
              <div className="divide-y divide-slate-50">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                    <Skeleton className="w-8 h-8 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!invoicesLoading && recentInvoices.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <IcFile size={20} />
                </div>
                <p className="text-slate-600 text-sm font-medium">
                  No invoices yet
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Create your first invoice to get started
                </p>
                <button
                  onClick={() => navigate('/invoices/new')}
                  className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-all"
                >
                  <IcPlus size={13} /> New invoice
                </button>
              </div>
            )}

            {/* Desktop table */}
            {!invoicesLoading && recentInvoices.length > 0 && (
              <div className="hidden sm:block divide-y divide-slate-50">
                {recentInvoices.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/invoices/${item.id}`)}
                    className="flex items-center gap-4 px-5 sm:px-6 py-3.5 hover:bg-slate-50/60 transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-sky-50 text-sky-500 ring-1 ring-sky-200">
                      <IcFile size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-800 text-sm font-semibold truncate">
                        {item.client.name}
                      </div>
                      <div className="text-slate-400 text-xs truncate mt-0.5">
                        {item.invoice_number}
                      </div>
                    </div>
                    <div className="hidden md:block text-right shrink-0">
                      <div className="text-slate-400 text-xs">
                        {item.issue_date ? fmtDate(item.issue_date) : '—'}
                      </div>
                      {item.due_date && (
                        <div className="text-slate-400 text-xs mt-0.5">
                          Due {fmtDate(item.due_date)}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusConfig[item.status].classes}`}
                    >
                      {statusConfig[item.status].label}
                    </span>
                    {/* Mark as paid shortcut for sent/overdue */}
                    {(item.status === 'sent' || item.status === 'overdue') && (
                      <button
                        onClick={(e) => handleMarkPaid(item.id, e)}
                        disabled={updateStatus.isPending}
                        className="hidden group-hover:flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-all shrink-0"
                      >
                        Mark paid
                      </button>
                    )}
                    <div className="text-slate-800 text-sm font-bold w-20 text-right shrink-0">
                      {fmt(item.total, currency)}
                    </div>
                    <span className="text-slate-300 group-hover:text-sky-400 transition-colors shrink-0">
                      <IcChevron />
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Mobile cards */}
            {!invoicesLoading && recentInvoices.length > 0 && (
              <div className="sm:hidden divide-y divide-slate-50">
                {recentInvoices.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/invoices/${item.id}`)}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-sky-50 text-sky-500 ring-1 ring-sky-200">
                      <IcFile size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-800 text-sm font-semibold truncate">
                        {item.client.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusConfig[item.status].classes}`}
                        >
                          {statusConfig[item.status].label}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {item.issue_date ? fmtDate(item.issue_date) : '—'}
                        </span>
                      </div>
                    </div>
                    <div className="text-slate-800 text-sm font-bold shrink-0">
                      {fmt(item.total, currency)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom nav ──────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item.path, item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all
              ${activeNav === item.id ? 'text-sky-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
