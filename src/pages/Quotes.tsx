// src/pages/QuotesPage.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useQuotes,
  useClients,
  useProfile,
  usePricingPresets,
  useCreateQuote,
  useUpdateQuoteStatus,
  useDeleteQuote,
  useConvertQuoteToInvoice,
} from '../hooks/useSupabase';
import type { Quote, QuoteStatus, QuoteForm, LineItemForm } from '../types';
import {
  Sidebar,
  BottomNav,
  Field,
  DeleteModal,
  StatusBadge,
  quoteStatusConfig,
  fmt,
  fmtDate,
  IcPlus,
  IcX,
  IcMenu,
  IcQuote,
  IcTrash,
  IcEdit,
  IcChevron,
  IcAlert,
  IcSend,
  IcSave,
  IcConvert,
  IcCheck,
} from '../common/shared';

// ── Types ──────────────────────────────────────────────────────
type QuoteRow = Quote & {
  client: { id: string; name: string; email: string | null };
};

function blankLine(): LineItemForm {
  return {
    id: crypto.randomUUID(),
    preset_id: null,
    description: '',
    quantity: 1,
    unit_price: 0,
  };
}

function blankForm(taxRate = 13): QuoteForm {
  const today = new Date().toISOString().split('T')[0];
  const expiry = new Date(Date.now() + 14 * 86400000)
    .toISOString()
    .split('T')[0];
  return {
    client_id: '',
    issue_date: today,
    expiry_date: expiry,
    tax_rate: taxRate,
    notes: '',
    line_items: [blankLine()],
  };
}

