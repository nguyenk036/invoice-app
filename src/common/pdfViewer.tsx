// src/components/PdfViewer.tsx
// Inline PDF viewer panel used on invoice and quote detail pages.
// Shows a generate button if no PDF exists yet, or an iframe
// viewer if one has been generated.

import { useEffect } from 'react';
import { usePdf, downloadPdf } from '../hooks/usePdf';
import type { PdfData } from '../lib/generatePdf';

// ── Icons ──────────────────────────────────────────────────────
const IcFile = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const IcDownload = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IcRefresh = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);
const IcSpinner = () => (
  <svg
    className="animate-spin"
    width="16"
    height="16"
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
    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);
const IcAlert = () => (
  <svg
    width="14"
    height="14"
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

// ══════════════════════════════════════════════════════════════
// PdfViewer
// ══════════════════════════════════════════════════════════════
interface PdfViewerProps {
  type: 'invoice' | 'quote';
  id: string;
  number: string;
  existingUrl: string | null;
  pdfData: PdfData;
  className?: string;
}

export default function PdfViewer({
  type,
  id,
  number,
  existingUrl,
  pdfData,
  className = '',
}: PdfViewerProps) {
  const { signedUrl, generating, error, generate, refreshSignedUrl } = usePdf({
    type,
    id,
    number,
    existingUrl,
  });

  // On mount, refresh the signed URL if a PDF already exists
  useEffect(() => {
    if (existingUrl && !signedUrl) {
      refreshSignedUrl(existingUrl);
    }
  }, [existingUrl]);

  async function handleDownload() {
    await downloadPdf(pdfData);
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col ${className}`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="text-sky-500">
            <IcFile />
          </span>
          <span className="text-sm font-semibold">{number}.pdf</span>
          {signedUrl && (
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200 ml-1">
              Ready
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Regenerate */}
          {signedUrl && (
            <button
              onClick={() => generate(pdfData)}
              disabled={generating}
              title="Regenerate PDF"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 text-xs font-medium border border-slate-200 hover:border-sky-300 hover:text-sky-600 disabled:opacity-50 transition-all"
            >
              {generating ? <IcSpinner /> : <IcRefresh />}
              {generating ? 'Generating…' : 'Regenerate'}
            </button>
          )}
          {/* Download */}
          {signedUrl && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 text-xs font-medium border border-slate-200 hover:border-sky-300 hover:text-sky-600 transition-all"
            >
              <IcDownload /> Download
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-130 relative bg-slate-100">
        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center">
              <IcAlert />
            </div>
            <div>
              <p className="text-slate-700 text-sm font-medium">
                Generation failed
              </p>
              <p className="text-slate-400 text-xs mt-1 max-w-xs">{error}</p>
            </div>
            <button
              onClick={() => generate(pdfData)}
              disabled={generating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 disabled:opacity-50 transition-all"
            >
              {generating ? <IcSpinner /> : <IcRefresh />}
              Try again
            </button>
          </div>
        )}

        {/* Generating spinner */}
        {generating && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100">
            <IcSpinner />
            <p className="text-slate-500 text-sm">Generating PDF…</p>
          </div>
        )}

        {/* Empty — no PDF yet */}
        {!signedUrl && !generating && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-400 flex items-center justify-center">
              <IcFile />
            </div>
            <div>
              <p className="text-slate-700 text-sm font-semibold">
                No PDF generated yet
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Generate a PDF to preview, download, or share this{' '}
                {type === 'invoice' ? 'invoice' : 'quote'}.
              </p>
            </div>
            <button
              onClick={() => generate(pdfData)}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 disabled:opacity-50 transition-all"
              style={{ boxShadow: '0 4px 14px rgba(14,165,233,0.2)' }}
            >
              <IcFile /> Generate PDF
            </button>
          </div>
        )}

        {/* PDF iframe viewer */}
        {signedUrl && !generating && (
          <iframe
            key={signedUrl}
            src={`${signedUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full h-full min-h-130 border-0"
            title={`${number} PDF`}
          />
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PdfButton — compact trigger for list pages
// Just generates and downloads without showing a viewer
// ══════════════════════════════════════════════════════════════
interface PdfButtonProps {
  pdfData: PdfData;
  className?: string;
}

export function PdfButton({ pdfData, className = '' }: PdfButtonProps) {
  const { generating } = usePdf({
    type: pdfData.type,
    id: '', // not uploading — just downloading
    number: pdfData.number,
  });

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    await downloadPdf(pdfData);
  }

  return (
    <button
      onClick={handleClick}
      disabled={generating}
      className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg transition-all disabled:opacity-50 ${className}`}
    >
      {generating ? <IcSpinner /> : <IcDownload />}
      {generating ? '…' : 'PDF'}
    </button>
  );
}
