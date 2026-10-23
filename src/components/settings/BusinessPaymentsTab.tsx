import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Landmark, Loader2, Save, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type PaymentSettings = {
  bank_transfer_enabled: boolean;
  bank_name: string;
  account_name: string;
  account_number: string;
  customer_instructions: string;
};

const EMPTY_SETTINGS: PaymentSettings = {
  bank_transfer_enabled: false,
  bank_name: '',
  account_name: '',
  account_number: '',
  customer_instructions: '',
};

const fieldClass = 'w-full min-w-0 rounded-xl border border-white/[0.09] bg-slate-950/50 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-60';
const labelClass = 'block text-xs font-medium text-slate-300 mb-1.5';

export default function BusinessPaymentsTab({ businessId, userId, canEdit }: {
  businessId: string;
  userId: string;
  canEdit: boolean;
}) {
  const [settings, setSettings] = useState<PaymentSettings>(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: loadError } = await supabase
      .from('business_payment_settings')
      .select('bank_transfer_enabled,bank_name,account_name,account_number,customer_instructions')
      .eq('business_id', businessId)
      .maybeSingle();
    if (loadError) {
      setError('Payment settings could not be loaded. Retry, and contact support if the problem continues.');
    } else if (data) {
      setSettings({
        bank_transfer_enabled: data.bank_transfer_enabled === true,
        bank_name: data.bank_name ?? '',
        account_name: data.account_name ?? '',
        account_number: data.account_number ?? '',
        customer_instructions: data.customer_instructions ?? '',
      });
    } else {
      setSettings(EMPTY_SETTINGS);
    }
    setLoading(false);
  }, [businessId]);

  useEffect(() => { void load(); }, [load]);

  const change = <K extends keyof PaymentSettings>(key: K, value: PaymentSettings[K]) => {
    setSaved(false);
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const previewReady = settings.bank_transfer_enabled &&
    settings.bank_name.trim().length > 0 && settings.account_name.trim().length > 0 &&
    /^[A-Za-z0-9][A-Za-z0-9 -]{4,32}[A-Za-z0-9]$/.test(settings.account_number.trim());

  const preview = previewReady ? [
    'Bank transfer',
    `Bank name: ${settings.bank_name.trim()}`,
    `Account name: ${settings.account_name.trim()}`,
    `Account number: ${settings.account_number.trim()}`,
    'Transfer reference: use your order number.',
    settings.customer_instructions.trim(),
    'Important: your payment remains pending until our team independently confirms receipt of the funds.',
  ].filter(Boolean).join('\n') : '';

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    if (!canEdit) {
      setError('Only the business owner can change payment details.');
      return;
    }
    const bankName = settings.bank_name.trim();
    const accountName = settings.account_name.trim();
    const accountNumber = settings.account_number.trim();
    const instructions = settings.customer_instructions.trim();
    if (settings.bank_transfer_enabled) {
      if (!bankName || !accountName) {
        setError('Bank name and account name are required when bank transfer is enabled.');
        return;
      }
      if (!/^[A-Za-z0-9][A-Za-z0-9 -]{4,32}[A-Za-z0-9]$/.test(accountNumber)) {
        setError('Enter an account number with 6–34 letters, numbers, spaces, or hyphens.');
        return;
      }
    }
    if (instructions.length > 1000) {
      setError('Customer instructions must be 1,000 characters or fewer.');
      return;
    }

    setSaving(true);
    try {
      const { error: saveError } = await supabase.from('business_payment_settings').upsert({
        business_id: businessId,
        bank_transfer_enabled: settings.bank_transfer_enabled,
        bank_name: bankName || null,
        account_name: accountName || null,
        account_number: accountNumber || null,
        customer_instructions: instructions || null,
        updated_by: userId || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'business_id' });
      if (saveError) throw saveError;
      setSettings((current) => ({ ...current, bank_name: bankName, account_name: accountName, account_number: accountNumber, customer_instructions: instructions }));
      setSaved(true);
    } catch {
      setError('Payment settings were not saved. Check the fields and connection, then retry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="glass rounded-2xl border border-white/[0.07] p-4 sm:p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-300 flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white">Payments & bank details</h3>
            <p className="text-sm leading-relaxed text-slate-400 mt-1">Configure the exact bank-transfer information ABOS may share for this business. Details are restricted to this business and owner-controlled.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading payment settings…</div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <label className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 cursor-pointer">
              <input type="checkbox" className="mt-0.5 accent-emerald-400" checked={settings.bank_transfer_enabled} disabled={!canEdit || saving} onChange={(e) => change('bank_transfer_enabled', e.target.checked)} />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-white">Accept manual bank transfers</span>
                <span className="block text-xs leading-relaxed text-slate-400 mt-1">When enabled and configured, ABOS can give customers these business-specific instructions. It will never mark a transfer paid automatically.</span>
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelClass} htmlFor="pay-bank-name">Bank name</label><input id="pay-bank-name" className={fieldClass} value={settings.bank_name} maxLength={100} autoComplete="off" placeholder="e.g. GTBank" disabled={!canEdit || saving} onChange={(e) => change('bank_name', e.target.value)} /></div>
              <div><label className={labelClass} htmlFor="pay-account-name">Account name / beneficiary</label><input id="pay-account-name" className={fieldClass} value={settings.account_name} maxLength={140} autoComplete="off" placeholder="Name on the receiving account" disabled={!canEdit || saving} onChange={(e) => change('account_name', e.target.value)} /></div>
              <div className="sm:col-span-2"><label className={labelClass} htmlFor="pay-account-number">Account number</label><input id="pay-account-number" className={fieldClass} value={settings.account_number} maxLength={34} inputMode="text" autoComplete="off" spellCheck={false} placeholder="Receiving account number" disabled={!canEdit || saving} onChange={(e) => change('account_number', e.target.value)} /><p className="text-[11px] leading-relaxed text-slate-500 mt-1.5">Only enter the account number customers should use to pay this business. Never enter a PIN, OTP, password, or online-banking login.</p></div>
              <div className="sm:col-span-2"><label className={labelClass} htmlFor="pay-extra-instructions">Extra customer instructions (optional)</label><textarea id="pay-extra-instructions" className={fieldClass + ' min-h-24 resize-y'} value={settings.customer_instructions} maxLength={1000} placeholder="For example, include your order number in the transfer narration." disabled={!canEdit || saving} onChange={(e) => change('customer_instructions', e.target.value)} /></div>
            </div>

            {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-sm text-red-200"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}</div>}
            {saved && <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3 text-sm text-emerald-200"><CheckCircle2 className="w-4 h-4 shrink-0" />Saved. Reload this section to confirm the settings persist.</div>}

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button type="button" onClick={() => void load()} disabled={saving || loading} className="px-4 py-2.5 rounded-xl border border-white/[0.09] text-sm text-slate-300 hover:bg-white/[0.04] disabled:opacity-50">Reload saved settings</button>
              {canEdit && <button type="submit" disabled={saving || loading} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? 'Saving…' : 'Save payment settings'}</button>}
            </div>
          </form>
        )}
      </section>

      <section className="glass rounded-2xl border border-white/[0.07] p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3"><ShieldCheck className="w-4 h-4 text-emerald-300" /><h3 className="text-sm font-semibold text-white">Customer instruction preview</h3></div>
        <p className="text-xs leading-relaxed text-slate-400 mb-3">This preview shows the bank details and verification warning used for the customer-facing bank-transfer reply.</p>
        {preview ? <pre className="whitespace-pre-wrap break-words rounded-xl border border-white/[0.07] bg-slate-950/45 p-4 text-sm leading-relaxed text-slate-200 font-sans">{preview}</pre> : <p className="rounded-xl border border-dashed border-white/[0.1] p-4 text-sm text-slate-500">Enable bank transfer and complete valid bank details to preview the instructions.</p>}
        <p className="text-[11px] leading-relaxed text-slate-500 mt-3">Currency displayed with an order comes from that order. This screen does not initiate a payment or connect to a bank.</p>
      </section>
    </div>
  );
}
