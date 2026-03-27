// ============================================================
// LensInvoice — TypeScript Types
// src/types/index.ts
// ============================================================

// ── Enums ─────────────────────────────────────────────────────
export type QuoteStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'converted';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type LineItemParent = 'quote' | 'invoice';

// ── Database row types ─────────────────────────────────────────
export interface Profile {
  id: string;
  full_name: string | null;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string;
  logo_url: string | null;
  tax_number: string | null;
  default_tax_rate: number;
  currency: string;
  invoice_prefix: string;
  quote_prefix: string;
  next_invoice_number: number;
  next_quote_number: number;
  created_at: string;
}

export interface Client {
  id: string;
  profile_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  country: string;
  postal_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PricingPreset {
  id: string;
  profile_id: string;
  name: string;
  description: string | null;
  unit_price: number;
  unit_label: string;
  created_at: string;
}

export interface Quote {
  id: string;
  profile_id: string;
  client_id: string;
  quote_number: string;
  status: QuoteStatus;
  issue_date: string;
  expiry_date: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  profile_id: string;
  client_id: string;
  quote_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  notes: string | null;
  payment_link: string | null;
  pdf_url: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LineItem {
  id: string;
  parent_id: string;
  parent_type: LineItemParent;
  preset_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number;
}

// ── Joined types (with related data) ──────────────────────────
export interface QuoteWithClient extends Quote {
  client: Client;
}
export interface QuoteWithDetails extends Quote {
  client: Client;
  line_items: LineItem[];
}
export interface InvoiceWithClient extends Invoice {
  client: Client;
}
export interface InvoiceWithDetails extends Invoice {
  client: Client;
  line_items: LineItem[];
  quote: Quote | null;
}

// ── Form state types (UI only, before saving to DB) ────────────
export interface LineItemForm {
  id: string; // temp client-side id, use crypto.randomUUID()
  preset_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface InvoiceForm {
  client_id: string;
  issue_date: string;
  due_date: string;
  tax_rate: number;
  discount_amount: number;
  notes: string;
  payment_link: string;
  line_items: LineItemForm[];
}

export interface QuoteForm {
  client_id: string;
  issue_date: string;
  expiry_date: string;
  tax_rate: number;
  notes: string;
  line_items: LineItemForm[];
}

// ── Supabase Database type map ─────────────────────────────────
// Supabase's createClient<Database> requires Tables to have
// Row, Insert, and Update shapes. Views, Functions, Enums are
// required keys — use empty Record when not needed.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<
          Omit<Client, 'id' | 'profile_id' | 'created_at' | 'updated_at'>
        >;
      };
      pricing_presets: {
        Row: PricingPreset;
        Insert: Omit<PricingPreset, 'id' | 'created_at'>;
        Update: Partial<
          Omit<PricingPreset, 'id' | 'profile_id' | 'created_at'>
        >;
      };
      quotes: {
        Row: Quote;
        Insert: Omit<Quote, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<
          Omit<Quote, 'id' | 'profile_id' | 'created_at' | 'updated_at'>
        >;
      };
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'paid_at'>;
        Update: Partial<
          Omit<Invoice, 'id' | 'profile_id' | 'created_at' | 'updated_at'>
        >;
      };
      line_items: {
        Row: LineItem;
        Insert: Omit<LineItem, 'id' | 'total'>;
        Update: Partial<Omit<LineItem, 'id' | 'total'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      quote_status: QuoteStatus;
      invoice_status: InvoiceStatus;
      line_item_parent: LineItemParent;
    };
  };
}

// ── Convenience aliases derived from the Database map ─────────
// Always derive these FROM Database, never define them separately.
// This guarantees they stay in sync if you change the map above.
export type InsertClient = Database['public']['Tables']['clients']['Insert'];
export type UpdateClient = Database['public']['Tables']['clients']['Update'];
export type InsertPricingPreset =
  Database['public']['Tables']['pricing_presets']['Insert'];
export type InsertQuote = Database['public']['Tables']['quotes']['Insert'];
export type UpdateQuote = Database['public']['Tables']['quotes']['Update'];
export type InsertInvoice = Database['public']['Tables']['invoices']['Insert'];
export type UpdateInvoice = Database['public']['Tables']['invoices']['Update'];
export type InsertLineItem =
  Database['public']['Tables']['line_items']['Insert'];
export type UpdateProfile = Database['public']['Tables']['profiles']['Update'];
