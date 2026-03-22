// ============================================================
// LensInvoice — Supabase Query Hooks
// src/hooks/useSupabase.ts
// ============================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type {
  Profile,
  Client,
  PricingPreset,
  Quote,
  QuoteWithDetails,
  Invoice,
  InvoiceWithDetails,
  LineItem,
  InvoiceStatus,
  QuoteStatus,
  InvoiceForm,
  QuoteForm,
} from "../types";

// ── Typed DB helper ───────────────────────────────────────────
// Supabase's generated generics collapse to `never` on insert/
// update when the inference chain is ambiguous. Bypassing the
// Database generic on the table helper and using our own row
// types directly eliminates all "cannot be assigned to never".
const db = supabase as ReturnType<typeof supabase.from> extends never
  ? never
  : typeof supabase;

function from<T extends object>(table: string) {
  return (db as any).from(table) as SupabaseTable<T>;
}

// Minimal typed surface for the operations we actually use.
interface SupabaseTable<T extends object> {
  select(cols?: string): SupabaseQuery<T>;
  insert(row: Partial<T> | Partial<T>[]): SupabaseQuery<T>;
  update(row: Partial<T>): SupabaseFilterQuery<T>;
  delete(): SupabaseFilterQuery<T>;
  upsert(row: Partial<T>): SupabaseQuery<T>;
}

interface SupabaseQuery<T> {
  eq(col: string, val: unknown): SupabaseQuery<T>;
  in(col: string, vals: unknown[]): SupabaseQuery<T>;
  order(col: string, opts?: { ascending?: boolean }): SupabaseQuery<T>;
  limit(n: number): SupabaseQuery<T>;
  single(): Promise<{ data: T; error: Error | null }>;
  then: Promise<{ data: T[]; error: Error | null; count?: number | null }>["then"];
}

interface SupabaseFilterQuery<T> {
  eq(col: string, val: unknown): SupabaseFilterQuery<T>;
  in(col: string, vals: unknown[]): SupabaseFilterQuery<T>;
  single(): Promise<{ data: T; error: Error | null }>;
  then: Promise<{ data: T[] | null; error: Error | null }>["then"];
}

// Helper: execute a SupabaseQuery and return data array
async function fetchAll<T>(q: SupabaseQuery<T>): Promise<T[]> {
  const { data, error } = await q;
  if (error) throw error;
  return (data as T[]) ?? [];
}

// Helper: execute a SupabaseQuery.single() and return one row
async function fetchOne<T>(q: SupabaseQuery<T>): Promise<T> {
  const { data, error } = await q.single();
  if (error) throw error;
  return data;
}

// Helper: execute a SupabaseFilterQuery.single() and return one row
// Used for update().eq().single() chains which return SupabaseFilterQuery
async function fetchOneFilter<T>(q: SupabaseFilterQuery<T>): Promise<T> {
  const { data, error } = await q.single();
  if (error) throw error;
  return data;
}

// ── Auth helper ───────────────────────────────────────────────
async function getUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return user.id;
}

// ── Totals calculator ─────────────────────────────────────────
function computeTotals(
  items: Array<{ quantity: number; unit_price: number }>,
  taxRate: number,
  discount = 0
) {
  const subtotal  = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const total     = subtotal - discount + taxAmount;
  return {
    subtotal:   +subtotal.toFixed(2),
    tax_amount: +taxAmount.toFixed(2),
    total:      +total.toFixed(2),
  };
}

// ── Query keys ────────────────────────────────────────────────
export const keys = {
  profile:   ["profile"]                      as const,
  clients:   ["clients"]                      as const,
  client:    (id: string) => ["clients", id]  as const,
  presets:   ["presets"]                      as const,
  quotes:    ["quotes"]                       as const,
  quote:     (id: string) => ["quotes", id]   as const,
  invoices:  ["invoices"]                     as const,
  invoice:   (id: string) => ["invoices", id] as const,
  dashboard: ["dashboard"]                    as const,
};

// ════════════════════════════════════════════════════════════
// PROFILE
// ════════════════════════════════════════════════════════════

export function useProfile() {
  return useQuery<Profile>({
    queryKey: keys.profile,
    queryFn: async () => {
      const uid = await getUserId();
      return fetchOne<Profile>(
        from<Profile>("profiles").select("*").eq("id", uid)
      );
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const uid = await getUserId();
      return fetchOneFilter<Profile>(
        from<Profile>("profiles").update(updates).eq("id", uid)
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.profile }),
  });
}

// ════════════════════════════════════════════════════════════
// CLIENTS
// ════════════════════════════════════════════════════════════

export function useClients() {
  return useQuery<Client[]>({
    queryKey: keys.clients,
    queryFn: () =>
      fetchAll<Client>(from<Client>("clients").select("*").order("name")),
  });
}

