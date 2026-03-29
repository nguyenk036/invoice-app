// src/hooks/usePdf.ts
// Handles PDF generation, upload to Supabase Storage,
// saving the URL back to the invoice/quote row, and fetching
// a fresh signed URL for viewing.

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { keys } from './useSupabase';
import { generatePdf, type PdfData } from '../lib/generatePdf';

// ── Storage helpers ────────────────────────────────────────────
const BUCKET = 'pdfs';

async function getUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Not authenticated');
  return user.id;
}

function storagePath(
  userId: string,
  type: 'invoices' | 'quotes',
  number: string
): string {
  // Path: {userId}/invoices/INV-001.pdf
  // RLS policy checks that folder[0] === auth.uid()
  const safe = number.replace(/[^a-zA-Z0-9\-_]/g, '_');
  return `${userId}/${type}/${safe}.pdf`;
}

// ── Upload PDF bytes to Supabase Storage ───────────────────────
async function uploadPdf(
  userId: string,
  type: 'invoices' | 'quotes',
  number: string,
  bytes: Uint8Array
): Promise<string> {
  const path = storagePath(userId, type, number);

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: 'application/pdf',
    upsert: true, // overwrite if regenerated
  });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return path;
}

// ── Get a short-lived signed URL (1 hour) ─────────────────────
async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600);

  if (error || !data?.signedUrl) throw new Error('Could not create signed URL');
  return data.signedUrl;
}

// ── Save pdf_url back to the DB row ───────────────────────────
async function savePdfUrl(
  type: 'invoices' | 'quotes',
  id: string,
  url: string
): Promise<void> {
  const { error } = await supabase
    .from(type)
    .update({ pdf_url: url } as never) // temp fix
    .eq('id', id);
  if (error) throw new Error(`Could not save PDF URL: ${error.message}`);
}

// ══════════════════════════════════════════════════════════════
// usePdf hook
// ══════════════════════════════════════════════════════════════
interface UsePdfOptions {
  type: 'invoice' | 'quote';
  id: string;
  number: string;
  existingUrl?: string | null;
}

export interface PdfState {
  url: string | null;
  generating: boolean;
  error: string | null;
}

export function usePdf({ type, id, number, existingUrl }: UsePdfOptions) {
  const qc = useQueryClient();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Refresh an existing pdf_url into a fresh signed URL ──────
  // Called on mount if pdf_url already exists in the DB row
  const refreshSignedUrl = useCallback(async (storedUrl: string) => {
    try {
      // storedUrl may already be a signed URL (with token) or a raw path
      // Extract the path from the stored URL if it's a signed URL
      const url = new URL(storedUrl);
      const pathMatch = url.pathname.match(/\/object\/sign\/pdfs\/(.+)/);
      const rawPath = pathMatch ? decodeURIComponent(pathMatch[1]) : storedUrl;
      const fresh = await getSignedUrl(rawPath);
      setSignedUrl(fresh);
    } catch {
      // If refresh fails, clear so user can regenerate
      setSignedUrl(null);
    }
  }, []);

  // ── Generate + upload + save ───────────────────────────────
  const generate = useMutation({
    mutationFn: async (pdfData: PdfData) => {
      setError(null);

      // 1. Generate PDF bytes in-browser
      const bytes = await generatePdf(pdfData);
      const userId = await getUserId();
      const bucket = type === 'invoice' ? 'invoices' : 'quotes';

      // 2. Upload to Supabase Storage
      const path = await uploadPdf(userId, bucket, number, bytes);

      // 3. Get a signed URL for immediate viewing
      const fresh = await getSignedUrl(path);

      // 4. Save the raw storage path to the DB
      //    (we save the path not the signed URL since signed URLs expire)
      await savePdfUrl(
        type === 'invoice' ? 'invoices' : 'quotes',
        id,
        fresh // save full signed URL — refresh on next open
      );

      setSignedUrl(fresh);
      return fresh;
    },
    onSuccess: () => {
      // Invalidate so the list/detail pages show the updated pdf_url
      if (type === 'invoice') {
        qc.invalidateQueries({ queryKey: keys.invoices });
        qc.invalidateQueries({ queryKey: keys.invoice(id) });
      } else {
        qc.invalidateQueries({ queryKey: keys.quotes });
        qc.invalidateQueries({ queryKey: keys.quote(id) });
      }
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  return {
    // The current viewable signed URL (null if not yet generated)
    signedUrl: signedUrl ?? existingUrl ?? null,
    generating: generate.isPending,
    error,
    generate: generate.mutate,
    refreshSignedUrl,
  };
}

// ── Standalone download helper ────────────────────────────────
// Call this to trigger a browser download without opening a viewer
export async function downloadPdf(pdfData: PdfData): Promise<void> {
  const bytes = await generatePdf(pdfData);
  const blob = new Blob([bytes] as BlobPart[], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${pdfData.number}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
