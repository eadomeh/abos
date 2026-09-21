import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import { supabase } from '@/lib/supabase';
import { Plus, RefreshCw, Target, Trash2, X } from 'lucide-react';
import type { LeadStatus } from '@/types/database';

type LeadRow = {
  id: string; name: string; phone: string | null; email: string | null; source: string;
  status: LeadStatus; score: number; estimated_value: number | string; notes: string | null; created_at: string;
};

const statuses: LeadStatus[] = ['new','contacted','qualified','won','lost'];

export default function LeadsPage() {
  const { activeBusiness } = useBusiness();
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'manual', estimated_value: '', score: '0', notes: '' });

  const load = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true); setError(null);
    const res = await supabase.from('leads').select('id,name,phone,email,source,status,score,estimated_value,notes,created_at').eq('business_id', activeBusiness.id).order('created_at', { ascending: false });
    if (res.error) setError(res.error.message);
    else setLeads((res.data ?? []) as LeadRow[]);
    setLoading(false);
  }, [activeBusiness]);

  useEffect(() => { void load(); }, [load]);

  const createLead = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeBusiness || !form.name.trim()) return;
    setSaving(true); setError(null);
    const result = await supabase.from('leads').insert({
      business_id: activeBusiness.id, name: form.name.trim(), phone: form.phone.trim() || null,
      email: form.email.trim() || null, source: form.source, estimated_value: Number(form.estimated_value || 0),
      score: Number(form.score || 0), notes: form.notes.trim() || null,
    }).select('id').single();
    if (result.error) setError(result.error.message);
    else {
      await supabase.from('activity_events').insert({
        business_id: activeBusiness.id, event_type: 'lead_created', entity_type: 'lead', entity_id: result.data.id,
        payload: { name: form.name.trim(), source: form.source },
      });
      setForm({ name: '', phone: '', email: '', source: 'manual', estimated_value: '', score: '0', notes: '' });
      setShowForm(false);
      await load();
    }
    setSaving(false);
  };

  const updateStatus = async (lead: LeadRow, status: LeadStatus) => {
    const result = await supabase.from('leads').update({ status }).eq('id', lead.id).eq('business_id', activeBusiness?.id);
    if (result.error) setError(result.error.message);
    else {
      if (activeBusiness) await supabase.from('activity_events').insert({ business_id: activeBusiness.id, event_type: 'lead_status_changed', entity_type: 'lead', entity_id: lead.id, payload: { from: lead.status, to: status } });
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status } : item));
    }
  };

  const remove = async (lead: LeadRow) => {
    if (activeBusiness?.role !== 'owner') return;
    const result = await supabase.from('leads').delete().eq('id', lead.id).eq('business_id', activeBusiness.id);
    if (result.error) setError(result.error.message);
    else setLeads((current) => current.filter((item) => item.id !== lead.id));
  };

  const money = (value: number | string) => `${activeBusiness?.currency ?? 'NGN'} ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div><p className="text-xs uppercase tracking-[0.2em] text-emerald-400 mb-2">CRM</p><h1 className="text-2xl font-bold text-white">Leads</h1><p className="text-sm text-slate-500 mt-1">Track enquiries, qualification and pipeline value.</p></div>
        <div className="flex gap-2"><button onClick={() => void load()} className="p-2.5 rounded-xl glass text-slate-400 hover:text-white"><RefreshCw className="w-4 h-4" /></button><button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold"><Plus className="w-4 h-4" /> New lead</button></div>
      </div>
      {error && <div className="mb-5 text-sm text-red-300 bg-red-500/5 border border-red-500/20 rounded-xl p-3">{error}</div>}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? <div className="py-20 text-center text-sm text-slate-600">Loading leads…</div> :
        leads.length === 0 ? <div className="py-20 text-center"><Target className="w-8 h-8 text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-500">No leads yet.</p><p className="text-xs text-slate-700 mt-1">Create the first lead from a WhatsApp enquiry, website visitor or manual entry.</p></div> :
        <div className="divide-y divide-white/[0.05]">
          {leads.map((lead) => (
            <div key={lead.id} className="p-4 md:p-5 flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-semibold">{lead.name[0]?.toUpperCase() ?? 'L'}</div>
                <div className="min-w-0"><p className="text-sm font-semibold text-white truncate">{lead.name}</p><p className="text-xs text-slate-600 truncate">{lead.phone ?? lead.email ?? 'No contact details'}</p></div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-1 rounded-lg bg-white/[0.05] text-[10px] text-slate-400 capitalize">{lead.source}</span>
                <span className="px-2 py-1 rounded-lg bg-white/[0.05] text-[10px] text-slate-400">Score {lead.score}</span>
                <span className="text-sm font-semibold text-emerald-400">{money(lead.estimated_value)}</span>
              </div>
              <div className="flex items-center gap-2">
                <select value={lead.status} onChange={(e) => void updateStatus(lead, e.target.value as LeadStatus)} className="bg-slate-900/80 border border-white/[0.08] rounded-lg px-2.5 py-2 text-xs text-slate-300">
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                {activeBusiness?.role === 'owner' && <button onClick={() => void remove(lead)} className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/5"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </div>
          ))}
        </div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
          <form onSubmit={createLead} className="w-full max-w-lg bg-slate-950 border border-white/[0.08] rounded-2xl p-5 md:p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5"><div><h2 className="text-lg font-semibold text-white">Create lead</h2><p className="text-xs text-slate-600 mt-1">Put the opportunity into your pipeline.</p></div><button type="button" onClick={() => setShowForm(false)} className="p-2 text-slate-500"><X className="w-4 h-4" /></button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="sm:col-span-2 w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white placeholder:text-slate-700 outline-none" />
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white placeholder:text-slate-700 outline-none" />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white placeholder:text-slate-700 outline-none" />
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full bg-slate-900/80 border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-slate-300"><option value="manual">Manual</option><option value="whatsapp">WhatsApp</option><option value="web">Web</option><option value="referral">Referral</option><option value="other">Other</option></select>
              <input type="number" min="0" placeholder="Estimated value" value={form.estimated_value} onChange={(e) => setForm({ ...form, estimated_value: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white placeholder:text-slate-700 outline-none" />
              <input type="number" min="0" max="100" placeholder="Lead score (0-100)" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white placeholder:text-slate-700 outline-none" />
              <textarea rows={4} placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="sm:col-span-2 w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white placeholder:text-slate-700 outline-none resize-none" />
            </div>
            <div className="flex justify-end gap-2 mt-5"><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-400">Cancel</button><button disabled={saving} className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50">{saving ? 'Saving…' : 'Create lead'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
