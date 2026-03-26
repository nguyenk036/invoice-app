// src/pages/SettingsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useProfile,
  useUpdateProfile,
  usePricingPresets,
  useCreatePreset,
  useDeletePreset,
} from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';
import {
  Sidebar,
  BottomNav,
  Field,
  DeleteModal,
  IcPlus,
  IcX,
  IcMenu,
  IcTrash,
  IcSave,
  IcAlert,
  IcCheck,
} from '../common/shared';

// ── Section header ─────────────────────────────────────────────
function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-slate-800 text-sm font-semibold">{title}</h2>
      {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────
function Toast({
  message,
  type,
}: {
  message: string;
  type: 'success' | 'error';
}) {
  return (
    <div
      className={`fixed bottom-24 lg:bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in
      ${
        type === 'success'
          ? 'bg-emerald-500 text-white'
          : 'bg-red-500 text-white'
      }`}
    >
      {type === 'success' ? <IcCheck s={15} /> : <IcAlert s={15} />}
      {message}
    </div>
  );
}

// ── Preset row ─────────────────────────────────────────────────
function PresetRow({
  preset,
  onDelete,
}: {
  preset: {
    id: string;
    name: string;
    description: string | null;
    unit_price: number;
    unit_label: string;
  };
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0 group">
      <div className="flex-1 min-w-0">
        <div className="text-slate-700 text-sm font-medium">{preset.name}</div>
        {preset.description && (
          <div className="text-slate-400 text-xs mt-0.5 truncate">
            {preset.description}
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        <div className="text-slate-800 text-sm font-semibold">
          ${preset.unit_price.toFixed(2)}
        </div>
        <div className="text-slate-400 text-xs">per {preset.unit_label}</div>
      </div>
      <button
        onClick={onDelete}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all ml-1"
      >
        <IcTrash />
      </button>
    </div>
  );
}

// ── Blank preset form ──────────────────────────────────────────
const blankPreset = {
  name: '',
  description: '',
  unit_price: '',
  unit_label: 'session',
};

// ══════════════════════════════════════════════════════════════
// SettingsPage
// ══════════════════════════════════════════════════════════════
export default function SettingsPage() {
  const navigate = useNavigate();

  const { data: profile, isLoading } = useProfile();
  const { data: presets = [] } = usePricingPresets();
  const updateProfile = useUpdateProfile();
  const createPreset = useCreatePreset();
  const deletePreset = useDeletePreset();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deletePresetId, setDeletePresetId] = useState<string | null>(null);
  const [presetForm, setPresetForm] = useState(blankPreset);
  const [presetDrawer, setPresetDrawer] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // ── Profile form state ──────────────────────────────────────
  const [prof, setProf] = useState({
    full_name: '',
    business_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Canada',
    tax_number: '',
    default_tax_rate: '13',
    currency: 'CAD',
    invoice_prefix: 'INV',
    quote_prefix: 'QUO',
  });

  // Populate form once profile loads
  useEffect(() => {
    if (!profile) return;
    setProf({
      full_name: profile.full_name ?? '',
      business_name: profile.business_name ?? '',
      email: profile.email ?? '',
      phone: profile.phone ?? '',
      address: profile.address ?? '',
      city: profile.city ?? '',
      country: profile.country ?? 'Canada',
      tax_number: profile.tax_number ?? '',
      default_tax_rate: String(profile.default_tax_rate ?? 13),
      currency: profile.currency ?? 'CAD',
      invoice_prefix: profile.invoice_prefix ?? 'INV',
      quote_prefix: profile.quote_prefix ?? 'QUO',
    });
  }, [profile]);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleProfChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setProf((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    const updates: Partial<Profile> = {
      full_name: prof.full_name || null,
      business_name: prof.business_name || null,
      email: prof.email || null,
      phone: prof.phone || null,
      address: prof.address || null,
      city: prof.city || null,
      country: prof.country || 'Canada',
      tax_number: prof.tax_number || null,
      default_tax_rate: parseFloat(prof.default_tax_rate) || 0,
      currency: prof.currency,
      invoice_prefix: prof.invoice_prefix || 'INV',
      quote_prefix: prof.quote_prefix || 'QUO',
    };
    updateProfile.mutate(updates, {
      onSuccess: () => showToast('Settings saved successfully.', 'success'),
      onError: (err) => showToast((err as Error).message, 'error'),
    });
  }

  function handlePresetChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPresetForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleCreatePreset(e: React.FormEvent) {
    e.preventDefault();
    if (!presetForm.name.trim()) return;
    createPreset.mutate(
      {
        profile_id: profile!.id,
        name: presetForm.name.trim(),
        description: presetForm.description.trim() || null,
        unit_price: parseFloat(presetForm.unit_price) || 0,
        unit_label: presetForm.unit_label.trim() || 'session',
      },
      {
        onSuccess: () => {
          setPresetForm(blankPreset);
          setPresetDrawer(false);
          showToast('Preset added.', 'success');
        },
        onError: (err) => showToast((err as Error).message, 'error'),
      }
    );
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  const deleteTarget = presets.find((p) => p.id === deletePresetId);

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
        activeId="settings"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-3">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-800 p-1 -ml-1"
            onClick={() => setSidebarOpen(true)}
          >
            <IcMenu />
          </button>
          <div>
            <h1 className="text-slate-800 text-base font-semibold leading-none">
              Settings
            </h1>
            <p className="text-slate-400 text-xs mt-1 hidden sm:block">
              Manage your profile and preferences
            </p>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-3xl w-full mx-auto space-y-6">
          {/* ── Business profile ─────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <SectionHeader
              title="Business profile"
              sub="This information appears on your invoices and quotes."
            />
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-slate-100 rounded-xl h-10"
                  />
                ))}
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Full name"
                    name="full_name"
                    value={prof.full_name}
                    onChange={handleProfChange}
                    placeholder="Emma Clarke"
                  />
                  <Field
                    label="Business name"
                    name="business_name"
                    value={prof.business_name}
                    onChange={handleProfChange}
                    placeholder="Emma Clarke Photography"
                  />
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={prof.email}
                    onChange={handleProfChange}
                    placeholder="emma@example.com"
                  />
                  <Field
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={prof.phone}
                    onChange={handleProfChange}
                    placeholder="+1 416 555 0100"
                  />
                  <Field
                    label="Address"
                    name="address"
                    value={prof.address}
                    onChange={handleProfChange}
                    placeholder="123 King St W"
                    className="sm:col-span-2"
                  />
                  <Field
                    label="City"
                    name="city"
                    value={prof.city}
                    onChange={handleProfChange}
                    placeholder="Toronto"
                  />
                  <Field
                    label="Country"
                    name="country"
                    value={prof.country}
                    onChange={handleProfChange}
                    placeholder="Canada"
                  />
                  <Field
                    label="Tax / GST number"
                    name="tax_number"
                    value={prof.tax_number}
                    onChange={handleProfChange}
                    placeholder="123456789RT0001"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3 mt-2">
                    Billing defaults
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={prof.currency}
                        onChange={handleProfChange}
                        className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                      >
                        <option value="CAD">CAD</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                        <option value="EUR">EUR</option>
                        <option value="AUD">AUD</option>
                      </select>
                    </div>
                    <Field
                      label="Default tax rate (%)"
                      name="default_tax_rate"
                      type="number"
                      value={prof.default_tax_rate}
                      onChange={handleProfChange}
                      placeholder="13"
                    />
                    <Field
                      label="Invoice prefix"
                      name="invoice_prefix"
                      value={prof.invoice_prefix}
                      onChange={handleProfChange}
                      placeholder="INV"
                      hint="e.g. INV → INV-001"
                    />
                    <Field
                      label="Quote prefix"
                      name="quote_prefix"
                      value={prof.quote_prefix}
                      onChange={handleProfChange}
                      placeholder="QUO"
                      hint="e.g. QUO → QUO-001"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 disabled:opacity-50 transition-all"
                  >
                    <IcSave />{' '}
                    {updateProfile.isPending ? 'Saving…' : 'Save profile'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── Pricing presets ───────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <SectionHeader
                title="Pricing presets"
                sub="Reusable line items to populate invoices and quotes quickly."
              />
              <button
                onClick={() => {
                  setPresetForm(blankPreset);
                  setPresetDrawer(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:border-sky-300 hover:text-sky-600 transition-all shrink-0"
              >
                <IcPlus s={12} /> Add preset
              </button>
            </div>

            {presets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-slate-400 text-sm">No presets yet.</p>
                <p className="text-slate-400 text-xs mt-1">
                  Add your common services like "Full-day shoot" or "Album
                  design".
                </p>
              </div>
            ) : (
              <div>
                {presets.map((p) => (
                  <PresetRow
                    key={p.id}
                    preset={p}
                    onDelete={() => setDeletePresetId(p.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Account ───────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <SectionHeader title="Account" sub="Manage your session." />
            <button
              onClick={handleSignOut}
              className="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-all"
            >
              Sign out
            </button>
          </div>
        </main>
      </div>

      <BottomNav activeId="settings" />

      {/* ── Add preset drawer ──────────────────────────────── */}
      {presetDrawer && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            onClick={() => setPresetDrawer(false)}
          />
          <aside className="fixed top-0 right-0 h-full w-full max-w-sm bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-slate-800 text-base font-semibold">
                Add pricing preset
              </h2>
              <button
                onClick={() => setPresetDrawer(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <IcX />
              </button>
            </div>
            <form
              onSubmit={handleCreatePreset}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
            >
              <Field
                label="Name"
                name="name"
                value={presetForm.name}
                onChange={handlePresetChange}
                required
                placeholder="Full-day wedding coverage"
              />
              <Field
                label="Description"
                name="description"
                value={presetForm.description}
                onChange={handlePresetChange}
                placeholder="8 hours, 600 edited images"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Unit price ($)"
                  name="unit_price"
                  type="number"
                  value={presetForm.unit_price}
                  onChange={handlePresetChange}
                  placeholder="3200"
                />
                <Field
                  label="Unit label"
                  name="unit_label"
                  value={presetForm.unit_label}
                  onChange={handlePresetChange}
                  placeholder="session"
                  hint="e.g. hour, day, image"
                />
              </div>
            </form>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={() => setPresetDrawer(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={
                  handleCreatePreset as unknown as React.MouseEventHandler
                }
                disabled={createPreset.isPending || !presetForm.name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 disabled:opacity-50 transition-all"
              >
                {createPreset.isPending ? 'Adding…' : 'Add preset'}
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ── Delete preset modal ────────────────────────────── */}
      {deletePresetId && deleteTarget && (
        <DeleteModal
          title={`Delete "${deleteTarget.name}"?`}
          message="This preset will be removed. Existing line items using it won't be affected."
          onConfirm={() =>
            deletePreset.mutate(deletePresetId, {
              onSuccess: () => {
                setDeletePresetId(null);
                showToast('Preset deleted.', 'success');
              },
            })
          }
          onCancel={() => setDeletePresetId(null)}
          isPending={deletePreset.isPending}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
