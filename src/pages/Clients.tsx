import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useInvoices,
} from '../hooks/useSupabase';
import type { Client } from '../types';

// ── Helpers ────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const avatarColors = [
  'bg-sky-100 text-sky-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700',
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700',
  'bg-blue-100 text-blue-700',
];

function avatarColor(name: string) {
  const i = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[i];
}

// ── Icons ──────────────────────────────────────────────────────────────────
const IcCamera = ({ s = 16 }: { s?: number }) => (
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
const IcUser = ({ s = 16 }: { s?: number }) => (
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
const IcFile = ({ s = 16 }: { s?: number }) => (
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
const IcQuote = ({ s = 16 }: { s?: number }) => (
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
const IcHome = ({ s = 18 }: { s?: number }) => (
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
const IcSettings = ({ s = 18 }: { s?: number }) => (
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
const IcPlus = ({ s = 14 }: { s?: number }) => (
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
const IcSearch = ({ s = 15 }: { s?: number }) => (
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
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IcEdit = ({ s = 14 }: { s?: number }) => (
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
const IcTrash = ({ s = 14 }: { s?: number }) => (
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
const IcX = ({ s = 18 }: { s?: number }) => (
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
const IcMenu = ({ s = 20 }: { s?: number }) => (
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
const IcPhone = ({ s = 13 }: { s?: number }) => (
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
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.48a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IcMail = ({ s = 13 }: { s?: number }) => (
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
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IcChevron = ({ s = 14 }: { s?: number }) => (
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
const IcAlert = ({ s = 20 }: { s?: number }) => (
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

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton({ className }: { className: string }) {
  return (
    <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
  );
}

// ── Empty field fallback ───────────────────────────────────────────────────
function orDash(v: string | null | undefined) {
  return v || '—';
}

// ── Nav ────────────────────────────────────────────────────────────────────
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

// ── Blank form ─────────────────────────────────────────────────────────────
const blankForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  city: '',
  province: '',
  country: 'Canada',
  postal_code: '',
  notes: '',
};

type ClientForm = typeof blankForm;

// ── Field component ────────────────────────────────────────────────────────
function Field({
  label,
  name,
  value,
  onChange,
  required = false,
  type = 'text',
  placeholder = '',
  textarea = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
}) {
  const base =
    'w-full px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-300';
  return (
    <div>
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
    </div>
  );
}

// ── Delete confirm modal ───────────────────────────────────────────────────
function DeleteModal({
  client,
  onConfirm,
  onCancel,
  isPending,
}: {
  client: Client;
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
          <IcAlert />
        </div>
        <h3 className="text-slate-800 text-base font-semibold text-center mb-1">
          Delete {client.name}?
        </h3>
        <p className="text-slate-400 text-sm text-center mb-6">
          This will permanently remove the client. Any linked invoices or quotes
          will remain but will no longer be associated.
        </p>
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

// ── Client drawer ──────────────────────────────────────────────────────────
function ClientDrawer({
  mode,
  form,
  onChange,
  onSubmit,
  onClose,
  isPending,
  error,
}: {
  mode: 'create' | 'edit';
  form: ClientForm;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isPending: boolean;
  error: string | null;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-slate-800 text-base font-semibold">
              {mode === 'create' ? 'New client' : 'Edit client'}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {mode === 'create'
                ? 'Add a new photography client'
                : 'Update client details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <IcX />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
              <IcAlert s={14} />
              {error}
            </div>
          )}

          {/* Contact info */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Contact info
            </p>
            <div className="space-y-3">
              <Field
                label="Full name"
                name="name"
                value={form.name}
                onChange={onChange}
                required
                placeholder="Sarah Thornton"
              />
              <Field
                label="Company / studio"
                name="company"
                value={form.company}
                onChange={onChange}
                placeholder="Thornton Productions"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="sarah@example.com"
                />
                <Field
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="+1 416 555 0100"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Address
            </p>
            <div className="space-y-3">
              <Field
                label="Street address"
                name="address"
                value={form.address}
                onChange={onChange}
                placeholder="123 King St W"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  placeholder="Toronto"
                />
                <Field
                  label="Province / state"
                  name="province"
                  value={form.province}
                  onChange={onChange}
                  placeholder="ON"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Postal code"
                  name="postal_code"
                  value={form.postal_code}
                  onChange={onChange}
                  placeholder="M5V 3A8"
                />
                <Field
                  label="Country"
                  name="country"
                  value={form.country}
                  onChange={onChange}
                  placeholder="Canada"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Notes
            </p>
            <Field
              label="Internal notes"
              name="notes"
              value={form.notes}
              onChange={onChange}
              textarea
              placeholder="Preferred contact method, project preferences…"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit as unknown as React.MouseEventHandler}
            disabled={isPending || !form.name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPending
              ? mode === 'create'
                ? 'Creating…'
                : 'Saving…'
              : mode === 'create'
                ? 'Create client'
                : 'Save changes'}
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Client card (mobile) ───────────────────────────────────────────────────
function ClientCard({
  client,
  invoiceCount,
  onEdit,
  onDelete,
  onClick,
}: {
  client: Client;
  invoiceCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-sky-200 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor(client.name)}`}
        >
          {initials(client.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-slate-800 text-sm font-semibold truncate">
            {client.name}
          </div>
          {client.company && (
            <div className="text-slate-400 text-xs truncate mt-0.5">
              {client.company}
            </div>
          )}
          <div className="flex items-center gap-3 mt-2">
            {client.email && (
              <span className="flex items-center gap-1 text-slate-400 text-xs truncate">
                <IcMail /> {client.email}
              </span>
            )}
            {client.phone && (
              <span className="flex items-center gap-1 text-slate-400 text-xs shrink-0">
                <IcPhone /> {client.phone}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all"
          >
            <IcEdit />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <IcTrash />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
        <span className="text-slate-400 text-xs">
          {client.city ? `${client.city}, ${client.country}` : client.country}
        </span>
        <span className="ml-auto text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg">
          {invoiceCount} invoice{invoiceCount !== 1 ? 's' : ''}
        </span>
        <span className="text-slate-300 group-hover:text-sky-400 transition-colors">
          <IcChevron />
        </span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Page component
// ══════════════════════════════════════════════════════════════
export default function ClientsPage() {
  const navigate = useNavigate();

  // ── Queries / mutations ────────────────────────────────────
  const { data: clients = [], isLoading } = useClients();
  const { data: invoices = [] } = useInvoices();
  const createClient = useCreateClient();
  const deleteClient = useDeleteClient();

  // ── UI state ───────────────────────────────────────────────
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientForm>(blankForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('list');

  // Update hook — only instantiated when editing
  const updateClient = useUpdateClient(editingClient?.id ?? '');

  // ── Derived ────────────────────────────────────────────────
  const invoiceCountByClient = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach((inv) => {
      map[inv.client_id] = (map[inv.client_id] ?? 0) + 1;
    });
    return map;
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  // ── Handlers ──────────────────────────────────────────────
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError(null);
  }

  function openCreate() {
    setForm(blankForm);
    setEditingClient(null);
    setFormError(null);
    setDrawerMode('create');
  }

  function openEdit(client: Client) {
    setForm({
      name: client.name,
      email: client.email ?? '',
      phone: client.phone ?? '',
      company: client.company ?? '',
      address: client.address ?? '',
      city: client.city ?? '',
      province: client.province ?? '',
      country: client.country ?? 'Canada',
      postal_code: client.postal_code ?? '',
      notes: client.notes ?? '',
    });
    setEditingClient(client);
    setFormError(null);
    setDrawerMode('edit');
  }

  function closeDrawer() {
    setDrawerMode(null);
    setEditingClient(null);
    setFormError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Client name is required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      province: form.province.trim() || null,
      country: form.country.trim() || 'Canada',
      postal_code: form.postal_code.trim() || null,
      notes: form.notes.trim() || null,
    };

    if (drawerMode === 'create') {
      createClient.mutate(payload, {
        onSuccess: () => closeDrawer(),
        onError: (err) => setFormError((err as Error).message),
      });
    } else if (drawerMode === 'edit') {
      updateClient.mutate(payload, {
        onSuccess: () => closeDrawer(),
        onError: (err) => setFormError((err as Error).message),
      });
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteClient.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError: () => setDeleteTarget(null),
    });
  }

  const isPending = createClient.isPending || updateClient.isPending;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-slate-50 flex"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`
        fixed top-0 left-0 h-full z-40 w-60 bg-white border-r border-slate-100
        flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
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
            onClick={() => setMobileOpen(false)}
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
                setMobileOpen(false);
                navigate(item.path);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                ${
                  item.id === 'clients'
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

      {/* ── Main ────────────────────────────────────────────── */}
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
                Clients
              </h1>
              <p className="text-slate-400 text-xs mt-1 hidden sm:block">
                {isLoading
                  ? 'Loading…'
                  : `${clients.length} client${clients.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-all shadow-sm shadow-sky-200"
          >
            <IcPlus /> New client
          </button>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto space-y-4">
          {/* Search + view toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <IcSearch />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients…"
                className="w-full pl-9 pr-4 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-300"
              />
            </div>
            {/* View toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1 shrink-0">
              <button
                onClick={() => setView('list')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${view === 'list' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                List
              </button>
              <button
                onClick={() => setView('grid')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${view === 'grid' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Grid
              </button>
            </div>
          </div>

          {/* Loading skeletons */}
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-4"
                >
                  <Skeleton className="w-10 h-10 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-3 w-20 hidden sm:block" />
                  <Skeleton className="h-3 w-16 hidden md:block" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && clients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-400 mb-4">
                <IcUser s={28} />
              </div>
              <p className="text-slate-700 text-base font-semibold">
                No clients yet
              </p>
              <p className="text-slate-400 text-sm mt-1 mb-6 max-w-xs">
                Add your first client to start creating invoices and quotes.
              </p>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-all shadow-sm shadow-sky-200"
              >
                <IcPlus /> Add first client
              </button>
            </div>
          )}

          {/* No search results */}
          {!isLoading && clients.length > 0 && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-slate-500 text-sm font-medium">
                No clients match "{search}"
              </p>
              <button
                onClick={() => setSearch('')}
                className="mt-2 text-sky-500 text-xs font-medium hover:underline"
              >
                Clear search
              </button>
            </div>
          )}

          {/* ── List view ─────────────────────────────────── */}
          {!isLoading && filtered.length > 0 && view === 'list' && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {/* Table header — desktop only */}
              <div className="hidden sm:grid grid-cols-[2fr_1.5fr_1fr_80px_80px] gap-4 px-5 py-3 border-b border-slate-50 bg-slate-50/60">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Client
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Contact
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Location
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Invoices
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Added
                </span>
              </div>

              <div className="divide-y divide-slate-50">
                {filtered.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="flex sm:grid sm:grid-cols-[2fr_1.5fr_1fr_80px_80px] gap-3 sm:gap-4 items-center px-5 py-3.5 hover:bg-slate-50/60 transition-colors cursor-pointer group"
                  >
                    {/* Name + company */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(client.name)}`}
                      >
                        {initials(client.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-slate-800 text-sm font-semibold truncate">
                          {client.name}
                        </div>
                        {client.company && (
                          <div className="text-slate-400 text-xs truncate">
                            {client.company}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact — desktop */}
                    <div className="hidden sm:block min-w-0">
                      {client.email && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs truncate">
                          <IcMail /> {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                          <IcPhone /> {client.phone}
                        </div>
                      )}
                    </div>

                    {/* Location — desktop */}
                    <div className="hidden sm:block text-slate-500 text-xs truncate">
                      {client.city
                        ? `${client.city}${client.province ? `, ${client.province}` : ''}`
                        : '—'}
                    </div>

                    {/* Invoice count */}
                    <div className="hidden sm:block">
                      <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg">
                        {invoiceCountByClient[client.id] ?? 0}
                      </span>
                    </div>

                    {/* Added date */}
                    <div className="hidden sm:block text-slate-400 text-xs">
                      {fmtDate(client.created_at)}
                    </div>

                    {/* Actions — appear on hover */}
                    <div className="hidden sm:flex items-center gap-1 absolute right-5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    {/* Mobile: just amount + chevron */}
                    <div className="flex items-center gap-2 ml-auto sm:hidden shrink-0">
                      <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg">
                        {invoiceCountByClient[client.id] ?? 0} inv
                      </span>
                      <span className="text-slate-300 group-hover:text-sky-400 transition-colors">
                        <IcChevron />
                      </span>
                    </div>

                    {/* Edit / delete — desktop hover */}
                    <div
                      className="hidden sm:flex items-center gap-1 ml-auto col-span-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ gridColumn: '6' }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(client);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all"
                      >
                        <IcEdit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(client);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <IcTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Grid view ─────────────────────────────────── */}
          {!isLoading && filtered.length > 0 && view === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  invoiceCount={invoiceCountByClient[client.id] ?? 0}
                  onEdit={() => openEdit(client)}
                  onDelete={() => setDeleteTarget(client)}
                  onClick={() => navigate(`/clients/${client.id}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile bottom nav ───────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all
              ${item.id === 'clients' ? 'text-sky-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="lg:hidden h-20" />

      {/* ── Create / Edit drawer ─────────────────────────────── */}
      {drawerMode && (
        <ClientDrawer
          mode={drawerMode}
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={closeDrawer}
          isPending={isPending}
          error={formError}
        />
      )}

      {/* ── Delete confirm modal ─────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          client={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isPending={deleteClient.isPending}
        />
      )}
    </div>
  );
}
