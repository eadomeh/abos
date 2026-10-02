import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import { supabase } from '@/lib/supabase';
import { Plus, RefreshCw, Target, Trash2, X, UserRound, Phone, Mail, ArrowRight, CircleDollarSign, CalendarDays, Users } from 'lucide-react';
import type { LeadStatus } from '@/types/database';

type LeadRow = {
  id: string; customer_id: string | null; name: string; phone: string | null; email: string | null; source: string;
  status: LeadStatus; score: number; estimated_value: number | string; notes: string | null; created_at: string;
};

const statuses: LeadStatus[] = ['new','contacted','qualified','won','lost'];

export default function LeadsPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { activeBusiness } = useBusiness();
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'manual', estimated_value: '', score: '0', notes: '' });
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [converting, setConverting] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true); setError(null);
    const res = await supabase.from('leads').select('id,customer_id,name,phone,email,source,status,score,estimated_value,notes,created_at').eq('business_id', activeBusiness.id).order('created_at', { ascending: false });
    if (res.error) setError(res.error.message);
    else setLeads((res.data ?? []) as LeadRow[]);
    setLoading(false);
  }, [activeBusiness]);

  useEffect(() => { void load(); }, [load]);

  const convertToCustomer = async () => {
    if (!selectedLead) return;

    setConverting(true);
    setDetailError(null);

    const { data, error } = await supabase.rpc('convert_lead_to_customer', {
      p_lead_id: selectedLead.id,
    });

    if (error || !data?.ok) {
      setDetailError(error?.message ?? 'Could not convert this lead to a customer.');
      setConverting(false);
      return;
    }

    const customerId = String(data.customer_id);

    setLeads((current) =>
      current.map((lead) =>
        lead.id === selectedLead.id
          ? { ...lead, customer_id: customerId, status: 'won' }
          : lead
      )
    );

    setSelectedLead((current) =>
      current ? { ...current, customer_id: customerId, status: 'won' } : current
    );

    setConverting(false);
  };

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
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div><p className="text-xs uppercase tracking-[0.2em] text-emerald-400 mb-2">CRM</p><h1 className="text-2xl font-bold text-white">Leads</h1><p className="text-sm text-slate-500 mt-1">Track enquiries, qualification and pipeline value.</p></div>
        <div className="flex flex-wrap gap-2"><button onClick={() => void load()} className="p-2.5 rounded-xl glass text-slate-400 hover:text-white"><RefreshCw className="w-4 h-4" /></button><button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold"><Plus className="w-4 h-4" /> New lead</button></div>
      </div>
      {error && <div className="mb-5 text-sm text-red-300 bg-red-500/5 border border-red-500/20 rounded-xl p-3">{error}</div>}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? <div className="py-20 text-center text-sm text-slate-600">Loading leads…</div> :
        leads.length === 0 ? <div className="py-20 text-center"><Target className="w-8 h-8 text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-500">No leads yet.</p><p className="text-xs text-slate-700 mt-1">Create the first lead from a WhatsApp enquiry, website visitor or manual entry.</p></div> :
        <div className="divide-y divide-white/[0.05]">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="p-4 md:p-5 flex flex-col lg:flex-row lg:items-center gap-4"
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedLead(lead);
                  setDetailError(null);
                }}
                className="flex items-center gap-3 min-w-0 flex-1 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-semibold flex-shrink-0">
                  {lead.name[0]?.toUpperCase() ?? 'L'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{lead.name}</p>
                  <p className="text-xs text-slate-600 truncate">{lead.phone ?? lead.email ?? 'No contact details'}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-700 flex-shrink-0" />
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-1 rounded-lg bg-white/[0.05] text-[10px] text-slate-400 capitalize">{lead.source}</span>
                <span className="px-2 py-1 rounded-lg bg-white/[0.05] text-[10px] text-slate-400">Score {lead.score}</span>
                <span className="text-sm font-semibold text-emerald-400">{money(lead.estimated_value)}</span>
                {lead.customer_id && (
                  <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-[10px] text-emerald-400">
                    Customer linked
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={lead.status}
                  onChange={(e) => void updateStatus(lead, e.target.value as LeadStatus)}
                  className="bg-slate-900/80 border border-white/[0.08] rounded-lg px-2.5 py-2 text-xs text-slate-300"
                >
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                {activeBusiness?.role === 'owner' && (
                  <button
                    onClick={() => void remove(lead)}
                    className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/5"
                    title="Delete lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>}
      </div>

      {selectedLead && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md p-3 md:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-semibold flex-shrink-0">
                  {selectedLead.name[0]?.toUpperCase() ?? 'L'}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-400">Lead 360</p>
                  <h2 className="text-lg font-semibold text-white truncate">{selectedLead.name}</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="p-2 text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 md:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="glass rounded-2xl p-4">
                  <Target className="w-4 h-4 text-emerald-400 mb-3" />
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">Score</p>
                  <p className="text-lg font-semibold text-white mt-1">{selectedLead.score}/100</p>
                </div>
                <div className="glass rounded-2xl p-4">
                  <CircleDollarSign className="w-4 h-4 text-emerald-400 mb-3" />
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">Estimated value</p>
                  <p className="text-lg font-semibold text-white mt-1">{money(selectedLead.estimated_value)}</p>
                </div>
                <div className="glass rounded-2xl p-4">
                  <CalendarDays className="w-4 h-4 text-emerald-400 mb-3" />
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">Created</p>
                  <p className="text-sm font-semibold text-white mt-2">
                    {new Date(selectedLead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="glass rounded-2xl p-4 md:p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Opportunity</p>
                    <p className="text-xs text-slate-600 mt-1">Qualification and contact context</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] text-xs text-slate-300 capitalize">{selectedLead.status}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/[0.025] border border-white/[0.05] p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-[10px] uppercase tracking-wider text-slate-600">Phone</span>
                    </div>
                    <p className="text-sm text-slate-300 break-words">{selectedLead.phone ?? 'Not provided'}</p>
                  </div>

                  <div className="rounded-xl bg-white/[0.025] border border-white/[0.05] p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-[10px] uppercase tracking-wider text-slate-600">Email</span>
                    </div>
                    <p className="text-sm text-slate-300 break-words">{selectedLead.email ?? 'Not provided'}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-white/[0.025] border border-white/[0.05] p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-[10px] uppercase tracking-wider text-slate-600">Source</span>
                  </div>
                  <p className="text-sm text-slate-300 capitalize">{selectedLead.source}</p>
                </div>

                {selectedLead.notes && (
                  <div className="mt-3 rounded-xl bg-white/[0.025] border border-white/[0.05] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">Notes</p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap break-words">{selectedLead.notes}</p>
                  </div>
                )}
              </div>

              <div className="glass rounded-2xl p-4 md:p-5">
                <div className="flex items-center gap-3 mb-4">
                  <UserRound className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">Customer connection</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {selectedLead.customer_id ? 'This lead is already connected to a customer.' : 'Convert this opportunity into a real customer relationship.'}
                    </p>
                  </div>
                </div>

                {selectedLead.customer_id ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3">
                      <p className="text-xs text-emerald-300">Customer linked</p>
                      <p className="text-sm text-white mt-1">Customer ID: {selectedLead.customer_id.slice(0, 8)}…</p>
                    </div>
                    {onNavigate && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLead(null);
                          onNavigate('customers');
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-slate-300 hover:text-white"
                      >
                        Open Customers <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={converting}
                    onClick={() => void convertToCustomer()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold disabled:opacity-50"
                  >
                    {converting ? 'Converting…' : 'Convert to Customer'} <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {detailError && (
                  <div className="mt-3 text-sm text-red-300 bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                    {detailError}
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white"
                >
                  Close
                </button>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLead(null);
                      onNavigate('customers');
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-slate-300 hover:text-white"
                  >
                    Customer Workspace
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
