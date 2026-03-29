// src/pages/InvoiceDetailPage.tsx
// Detail view for a single invoice. Shows all fields,
// line items breakdown, and the inline PDF viewer.

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useInvoice,
  useUpdateInvoiceStatus,
  useProfile,
} from '../hooks/useSupabase';
import type { InvoiceStatus } from '../types';
import {
  BottomNav,
  fmt,
  fmtDate,
  IcArrowLeft,
  IcCheck,
  IcEdit,
  IcMenu,
  IcSend,
  invoiceStatusConfig,
  Sidebar,
  StatusBadge,
} from '../common/shared';
import PdfViewer from '../common/pdfViewer';
import type { PdfData } from '../lib/generatePdf';

function Skeleton({ className }: { className: string }) {
  return (
    <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
  );
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: invoice, isLoading } = useInvoice(id ?? '');
  const { data: profile } = useProfile();
  const updateStatus = useUpdateInvoiceStatus();

  const currency = profile?.currency ?? 'CAD';

  // Build PdfData once invoice and profile are loaded
  const pdfData: PdfData | null =
    invoice && profile
      ? {
          type: 'invoice',
          number: invoice.invoice_number,
          issueDate: invoice.issue_date,
          dueOrExpiryDate: invoice.due_date,
          status: invoice.status,
          profile,
          client: invoice.client,
          lineItems: invoice.line_items ?? [],
          subtotal: invoice.subtotal,
          taxRate: invoice.tax_rate,
          taxAmount: invoice.tax_amount,
          discountAmount: invoice.discount_amount,
          total: invoice.total,
          notes: invoice.notes,
          paymentLink: invoice.payment_link,
          currency,
        }
      : null;

  function handleStatus(status: InvoiceStatus) {
    if (!id) return;
    updateStatus.mutate({ id, status });
  }

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
        activeId="invoices"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-slate-500 p-1 -ml-1"
              onClick={() => setSidebarOpen(true)}
            >
              <IcMenu />
            </button>
            <button
              onClick={() => navigate('/invoices')}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
            >
              <IcArrowLeft /> Invoices
            </button>
            {invoice && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-slate-800 text-sm font-semibold">
                  {invoice.invoice_number}
                </span>
                <StatusBadge
                  status={invoice.status}
                  config={invoiceStatusConfig}
                />
              </>
            )}
          </div>
          {/* Quick status actions */}
          {invoice && (
            <div className="flex items-center gap-2">
              {invoice.status === 'draft' && (
                <button
                  onClick={() => handleStatus('sent')}
                  disabled={updateStatus.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-200 text-sky-600 text-xs font-medium bg-sky-50 hover:bg-sky-100 transition-all disabled:opacity-50"
                >
                  <IcSend s={12} /> Mark sent
                </button>
              )}
              {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                <button
                  onClick={() => handleStatus('paid')}
                  disabled={updateStatus.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-600 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 transition-all disabled:opacity-50"
                >
                  <IcCheck s={12} /> Mark paid
                </button>
              )}
              <button
                onClick={() => navigate(`/invoices/${id}/edit`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:border-sky-300 hover:text-sky-600 transition-all"
              >
                <IcEdit s={12} /> Edit
              </button>
            </div>
          )}
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
              <div className="space-y-4">
                <Skeleton className="h-48" />
                <Skeleton className="h-64" />
              </div>
              <Skeleton className="h-150" />
            </div>
          ) : !invoice ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-slate-500 text-sm">Invoice not found.</p>
              <button
                onClick={() => navigate('/invoices')}
                className="mt-3 text-sky-500 text-sm font-medium hover:underline"
              >
                Back to invoices
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
              {/* ── Left — details ──────────────────────────── */}
              <div className="space-y-4">
                {/* Invoice meta */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                    {[
                      { label: 'Invoice #', value: invoice.invoice_number },
                      {
                        label: 'Issue date',
                        value: fmtDate(invoice.issue_date),
                      },
                      { label: 'Due date', value: fmtDate(invoice.due_date) },
                      {
                        label: 'Status',
                        value: (
                          <StatusBadge
                            status={invoice.status}
                            config={invoiceStatusConfig}
                          />
                        ),
                      },
                    ].map((f) => (
                      <div key={f.label}>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          {f.label}
                        </div>
                        <div className="text-slate-800 text-sm font-semibold">
                          {f.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Client */}
                  <div className="border-t border-slate-100 pt-4">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Billed to
                    </div>
                    <div className="text-slate-800 text-sm font-semibold">
                      {invoice.client.name}
                    </div>
                    {invoice.client.company && (
                      <div className="text-slate-500 text-xs mt-0.5">
                        {invoice.client.company}
                      </div>
                    )}
                    {invoice.client.email && (
                      <div className="text-slate-500 text-xs mt-0.5">
                        {invoice.client.email}
                      </div>
                    )}
                    {invoice.client.address && (
                      <div className="text-slate-400 text-xs mt-0.5">
                        {[
                          invoice.client.address,
                          invoice.client.city,
                          invoice.client.province,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Line items */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="grid grid-cols-[1fr_60px_90px_90px] gap-3 px-5 py-3 bg-slate-50/60 border-b border-slate-100">
                    {['Description', 'Qty', 'Rate', 'Total'].map((h, i) => (
                      <span
                        key={h}
                        className={`text-[10px] font-semibold text-slate-400 uppercase tracking-wider ${i > 0 ? 'text-right' : ''}`}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                  <div className="divide-y divide-slate-50">
                    {(invoice.line_items ?? []).map((li) => (
                      <div
                        key={li.id}
                        className="grid grid-cols-[1fr_60px_90px_90px] gap-3 px-5 py-3.5"
                      >
                        <span className="text-slate-700 text-sm">
                          {li.description}
                        </span>
                        <span className="text-slate-500 text-sm text-right">
                          {li.quantity}
                        </span>
                        <span className="text-slate-500 text-sm text-right">
                          {fmt(li.unit_price, currency)}
                        </span>
                        <span className="text-slate-800 text-sm font-semibold text-right">
                          {fmt(li.total, currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-slate-200 px-5 py-4 space-y-2">
                    {[
                      {
                        label: 'Subtotal',
                        value: fmt(invoice.subtotal, currency),
                        muted: true,
                      },
                      invoice.discount_amount > 0
                        ? {
                            label: 'Discount',
                            value: `−${fmt(invoice.discount_amount, currency)}`,
                            muted: true,
                          }
                        : null,
                      {
                        label: `Tax (${invoice.tax_rate}%)`,
                        value: fmt(invoice.tax_amount, currency),
                        muted: true,
                      },
                    ]
                      .filter(Boolean)
                      .map((row) => (
                        <div
                          key={row!.label}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-slate-400">{row!.label}</span>
                          <span className="text-slate-500">{row!.value}</span>
                        </div>
                      ))}
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200">
                      <span className="text-slate-800">Total due</span>
                      <span className="text-slate-900">
                        {fmt(invoice.total, currency)}
                      </span>
                    </div>
                    {invoice.paid_at && (
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-emerald-600 font-medium">
                          Paid
                        </span>
                        <span className="text-slate-400">
                          {fmtDate(invoice.paid_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes + payment link */}
                {(invoice.notes || invoice.payment_link) && (
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                    {invoice.payment_link && (
                      <div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Payment link
                        </div>
                        <a
                          href={invoice.payment_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-500 text-sm hover:underline break-all"
                        >
                          {invoice.payment_link}
                        </a>
                      </div>
                    )}
                    {invoice.notes && (
                      <div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Notes
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap">
                          {invoice.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Right — PDF viewer ───────────────────────── */}
              {pdfData && (
                <PdfViewer
                  type="invoice"
                  id={invoice.id}
                  number={invoice.invoice_number}
                  existingUrl={invoice.pdf_url}
                  pdfData={pdfData}
                  className="lg:sticky lg:top-24 h-fit"
                />
              )}
            </div>
          )}
        </main>
      </div>

      <BottomNav activeId="invoices" />
    </div>
  );
}