export function useClient(id: string) {
  return useQuery<Client>({
    queryKey: keys.client(id),
    enabled:  !!id,
    queryFn: () =>
      fetchOne<Client>(from<Client>("clients").select("*").eq("id", id)),
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Client, "id" | "created_at" | "updated_at" | "profile_id">) => {
      const uid = await getUserId();
      return fetchOne<Client>(
        from<Client>("clients").insert({ ...input, profile_id: uid })
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.clients }),
  });
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<Client>) =>
      fetchOneFilter<Client>(
        from<Client>("clients").update(updates).eq("id", id)
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.clients });
      qc.invalidateQueries({ queryKey: keys.client(id) });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await from<Client>("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.clients }),
  });
}

// ════════════════════════════════════════════════════════════
// PRICING PRESETS
// ════════════════════════════════════════════════════════════

export function usePricingPresets() {
  return useQuery<PricingPreset[]>({
    queryKey: keys.presets,
    queryFn: () =>
      fetchAll<PricingPreset>(
        from<PricingPreset>("pricing_presets").select("*").order("name")
      ),
  });
}

export function useCreatePreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<PricingPreset, "id" | "created_at">) => {
      const uid = await getUserId();
      return fetchOne<PricingPreset>(
        from<PricingPreset>("pricing_presets").insert({ ...input, profile_id: uid })
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.presets }),
  });
}

export function useDeletePreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await from<PricingPreset>("pricing_presets")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.presets }),
  });
}

// ════════════════════════════════════════════════════════════
// QUOTES
// ════════════════════════════════════════════════════════════

export type QuoteRow = Quote & { client: Pick<Client, "id" | "name" | "email"> };

export function useQuotes() {
  return useQuery<QuoteRow[]>({
    queryKey: keys.quotes,
    queryFn: () =>
      fetchAll<QuoteRow>(
        from<QuoteRow>("quotes")
          .select("*, client:clients(id, name, email)")
          .order("created_at", { ascending: false })
      ),
  });
}

export function useQuote(id: string) {
  return useQuery<QuoteWithDetails>({
    queryKey: keys.quote(id),
    enabled:  !!id,
    queryFn: () =>
      fetchOne<QuoteWithDetails>(
        from<QuoteWithDetails>("quotes")
          .select("*, client:clients(*), line_items(*)")
          .eq("id", id)
      ),
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: QuoteForm) => {
      const uid = await getUserId();
      const { line_items, ...rest } = form;
      const totals = computeTotals(line_items, rest.tax_rate);

      const quote = await fetchOne<Quote>(
        from<Quote>("quotes").insert({
          ...rest,
          profile_id:   uid,
          quote_number: "",
          ...totals,
        })
      );

      if (line_items.length > 0) {
        const rows = line_items.map((li, i) => ({
          parent_id:   quote.id,
          parent_type: "quote" as const,
          preset_id:   li.preset_id,
          description: li.description,
          quantity:    li.quantity,
          unit_price:  li.unit_price,
          sort_order:  i,
        }));
        const { error } = await from<LineItem>("line_items").insert(rows);
        if (error) throw error;
      }

      return quote;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.quotes }),
  });
}

export function useUpdateQuoteStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: QuoteStatus }) => {
      const { error } = await from<Quote>("quotes")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: keys.quotes });
      qc.invalidateQueries({ queryKey: keys.quote(id) });
    },
  });
}

export function useDeleteQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await from<LineItem>("line_items")
        .delete()
        .eq("parent_id", id)
        .eq("parent_type", "quote");
      const { error } = await from<Quote>("quotes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.quotes }),
  });
}

export function useConvertQuoteToInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quoteId: string) => {
      const uid = await getUserId();

      const quoteWithItems = await fetchOne<QuoteWithDetails>(
        from<QuoteWithDetails>("quotes")
          .select("*, line_items(*)")
          .eq("id", quoteId)
      );

      const invoice = await fetchOne<Invoice>(
        from<Invoice>("invoices").insert({
          profile_id:      uid,
          client_id:       quoteWithItems.client_id,
          quote_id:        quoteWithItems.id,
          invoice_number:  "",
          status:          "draft",
          issue_date:      new Date().toISOString().split("T")[0],
          tax_rate:        quoteWithItems.tax_rate,
          tax_amount:      quoteWithItems.tax_amount,
          discount_amount: 0,
          subtotal:        quoteWithItems.subtotal,
          total:           quoteWithItems.total,
          notes:           quoteWithItems.notes,
        })
      );

      if (quoteWithItems.line_items.length > 0) {
        const rows = quoteWithItems.line_items.map((li) => ({
          parent_id:   invoice.id,
          parent_type: "invoice" as const,
          preset_id:   li.preset_id,
          description: li.description,
          quantity:    li.quantity,
          unit_price:  li.unit_price,
          sort_order:  li.sort_order,
        }));
        const { error } = await from<LineItem>("line_items").insert(rows);
        if (error) throw error;
      }

      await from<Quote>("quotes")
        .update({ status: "accepted" })
        .eq("id", quoteId);

      return invoice;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.quotes });
      qc.invalidateQueries({ queryKey: keys.invoices });
    },
  });
}

// ════════════════════════════════════════════════════════════
// INVOICES
// ════════════════════════════════════════════════════════════

export type InvoiceRow = Invoice & { client: Pick<Client, "id" | "name" | "email"> };

