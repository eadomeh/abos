import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { BookOpen, Loader2, Plus } from 'lucide-react';

type BusinessKnowledgeEntry = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  active: boolean;
  updated_at: string;
};

export default function BusinessKnowledgeTab({ businessId, userId, canEdit }: {
  businessId: string;
  userId: string;
  canEdit: boolean;
}) {
  const [entries, setEntries] = useState<BusinessKnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [content, setContent] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: loadError } = await supabase
      .from('business_knowledge')
      .select('id,title,content,category,active,updated_at')
      .eq('business_id', businessId)
      .order('updated_at', { ascending: false });
    if (loadError) {
      setError(`Could not load business knowledge: ${loadError.message}`);
      setEntries([]);
    } else {
      setEntries((data ?? []) as BusinessKnowledgeEntry[]);
    }
    setLoading(false);
  }, [businessId]);

  useEffect(() => { void loadEntries(); }, [loadEntries]);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('general');
    setContent('');
    setActive(true);
    setError(null);
    setNotice(null);
  };

  const beginEdit = (entry: BusinessKnowledgeEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setCategory(entry.category ?? 'general');
    setContent(entry.content);
    setActive(entry.active);
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canEdit) return;
    const cleanTitle = title.trim();
    const cleanCategory = category.trim() || 'general';
    const cleanContent = content.trim();
    if (!cleanTitle || cleanTitle.length > 120) {
      setError('Enter a title between 1 and 120 characters.');
      return;
    }
    if (cleanCategory.length > 80) {
      setError('Category must be 80 characters or fewer.');
      return;
    }
    if (!cleanContent || cleanContent.length > 8000) {
      setError('Knowledge content must be between 1 and 8,000 characters.');
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    const values = { title: cleanTitle, category: cleanCategory, content: cleanContent, active, updated_at: new Date().toISOString() };
    try {
      if (editingId) {
        const { data, error: updateError } = await supabase
          .from('business_knowledge')
          .update(values)
          .eq('id', editingId)
          .eq('business_id', businessId)
          .select('id')
          .maybeSingle();
        if (updateError) throw updateError;
        if (!data) throw new Error('No entry was updated. Confirm your business permissions and try again.');
        setNotice('Knowledge entry updated.');
      } else {
        const { error: insertError } = await supabase
          .from('business_knowledge')
          .insert({ ...values, business_id: businessId, created_by: userId || null });
        if (insertError) throw insertError;
        setNotice('Knowledge entry added.');
      }
      setEditingId(null);
      setTitle('');
      setCategory('general');
      setContent('');
      setActive(true);
      await loadEntries();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this knowledge entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="glass rounded-2xl p-6 space-y-2">
        <h3 className="text-sm font-semibold text-white">Business Knowledge</h3>
        <p className="text-xs leading-relaxed text-slate-500">Store verified answers, policies, product guidance, opening hours, delivery information, and other facts your AI agent is allowed to use. Only active entries are available to the AI.</p>
        {!canEdit && <p className="text-xs text-slate-400">Read-only access. Ask a business owner or admin to make changes.</p>}
      </section>

      {canEdit && (
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">{editingId ? 'Edit knowledge entry' : 'Add knowledge entry'}</h3>
              <p className="text-xs text-slate-500 mt-1">Keep entries factual and specific. Never store bank credentials, PINs, or OTPs here.</p>
            </div>
            {editingId && <button type="button" onClick={resetForm} className="text-xs text-slate-400 hover:text-white">Cancel edit</button>}
          </div>
          <div>
            <label htmlFor="knowledge-title" className="block text-xs font-medium text-slate-400 mb-1.5">Title</label>
            <input id="knowledge-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required placeholder="e.g. Delivery within Lagos" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label htmlFor="knowledge-category" className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
            <input id="knowledge-category" value={category} onChange={(e) => setCategory(e.target.value)} maxLength={80} placeholder="general, delivery, returns, products" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label htmlFor="knowledge-content" className="block text-xs font-medium text-slate-400 mb-1.5">Verified answer or business rule</label>
            <textarea id="knowledge-content" value={content} onChange={(e) => setContent(e.target.value)} maxLength={8000} required rows={5} placeholder="Write only information confirmed by your business." className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 resize-y" />
            <p className="text-[11px] text-slate-600 mt-1">{content.length.toLocaleString()} / 8,000 characters</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-emerald-500" /> Active — the AI may use this entry</label>
          {error && <div role="alert" className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-300">{error}</div>}
          {notice && <div role="status" className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300">{notice}</div>}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-medium rounded-xl disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add knowledge'}
            </button>
            {!editingId && <span className="text-[11px] text-slate-600">Edits are scoped to this business and subject to server-side RLS.</span>}
          </div>
        </form>
      )}

      <section className="glass rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-white">Saved entries</h3><span className="text-xs text-slate-500">{entries.length} total</span></div>
        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /><span className="ml-2 text-xs text-slate-500">Loading knowledge…</span></div>
        ) : error && entries.length === 0 ? (
          <p className="text-sm text-red-300">{error}</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-8"><BookOpen className="w-7 h-7 mx-auto mb-2 text-slate-600" /><p className="text-sm text-slate-300">No knowledge entries yet.</p><p className="text-xs text-slate-500 mt-1">{canEdit ? 'Add your first verified business answer above.' : 'No knowledge entries have been added to this business yet.'}</p></div>
        ) : entries.map((entry) => (
          <article key={entry.id} className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h4 className="text-sm font-medium text-white break-words">{entry.title}</h4><span className={`text-[10px] px-2 py-1 rounded-md ${entry.active ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-500/10 text-slate-400'}`}>{entry.active ? 'Active' : 'Inactive'}</span></div><p className="text-[11px] text-slate-500 mt-1">{entry.category || 'general'} · Updated {new Date(entry.updated_at).toLocaleDateString()}</p></div>
              {canEdit && <button type="button" onClick={() => beginEdit(entry)} className="shrink-0 px-3 py-2 rounded-lg border border-white/[0.08] text-xs text-slate-300 hover:bg-white/[0.05]">Edit</button>}
            </div>
            <p className="text-sm text-slate-400 whitespace-pre-wrap break-words">{entry.content}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
