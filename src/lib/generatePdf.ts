// src/lib/generatePdf.ts
// Generates a professional invoice or quote PDF using pdf-lib.
// Designed to match the app's clean, minimal aesthetic.
// No external fonts needed — uses pdf-lib's built-in Helvetica.

import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import type { Profile, Client, LineItem } from '../types';

// ── Colour palette ─────────────────────────────────────────────
const C = {
  ink: rgb(0.1, 0.11, 0.13), // slate-900
  inkLight: rgb(0.35, 0.38, 0.43), // slate-600
  inkMuted: rgb(0.58, 0.62, 0.67), // slate-400
  sky: rgb(0.06, 0.64, 0.9), // sky-500
  skyLight: rgb(0.93, 0.97, 1.0), // sky-50
  border: rgb(0.9, 0.92, 0.95), // slate-200
  bg: rgb(0.98, 0.98, 0.99), // slate-50
  white: rgb(1.0, 1.0, 1.0),
  green: rgb(0.13, 0.62, 0.43), // emerald-600
  amber: rgb(0.73, 0.47, 0.07), // amber-600
};

// ── Page dimensions (A4) ───────────────────────────────────────
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const COL_W = PAGE_W - MARGIN * 2;

// ── Currency formatter ─────────────────────────────────────────
function fmtCurrency(amount: number, currency = 'CAD'): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// ── Date formatter ─────────────────────────────────────────────
function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ── Drawing helpers ────────────────────────────────────────────
function drawRect(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  {
    fill = C.white,
    stroke,
    strokeWidth = 0.5,
  }: {
    fill?: ReturnType<typeof rgb>;
    stroke?: ReturnType<typeof rgb>;
    strokeWidth?: number;
  } = {}
) {
  if (fill) page.drawRectangle({ x, y, width: w, height: h, color: fill });
  if (stroke)
    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      borderColor: stroke,
      borderWidth: strokeWidth,
      color: undefined,
    });
}

function drawLine(
  page: PDFPage,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  { color = C.border, thickness = 0.5 } = {}
) {
  page.drawLine({
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    color,
    thickness,
  });
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  {
    font,
    size = 10,
    color = C.ink,
    maxWidth,
  }: {
    font: PDFFont;
    size?: number;
    color?: ReturnType<typeof rgb>;
    maxWidth?: number;
  }
) {
  // Truncate text if it exceeds maxWidth
  let displayText = text;
  if (maxWidth) {
    while (
      displayText.length > 0 &&
      font.widthOfTextAtSize(displayText, size) > maxWidth
    ) {
      displayText = displayText.slice(0, -1);
    }
    if (displayText.length < text.length)
      displayText = displayText.slice(0, -1) + '…';
  }
  page.drawText(displayText, { x, y, font, size, color });
}

function drawTextRight(
  page: PDFPage,
  text: string,
  rightEdge: number,
  y: number,
  {
    font,
    size = 10,
    color = C.ink,
  }: { font: PDFFont; size?: number; color?: ReturnType<typeof rgb> }
) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: rightEdge - w, y, font, size, color });
}

// ── Multiline text ─────────────────────────────────────────────
function drawMultiline(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  {
    font,
    size = 9,
    color = C.inkLight,
    maxWidth,
    lineHeight = 13,
  }: {
    font: PDFFont;
    size?: number;
    color?: ReturnType<typeof rgb>;
    maxWidth: number;
    lineHeight?: number;
  }
): number {
  const words = text.split(' ');
  let line = '';
  let curY = y;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      page.drawText(line, { x, y: curY, font, size, color });
      curY -= lineHeight;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) {
    page.drawText(line, { x, y: curY, font, size, color });
    curY -= lineHeight;
  }
  return curY; // returns the Y position after the last line
}

// ══════════════════════════════════════════════════════════════
// PDF data types
// ══════════════════════════════════════════════════════════════
export interface PdfData {
  type: 'invoice' | 'quote';
  number: string; // INV-001 or QUO-001
  issueDate: string;
  dueOrExpiryDate: string | null; // due date for invoice, expiry for quote
  status: string;
  profile: Profile;
  client: Client;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount?: number;
  total: number;
  notes: string | null;
  paymentLink: string | null;
  currency: string;
}