export function useInvoices() {
  return useQuery<InvoiceRow[]>({
    queryKey: keys.invoices,
    queryFn: () =>
      fetchAll<InvoiceRow>(
        from<InvoiceRow>("invoices")
          .select("*, client:clients(id, name, email)")
          .order("created_at", { ascending: false })
      ),
  });
}

export function useInvoice(id: string) {
  return useQuery<InvoiceWithDetails>({
    queryKey: keys.invoice(id),
    enabled:  !!id,
    queryFn: () =>
      fetchOne<InvoiceWithDetails>(
        from<InvoiceWithDetails>("invoices")
          .select("*, client:clients(*), line_items(*), quote:quotes(*)")
          .eq("id", id)
      ),
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: InvoiceForm) => {
      const uid = await getUserId();
      const { line_items, ...rest } = form;
      const totals = computeTotals(line_items, rest.tax_rate, rest.discount_amount);

      const invoice = await fetchOne<Invoice>(
        from<Invoice>("invoices").insert({
          ...rest,
          profile_id:     uid,
          invoice_number: "",
          status:         "draft",
          ...totals,
        })
      );

      if (line_items.length > 0) {
        const rows = line_items.map((li, i) => ({
          parent_id:   invoice.id,
          parent_type: "invoice" as const,
          preset_id:   li.preset_id,
          description: li.description,
          quantity:    li.quantity,
          unit_price:  li.unit_price,
          sort_order:  i,
        }));
        const { error } = await from<LineItem>("line_items").insert(rows);
        if (error) throw error;
      }

      return invoice;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.invoices }),
  });
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InvoiceStatus }) => {
      const updates: Partial<Invoice> = {
        status,
        ...(status === "paid" ? { paid_at: new Date().toISOString() } : {}),
      };
      const { error } = await from<Invoice>("invoices")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: keys.invoices });
      qc.invalidateQueries({ queryKey: keys.invoice(id) });
    },
  });
}

export function useUpdateInvoice(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      form,
      existingLineItemIds,
    }: {
      form: InvoiceForm;
      existingLineItemIds: string[];
    }) => {
      const { line_items, ...rest } = form;
      const totals = computeTotals(line_items, rest.tax_rate, rest.discount_amount);

      const { error: iErr } = await from<Invoice>("invoices")
        .update({ ...rest, ...totals })
        .eq("id", id);
      if (iErr) throw iErr;

      if (existingLineItemIds.length > 0) {
        await from<LineItem>("line_items")
          .delete()
          .in("id", existingLineItemIds);
      }

      if (line_items.length > 0) {
        const rows = line_items.map((li, i) => ({
          parent_id:   id,
          parent_type: "invoice" as const,
          preset_id:   li.preset_id,
          description: li.description,
          quantity:    li.quantity,
          unit_price:  li.unit_price,
          sort_order:  i,
        }));
        const { error: liErr } = await from<LineItem>("line_items").insert(rows);
        if (liErr) throw liErr;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.invoices });
      qc.invalidateQueries({ queryKey: keys.invoice(id) });
    },
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await from<LineItem>("line_items")
        .delete()
        .eq("parent_id", id)
        .eq("parent_type", "invoice");
      const { error } = await from<Invoice>("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.invoices }),
  });
}

// ════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ════════════════════════════════════════════════════════════

export interface DashboardStats {
  thisMonthRevenue: number;
  outstanding:      number;
  paidThisYear:     number;
  activeClients:    number;
  recentInvoices:   InvoiceRow[];
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: keys.dashboard,
    queryFn: async () => {
      const now        = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const yearStart  = new Date(now.getFullYear(), 0, 1).toISOString();

      const [allInvoicesRes, clientCountRes, recentRes] = await Promise.all([
        from<Pick<Invoice, "status" | "total" | "paid_at">>("invoices")
          .select("status, total, paid_at"),
        supabase.from("clients").select("id", { count: "exact", head: true }),
        from<InvoiceRow>("invoices")
          .select("*, client:clients(id, name, email)")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const invoices: Array<Pick<Invoice, "status" | "total" | "paid_at">> =
        (allInvoicesRes as unknown as { data: typeof invoices }).data ?? [];

      const recent: InvoiceRow[] =
        (recentRes as unknown as { data: InvoiceRow[] }).data ?? [];

      const thisMonthRevenue = invoices
        .filter((i) => i.status === "paid" && i.paid_at != null && i.paid_at >= monthStart)
        .reduce((s, i) => s + (i.total ?? 0), 0);

      const outstanding = invoices
        .filter((i) => i.status === "sent" || i.status === "overdue")
        .reduce((s, i) => s + (i.total ?? 0), 0);

      const paidThisYear = invoices
        .filter((i) => i.status === "paid" && i.paid_at != null && i.paid_at >= yearStart)
        .reduce((s, i) => s + (i.total ?? 0), 0);

      return {
        thisMonthRevenue: +thisMonthRevenue.toFixed(2),
        outstanding:      +outstanding.toFixed(2),
        paidThisYear:     +paidThisYear.toFixed(2),
        activeClients:    clientCountRes.count ?? 0,
        recentInvoices:   recent,
      };
    },
  });
}