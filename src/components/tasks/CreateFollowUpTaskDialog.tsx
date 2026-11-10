import { FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { TaskPriority } from '@/types/database';

const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

export type FollowUpLink =
  | { kind: 'customer'; customerId: string; customerName: string }
  | { kind: 'lead'; leadId: string; leadName: string; customerId: string | null };

type Props = {
  businessId: string;
  link: FollowUpLink;
  onClose: () => void;
  onCreated: () => void;
};

export function CreateFollowUpTaskDialog({ businessId, link, onClose, onCreated }: Props) {
  const [title, setTitle] = useState(
    link.kind === 'customer' ? `Follow up with ${link.customerName}` : `Follow up with ${link.leadName}`,
  );
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueAt, setDueAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const subject = link.kind === 'customer' ? link.customerName : link.leadName;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || success) return;
    setSaving(true);
    setError(null);

    let relatedCustomerId: string | null = link.kind === 'customer' ? link.customerId : null;
    const relatedLeadId = link.kind === 'lead' ? link.leadId : null;

    if (link.kind === 'customer') {
      const check = await supabase
        .from('customers')
        .select('id')
        .eq('id', link.customerId)
        .eq('business_id', businessId)
        .maybeSingle();
      if (check.error || !check.data) {
        setError(check.error?.message ?? 'That customer is not in this business.');
        setSaving(false);
        return;
      }
      relatedCustomerId = check.data.id;
    }

    if (link.kind === 'lead') {
      const leadCheck = await supabase
        .from('leads')
        .select('id,customer_id')
        .eq('id', link.leadId)
        .eq('business_id', businessId)
        .maybeSingle();
      if (leadCheck.error || !leadCheck.data) {
        setError(leadCheck.error?.message ?? 'That lead is not in this business.');
        setSaving(false);
        return;
      }
      if (leadCheck.data.customer_id) {
        const customerCheck = await supabase
          .from('customers')
          .select('id')
          .eq('id', leadCheck.data.customer_id)
          .eq('business_id', businessId)
          .maybeSingle();
        if (customerCheck.data) relatedCustomerId = customerCheck.data.id;
      }
    }

    const result = await supabase.from('tasks').insert({
      business_id: businessId,
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
      related_customer_id: relatedCustomerId,
      related_lead_id: relatedLeadId,
    }).select('id').single();

    if (result.error || !result.data) {
      setError(result.error?.message ?? 'Could not create the follow-up.');
      setSaving(false);
      return;
    }

    await supabase.from('activity_events').insert({
      business_id: businessId,
      event_type: 'task_created',
      entity_type: 'task',
      entity_id: result.data.id,
      payload: { title: title.trim(), priority, source: link.kind },
    });

    setSuccess(`Follow-up created for ${subject}.`);
    setSaving(false);
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
      <form onSubmit={(event) => void submit(event)} className="w-full max-w-lg bg-slate-950 border border-white/[0.08] rounded-2xl p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">Create follow-up</h2>
            <p className="text-xs text-slate-500 mt-1 break-words">For {subject}. This stays in the Tasks queue.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-500" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        {error && <div className="mb-3 text-sm text-red-300 bg-red-500/5 border border-red-500/20 rounded-xl p-3">{error}</div>}
        {success && <div className="mb-3 text-sm text-emerald-300 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">{success}</div>}
        <div className="space-y-3">
          <input required disabled={!!success} placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white placeholder:text-slate-700 outline-none disabled:opacity-60" />
          <textarea rows={3} disabled={!!success} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white placeholder:text-slate-700 outline-none resize-none disabled:opacity-60" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select disabled={!!success} value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="bg-slate-900/80 border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-slate-300">
              {priorities.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <input type="datetime-local" disabled={!!success} value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-slate-300 outline-none disabled:opacity-60" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm text-slate-400">{success ? 'Done' : 'Cancel'}</button>
          {!success && <button disabled={saving} className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50">{saving ? 'Saving…' : 'Create follow-up'}</button>}
        </div>
      </form>
    </div>
  );
}