// ── Line item row ──────────────────────────────────────────────
function LineRow({
  item,
  onChange,
  onRemove,
  presets,
  canRemove,
}: {
  item: LineItemForm;
  onChange: (
    id: string,
    field: keyof LineItemForm,
    val: string | number | null
  ) => void;
  onRemove: (id: string) => void;
  presets: { id: string; name: string; unit_price: number }[];
  canRemove: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_80px_100px_80px_32px] gap-2 items-start">
      <div>
        {presets.length > 0 && (
          <select
            className="w-full px-2.5 py-1.5 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg outline-none focus:border-sky-400 mb-1.5"
            value={item.preset_id ?? ''}
            onChange={(e) => {
              const p = presets.find((p) => p.id === e.target.value);
              if (p) {
                onChange(item.id, 'preset_id', p.id);
                onChange(item.id, 'description', p.name);
                onChange(item.id, 'unit_price', p.unit_price);
              } else {
                onChange(item.id, 'preset_id', null);
              }
            }}
          >
            <option value="">— preset —</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
        <input
          value={item.description}
          onChange={(e) => onChange(item.id, 'description', e.target.value)}
          placeholder="Description"
          className="w-full px-2.5 py-1.5 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg outline-none focus:border-sky-400 transition-all placeholder:text-slate-300"
        />
      </div>
      <input
        type="number"
        min="0.01"
        step="0.01"
        value={item.quantity}
        onChange={(e) =>
          onChange(item.id, 'quantity', parseFloat(e.target.value) || 0)
        }
        className="px-2.5 py-1.5 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg outline-none focus:border-sky-400 text-right"
      />
      <input
        type="number"
        min="0"
        step="0.01"
        value={item.unit_price}
        onChange={(e) =>
          onChange(item.id, 'unit_price', parseFloat(e.target.value) || 0)
        }
        className="px-2.5 py-1.5 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg outline-none focus:border-sky-400 text-right"
      />
      <div className="px-2.5 py-1.5 text-sm font-medium text-slate-700 text-right">
        {fmt(item.quantity * item.unit_price)}
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        disabled={!canRemove}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 disabled:opacity-30 transition-all mt-0.5"
      >
        <IcTrash />
      </button>
    </div>
  );
}

// ── Quote drawer ───────────────────────────────────────────────
function QuoteDrawer({
  form,
  setForm,
  onSubmit,
  onClose,
  isPending,
  error,
  clients,
  presets,
  currency,
}: {
  form: QuoteForm;
  setForm: React.Dispatch<React.SetStateAction<QuoteForm>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isPending: boolean;
  error: string | null;
  clients: { id: string; name: string }[];
  presets: { id: string; name: string; unit_price: number }[];
  currency: string;
}) {
  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }
  function handleLineChange(
    id: string,
    field: keyof LineItemForm,
    val: string | number | null
  ) {
    setForm((prev) => ({
      ...prev,
      line_items: prev.line_items.map((li) =>
        li.id === id ? { ...li, [field]: val } : li
      ),
    }));
  }
  function addLine() {
    setForm((prev) => ({
      ...prev,
      line_items: [...prev.line_items, blankLine()],
    }));
  }
  function removeLine(id: string) {
    setForm((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((li) => li.id !== id),
    }));
  }

  const subtotal = form.line_items.reduce(
    (s, li) => s + li.quantity * li.unit_price,
    0
  );
  const taxAmt = subtotal * (Number(form.tax_rate) / 100);
  const total = subtotal + taxAmt;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-slate-800 text-base font-semibold">
              New quote
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Send a proposal to a client
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <IcX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
              <IcAlert /> {error}
            </div>
          )}

          {/* Client + dates */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Details
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Client <span className="text-red-400">*</span>
                </label>
                <select
                  name="client_id"
                  value={form.client_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                >
                  <option value="">Select a client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Issue date"
                  name="issue_date"
                  type="date"
                  value={form.issue_date}
                  onChange={handleChange}
                />
                <Field
                  label="Expiry date"
                  name="expiry_date"
                  type="date"
                  value={form.expiry_date}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Line items
            </p>
            <div className="grid grid-cols-[1fr_80px_100px_80px_32px] gap-2 mb-2">
              {['Description', 'Qty', 'Unit price', 'Total', ''].map((h) => (
                <span
                  key={h}
                  className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right first:text-left"
                >
                  {h}
                </span>
              ))}
            </div>
            <div className="space-y-2">
              {form.line_items.map((li) => (
                <LineRow
                  key={li.id}
                  item={li}
                  onChange={handleLineChange}
                  onRemove={removeLine}
                  presets={presets}
                  canRemove={form.line_items.length > 1}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addLine}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors"
            >
              <IcPlus s={12} /> Add line item
            </button>
          </div>

          {/* Totals */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Totals
            </p>
            <Field
              label="Tax rate (%)"
              name="tax_rate"
              type="number"
              value={String(form.tax_rate)}
              onChange={handleChange}
            />
            <div className="pt-2 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{fmt(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax ({form.tax_rate}%)</span>
                <span>{fmt(taxAmt, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-800 font-bold pt-1 border-t border-slate-200">
                <span>Total</span>
                <span>{fmt(total, currency)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <Field
            label="Notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            textarea
            placeholder="What's included, terms, next steps…"
          />
        </div>

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
            disabled={isPending || !form.client_id}
            className="flex-1 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <IcSave /> {isPending ? 'Creating…' : 'Create quote'}
          </button>
        </div>
      </aside>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// QuotesPage
// ══════════════════════════════════════════════════════════════
export default function QuotesPage() {
  const navigate = useNavigate();

  const { data: quotes = [], isLoading } = useQuotes();
  const { data: clients = [] } = useClients();
  const { data: profile } = useProfile();
  const { data: presets = [] } = usePricingPresets();
  const createQuote = useCreateQuote();
  const updateStatus = useUpdateQuoteStatus();
  const deleteQuote = useDeleteQuote();
  const convertToInvoice = useConvertQuoteToInvoice();

  const currency = profile?.currency ?? 'CAD';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<QuoteRow | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [form, setForm] = useState<QuoteForm>(
    blankForm(profile?.default_tax_rate)
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return quotes as QuoteRow[];
    return (quotes as QuoteRow[]).filter((q) => q.status === statusFilter);
  }, [quotes, statusFilter]);

  function openCreate() {
    setForm(blankForm(profile?.default_tax_rate ?? 13));
    setFormError(null);
    setDrawerOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_id) {
      setFormError('Please select a client.');
      return;
    }
    if (form.line_items.some((li) => !li.description.trim())) {
      setFormError('All line items need a description.');
      return;
    }
    createQuote.mutate(form, {
      onSuccess: () => {
        setDrawerOpen(false);
        setFormError(null);
      },
      onError: (err) => setFormError((err as Error).message),
    });
  }

  function handleConvert(quoteId: string) {
    setConvertingId(quoteId);
    convertToInvoice.mutate(quoteId, {
      onSuccess: (invoice) => {
        setConvertingId(null);
        navigate(`/invoices/${invoice.id}`);
      },
      onError: () => setConvertingId(null),
    });
  }

  const statusFilters: Array<{ key: QuoteStatus | 'all'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'draft', label: 'Draft' },
    { key: 'sent', label: 'Sent' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'declined', label: 'Declined' },
    { key: 'expired', label: 'Expired' },
    { key: 'converted', label: 'Converted' },
  ];

  return (
    <div
      className="min-h-screen bg-slate-50 flex"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        activeId="quotes"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-slate-500 hover:text-slate-800 p-1 -ml-1"
              onClick={() => setSidebarOpen(true)}
            >
              <IcMenu />
            </button>
            <div>
              <h1 className="text-slate-800 text-base font-semibold leading-none">
                Quotes
              </h1>
              <p className="text-slate-400 text-xs mt-1 hidden sm:block">
                {isLoading
                  ? 'Loading…'
                  : `${quotes.length} quote${quotes.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-all shadow-sm shadow-sky-200"
          >
            <IcPlus /> New quote
          </button>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto space-y-4">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                  ${
                    statusFilter === f.key
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-500 hover:border-sky-200 hover:text-sky-600'
                  }`}
              >
                {f.label}
                {f.key !== 'all' && (
                  <span className="ml-1.5 opacity-70">
                    {quotes.filter((q) => q.status === f.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="animate-pulse bg-slate-100 rounded-xl w-9 h-9 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="animate-pulse bg-slate-100 rounded-xl h-3.5 w-40" />
                    <div className="animate-pulse bg-slate-100 rounded-xl h-3 w-24" />
                  </div>
                  <div className="animate-pulse bg-slate-100 rounded-xl h-6 w-16" />
                  <div className="animate-pulse bg-slate-100 rounded-xl h-4 w-16" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 mb-4">
                <IcQuote s={28} />
              </div>
              <p className="text-slate-700 text-base font-semibold">
                {statusFilter === 'all'
                  ? 'No quotes yet'
                  : `No ${statusFilter} quotes`}
              </p>
              <p className="text-slate-400 text-sm mt-1 mb-6">
                {statusFilter === 'all'
                  ? 'Send a proposal to start winning clients.'
                  : 'Try a different filter.'}
              </p>
              {statusFilter === 'all' && (
                <button
                  onClick={openCreate}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-all"
                >
                  <IcPlus /> New quote
                </button>
              )}
            </div>
          )}

          {/* Quote list */}
          {!isLoading && filtered.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_120px_100px_120px] gap-4 px-5 py-3 border-b border-slate-50 bg-slate-50/60">
                {['Client', 'Quote #', 'Issued', 'Status', 'Total', ''].map(
                  (h) => (
                    <span
                      key={h}
                      className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                    >
                      {h}
                    </span>
                  )
                )}
              </div>
              <div className="divide-y divide-slate-50">
                {filtered.map((quote) => (
                  <div
                    key={quote.id}
                    className="flex sm:grid sm:grid-cols-[2fr_1fr_1fr_120px_100px_120px] gap-3 sm:gap-4 items-center px-5 py-3.5 hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Client */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-500 ring-1 ring-indigo-200 flex items-center justify-center shrink-0">
                        <IcQuote s={13} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-slate-800 text-sm font-semibold truncate">
                          {quote.client?.name ?? '—'}
                        </div>
                        {quote.expiry_date && (
                          <div
                            className={`text-xs ${quote.status === 'expired' ? 'text-amber-500' : 'text-slate-400'}`}
                          >
                            Expires {fmtDate(quote.expiry_date)}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Quote # */}
                    <div className="hidden sm:block text-slate-500 text-xs font-mono">
                      {quote.quote_number}
                    </div>
                    {/* Issued */}
                    <div className="hidden sm:block text-slate-400 text-xs">
                      {fmtDate(quote.issue_date)}
                    </div>
                    {/* Status */}
                    <div className="hidden sm:block">
                      <StatusBadge
                        status={quote.status}
                        config={quoteStatusConfig}
                      />
                    </div>
                    {/* Total */}
                    <div className="text-slate-800 text-sm font-bold ml-auto sm:ml-0 shrink-0">
                      {fmt(quote.total, currency)}
                    </div>
                    {/* Actions */}
                    <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {quote.status === 'draft' && (
                        <button
                          onClick={() =>
                            updateStatus.mutate({
                              id: quote.id,
                              status: 'sent',
                            })
                          }
                          className="flex items-center gap-1 text-[11px] font-medium text-sky-600 bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded-lg transition-all"
                        >
                          <IcSend s={11} /> Send
                        </button>
                      )}
                      {quote.status === 'sent' && (
                        <>
                          <button
                            onClick={() =>
                              updateStatus.mutate({
                                id: quote.id,
                                status: 'accepted',
                              })
                            }
                            className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-all"
                          >
                            <IcCheck s={11} /> Accept
                          </button>
                          <button
                            onClick={() =>
                              updateStatus.mutate({
                                id: quote.id,
                                status: 'declined',
                              })
                            }
                            className="flex items-center gap-1 text-[11px] font-medium text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-all"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {quote.status === 'accepted' && (
                        <button
                          onClick={() => handleConvert(quote.id)}
                          disabled={convertingId === quote.id}
                          className="flex items-center gap-1 text-[11px] font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded-lg transition-all disabled:opacity-50"
                        >
                          <IcConvert s={11} />
                          {convertingId === quote.id
                            ? 'Converting…'
                            : 'To invoice'}
                        </button>
                      )}
                      {quote.status === 'converted' && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                          <IcCheck s={11} /> Invoiced
                        </span>
                      )}
                      <button
                        onClick={() => setDeleteTarget(quote as QuoteRow)}
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
        </main>
      </div>

      <BottomNav activeId="quotes" />

      {drawerOpen && (
        <QuoteDrawer
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => setDrawerOpen(false)}
          isPending={createQuote.isPending}
          error={formError}
          clients={clients}
          presets={presets}
          currency={currency}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          title={`Delete ${deleteTarget.quote_number}?`}
          message="This quote will be permanently removed along with its line items."
          onConfirm={() =>
            deleteQuote.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            })
          }
          onCancel={() => setDeleteTarget(null)}
          isPending={deleteQuote.isPending}
        />
      )}
    </div>
  );
}