// ══════════════════════════════════════════════════════════════
// Main generator
// ══════════════════════════════════════════════════════════════
export async function generatePdf(data: PdfData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(
    `${data.type === 'invoice' ? 'Invoice' : 'Quote'} ${data.number}`
  );
  pdfDoc.setAuthor(
    data.profile.business_name ?? data.profile.full_name ?? 'LensInvoice'
  );
  pdfDoc.setCreationDate(new Date());

  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const reg = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const oblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  let y = PAGE_H - MARGIN;

  // ── Header band ───────────────────────────────────────────────
  drawRect(page, 0, PAGE_H - 110, PAGE_W, 110, { fill: C.ink });

  // Business name
  const bizName =
    data.profile.business_name ?? data.profile.full_name ?? 'Your Business';
  drawText(page, bizName, MARGIN, PAGE_H - MARGIN - 2, {
    font: bold,
    size: 18,
    color: C.white,
  });

  // Document type badge
  const docLabel = data.type === 'invoice' ? 'INVOICE' : 'ESTIMATE';
  const badgeW = bold.widthOfTextAtSize(docLabel, 9) + 20;
  const badgeX = PAGE_W - MARGIN - badgeW;
  drawRect(page, badgeX, PAGE_H - MARGIN - 20, badgeW, 22, { fill: C.sky });
  drawText(page, docLabel, badgeX + 10, PAGE_H - MARGIN - 12, {
    font: bold,
    size: 9,
    color: C.white,
  });

  // Document number
  drawTextRight(page, data.number, PAGE_W - MARGIN, PAGE_H - MARGIN - 36, {
    font: bold,
    size: 14,
    color: C.white,
  });

  // Business sub-details in header
  const bizDetails = [
    data.profile.email,
    data.profile.phone,
    data.profile.address,
  ]
    .filter(Boolean)
    .join('  ·  ');
  if (bizDetails) {
    drawText(page, bizDetails, MARGIN, PAGE_H - MARGIN - 36, {
      font: reg,
      size: 8,
      color: rgb(0.65, 0.7, 0.76),
    });
  }
  if (data.profile.tax_number) {
    drawText(
      page,
      `Tax/GST: ${data.profile.tax_number}`,
      MARGIN,
      PAGE_H - MARGIN - 50,
      {
        font: reg,
        size: 8,
        color: rgb(0.55, 0.6, 0.66),
      }
    );
  }

  y = PAGE_H - 110 - 28;

  // ── Dates + status row ─────────────────────────────────────────
  const dateColW = COL_W / 4;

  const dateFields: Array<{ label: string; value: string }> = [
    { label: 'Issue date', value: fmtDate(data.issueDate) },
    {
      label: data.type === 'invoice' ? 'Due date' : 'Expiry date',
      value: fmtDate(data.dueOrExpiryDate),
    },
    { label: 'Status', value: data.status.toUpperCase() },
  ];

  dateFields.forEach((df, i) => {
    const dx = MARGIN + i * dateColW;
    drawText(page, df.label, dx, y, { font: reg, size: 8, color: C.inkMuted });
    const isOverdue = df.label === 'Due date' && data.status === 'overdue';
    const isStatus = df.label === 'Status';
    const valColor = isOverdue
      ? C.amber
      : isStatus && data.status === 'paid'
        ? C.green
        : isStatus
          ? C.sky
          : C.ink;
    drawText(page, df.value, dx, y - 16, {
      font: bold,
      size: 10,
      color: valColor,
    });
  });

  y -= 48;

  // ── Divider ────────────────────────────────────────────────────
  drawLine(page, MARGIN, y, PAGE_W - MARGIN, y);
  y -= 24;

  // ── Billed to / From ──────────────────────────────────────────
  const halfW = COL_W / 2 - 16;

  // FROM (left)
  drawText(page, 'FROM', MARGIN, y, { font: bold, size: 7, color: C.sky });
  y -= 14;
  drawText(page, bizName, MARGIN, y, {
    font: bold,
    size: 10,
    color: C.ink,
    maxWidth: halfW,
  });
  y -= 14;
  const fromLines = [
    data.profile.address,
    [data.profile.city, data.profile.country].filter(Boolean).join(', '),
    data.profile.email,
    data.profile.phone,
  ].filter(Boolean) as string[];

  fromLines.forEach((line) => {
    drawText(page, line, MARGIN, y, {
      font: reg,
      size: 9,
      color: C.inkLight,
      maxWidth: halfW,
    });
    y -= 13;
  });

  // BILLED TO (right)
  const toX = MARGIN + halfW + 32;
  let toY = y + (fromLines.length + 1) * 13 + 14;

  drawText(page, 'BILLED TO', toX, toY, { font: bold, size: 7, color: C.sky });
  toY -= 14;
  drawText(page, data.client.name, toX, toY, {
    font: bold,
    size: 10,
    color: C.ink,
    maxWidth: halfW,
  });
  toY -= 14;
  if (data.client.company) {
    drawText(page, data.client.company, toX, toY, {
      font: reg,
      size: 9,
      color: C.inkLight,
      maxWidth: halfW,
    });
    toY -= 13;
  }
  const clientLines = [
    data.client.address,
    [data.client.city, data.client.province, data.client.postal_code]
      .filter(Boolean)
      .join(', '),
    data.client.country,
    data.client.email,
    data.client.phone,
  ].filter(Boolean) as string[];

  clientLines.forEach((line) => {
    drawText(page, line, toX, toY, {
      font: reg,
      size: 9,
      color: C.inkLight,
      maxWidth: halfW,
    });
    toY -= 13;
  });

  // Use lowest Y between both columns
  y = Math.min(y, toY) - 20;

  // ── Divider ────────────────────────────────────────────────────
  drawLine(page, MARGIN, y, PAGE_W - MARGIN, y);
  y -= 20;

  // ── Line items table ──────────────────────────────────────────
  const COL = {
    desc: { x: MARGIN, w: 260 },
    qty: { x: MARGIN + 270, w: 50 },
    rate: { x: MARGIN + 340, w: 80 },
    total: { x: MARGIN + 440, w: COL_W - 440 },
  };
  const RIGHT_EDGE = MARGIN + COL_W;

  // Table header
  drawRect(page, MARGIN, y - 20, COL_W, 22, { fill: C.ink });
  const headers: Array<{ label: string; x: number; right?: boolean }> = [
    { label: 'DESCRIPTION', x: COL.desc.x + 8 },
    { label: 'QTY', x: COL.qty.x, right: true },
    { label: 'RATE', x: COL.rate.x + COL.rate.w, right: true },
    { label: 'AMOUNT', x: RIGHT_EDGE, right: true },
  ];
  headers.forEach((h) => {
    if (h.right) {
      drawTextRight(page, h.label, h.x - 8, y - 13, {
        font: bold,
        size: 7,
        color: C.white,
      });
    } else {
      drawText(page, h.label, h.x, y - 13, {
        font: bold,
        size: 7,
        color: C.white,
      });
    }
  });
  y -= 22;

  // Line item rows
  const sortedItems = [...data.lineItems].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  sortedItems.forEach((item, idx) => {
    const rowH = 28;
    const rowY = y - rowH;

    // Alternating row background
    if (idx % 2 === 0) {
      drawRect(page, MARGIN, rowY, COL_W, rowH, { fill: C.bg });
    }

    const midY = rowY + rowH / 2 - 4;

    drawText(page, item.description, COL.desc.x + 8, midY, {
      font: reg,
      size: 9,
      color: C.ink,
      maxWidth: COL.desc.w - 16,
    });
    drawTextRight(page, String(item.quantity), COL.qty.x + COL.qty.w, midY, {
      font: reg,
      size: 9,
      color: C.inkLight,
    });
    drawTextRight(
      page,
      fmtCurrency(item.unit_price, data.currency),
      COL.rate.x + COL.rate.w,
      midY,
      {
        font: reg,
        size: 9,
        color: C.inkLight,
      }
    );
    drawTextRight(
      page,
      fmtCurrency(item.total, data.currency),
      RIGHT_EDGE - 8,
      midY,
      {
        font: bold,
        size: 9,
        color: C.ink,
      }
    );

    // Bottom border
    drawLine(page, MARGIN, rowY, PAGE_W - MARGIN, rowY, {
      color: C.border,
      thickness: 0.3,
    });
    y -= rowH;
  });

  y -= 8;

  // ── Totals block ──────────────────────────────────────────────
  const totalsX = MARGIN + COL_W * 0.55;
  const totalsW = COL_W * 0.45;
  const labelX = totalsX + 8;
  const valueX = RIGHT_EDGE - 8;

  function drawTotalRow(
    label: string,
    value: string,
    {
      bold: isBold = false,
      highlight = false,
      color = C.inkLight,
    }: {
      bold?: boolean;
      highlight?: boolean;
      color?: ReturnType<typeof rgb>;
    } = {}
  ) {
    if (highlight) {
      drawRect(page, totalsX, y - 26, totalsW, 28, { fill: C.ink });
      drawText(page, label, labelX, y - 14, {
        font: bold ? boldFont : regFont,
        size: 10,
        color: C.white,
      });
      drawTextRight(page, value, valueX, y - 14, {
        font: bold ? boldFont : regFont,
        size: 10,
        color: C.white,
      });
    } else {
      drawLine(page, totalsX, y, RIGHT_EDGE, y, { color: C.border });
      drawText(page, label, labelX, y - 14, { font: regFont, size: 9, color });
      drawTextRight(page, value, valueX, y - 14, {
        font: isBold ? boldFont : regFont,
        size: 9,
        color: isBold ? C.ink : color,
      });
    }
    y -= highlight ? 28 : 22;
  }

  // Need font refs for the closure
  const boldFont = bold;
  const regFont = reg;

  drawTotalRow('Subtotal', fmtCurrency(data.subtotal, data.currency));
  if (data.discountAmount && data.discountAmount > 0) {
    drawTotalRow(
      'Discount',
      `−${fmtCurrency(data.discountAmount, data.currency)}`,
      { color: C.green }
    );
  }
  drawTotalRow(
    `Tax (${data.taxRate}%)`,
    fmtCurrency(data.taxAmount, data.currency)
  );
  drawTotalRow(
    data.type === 'invoice' ? 'Total due' : 'Estimated total',
    fmtCurrency(data.total, data.currency),
    { bold: true, highlight: true }
  );

  y -= 24;

  // ── Payment link ───────────────────────────────────────────────
  if (data.paymentLink && data.type === 'invoice') {
    drawRect(page, MARGIN, y - 36, COL_W, 38, {
      fill: C.skyLight,
      stroke: C.sky,
      strokeWidth: 0.75,
    });
    drawText(page, 'Pay online:', MARGIN + 12, y - 14, {
      font: bold,
      size: 9,
      color: C.sky,
    });
    drawText(page, data.paymentLink, MARGIN + 80, y - 14, {
      font: reg,
      size: 9,
      color: C.inkLight,
      maxWidth: COL_W - 100,
    });
    page.drawText(data.paymentLink, {
      x: MARGIN + 80,
      y: y - 14,
      font: reg,
      size: 9,
      color: C.sky,
    });
    y -= 52;
  }

  // ── Notes ──────────────────────────────────────────────────────
  if (data.notes) {
    drawText(page, 'NOTES', MARGIN, y, { font: bold, size: 7, color: C.sky });
    y -= 14;
    y = drawMultiline(page, data.notes, MARGIN, y, {
      font: oblique,
      size: 9,
      color: C.inkLight,
      maxWidth: COL_W,
    });
    y -= 8;
  }

  // ── Footer ─────────────────────────────────────────────────────
  const footerY = 32;
  drawLine(page, MARGIN, footerY + 18, PAGE_W - MARGIN, footerY + 18, {
    color: C.border,
  });
  const footerLeft = `${bizName} · ${data.number}`;
  const footerRight = `Generated by LensInvoice`;
  drawText(page, footerLeft, MARGIN, footerY + 6, {
    font: reg,
    size: 7.5,
    color: C.inkMuted,
  });
  drawTextRight(page, footerRight, PAGE_W - MARGIN, footerY + 6, {
    font: reg,
    size: 7.5,
    color: C.inkMuted,
  });

  return pdfDoc.save();
}
