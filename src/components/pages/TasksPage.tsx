import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import { supabase } from '@/lib/supabase';
import { CalendarClock, CheckCircle2, Circle, Plus, RefreshCw, Trash2, X, Zap } from 'lucide-react';
import type { TaskPriority, TaskStatus } from '@/types/database';

type TaskRow = { id: string; title: string; description: string | null; status: TaskStatus; priority: TaskPriority; due_at: string | null; created_at: string };

const priorities: TaskPriority[] = ['low','medium','high','urgent'];

export default function TasksPage() {
  const { activeBusiness } = useBusiness();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as TaskPriority, due_at: '' });

  const load = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true); setError(null);
    const res = await supabase.from('tasks').select('id,title,description,status,priority,due_at,created_at').eq('business_id', activeBusiness.id).order('status', { ascending: true }).order('due_at', { ascending: true, nullsFirst: false });
    if (res.error) setError(res.error.message);
    else setTasks((res.data ?? []) as TaskRow[]);
    setLoading(false);
  }, [activeBusiness]);

  useEffect(() => { void load(); }, [load]);

  const createTask = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeBusiness || !form.title.trim()) return;
    setSaving(true); setError(null);
    const result = await supabase.from('tasks').insert({
      business_id: activeBusiness.id, title: form.title.trim(), description: form.description.trim() || null,
      priority: form.priority, due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
    }).select('id').single();
    if (result.error) setError(result.error.message);
    else {
      await supabase.from('activity_events').insert({ business_id: activeBusiness.id, event_type: 'task_created', entity_type: 'task', entity_id: result.data.id, payload: { title: form.title.trim(), priority: form.priority } });
      setForm({ title: '', description: '', priority: 'medium', due_at: '' }); setShowForm(false); await load();
    }
    setSaving(false);
  };

  const toggleDone = async (task: TaskRow) => {
    if (!activeBusiness) return;
    const next: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    const result = await supabase.from('tasks').update({ status: next, completed_at: next === 'done' ? new Date().toISOString() : null }).eq('id', task.id).eq('business_id', activeBusiness.id);
    if (result.error) setError(result.error.message);
    else {
      await supabase.from('activity_events').insert({ business_id: activeBusiness.id, event_type: next === 'done' ? 'task_completed' : 'task_reopened', entity_type: 'task', entity_id: task.id, payload: { title: task.title } });
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: next } : item));
    }
  };

  const setStatus = async (task: TaskRow, status: TaskStatus) => {
    if (!activeBusiness) return;
    const result = await supabase.from('tasks').update({ status, completed_at: status === 'done' ? new Date().toISOString() : null }).eq('id', task.id).eq('business_id', activeBusiness.id);
    if (result.error) setError(result.error.message);
    else setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status } : item));
  };

  const remove = async (task: TaskRow) => {
    if (activeBusiness?.role !== 'owner') return;
    const result = await supabase.from('tasks').delete().eq('id', task.id).eq('business_id', activeBusiness.id);
    if (result.error) setError(result.error.message);
    else setTasks((current) => current.filter((item) => item.id !== task.id));
  };

  const dueLabel = (date: string | null) => {
    if (!date) return 'No due date';
    const value = new Date(date);
    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(value); due.setHours(0,0,0,0);
    const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Due tomorrow';
    return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const priorityClass: Record<TaskPriority, string> = {
    low: 'text-slate-500 bg-white/[0.04]', medium: 'text-blue-400 bg-blue-500/10',
    high: 'text-amber-400 bg-amber-500/10', urgent: 'text-red-400 bg-red-500/10',
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div><p className="text-xs uppercase tracking-[0.2em] text-emerald-400 mb-2">Execution</p><h1 className="text-2xl font-bold text-white">Tasks</h1><p className="text-sm text-slate-500 mt-1">Turn customer work and operational follow-ups into a trackable queue.</p></div>
        <div className="flex gap-2"><button onClick={() => void load()} className="p-2.5 rounded-xl glass text-slate-400 hover:text-white"><RefreshCw className="w-4 h-4" /></button><button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold"><Plus className="w-4 h-4" /> New task</button></div>
      </div>
      {error && <div className="mb-5 text-sm text-red-300 bg-red-500/5 border border-red-500/20 rounded-xl p-3">{error}</div>}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? <div className="py-20 text-center text-sm text-slate-600">Loading tasks…</div> :
        tasks.length === 0 ? <div className="py-20 text-center"><Zap className="w-8 h-8 text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-500">No tasks yet.</p><p className="text-xs text-slate-700 mt-1">Create follow-ups now; later the automation engine will be able to create them automatically.</p></div> :
        <div className="divide-y divide-white/[0.05]">
          {tasks.map((task) => (
            <div key={task.id} className={`p-4 md:p-5 flex gap-3 items-start ${task.status === 'done' ? 'opacity-60' : ''}`}>
              <button onClick={() => void toggleDone(task)} className="mt-0.5 text-slate-600 hover:text-emerald-400">{task.status === 'done' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5" />}</button>
              <div className="flex-1 min-w-0"><p className={`text-sm font-semibold ${task.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</p>{task.description && <p className="text-xs text-slate-600 mt-1">{task.description}</p>}<div className="flex flex-wrap gap-2 mt-3"><span className={`px-2 py-1 rounded-lg text-[10px] capitalize ${priorityClass[task.priority]}`}>{task.priority}</span><span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] text-[10px] text-slate-500"><CalendarClock className="w-3 h-3" /> {dueLabel(task.due_at)}</span></div></div>
              <div className="flex items-center gap-2"><select value={task.status} onChange={(e) => void setStatus(task, e.target.value as TaskStatus)} className="bg-slate-900/80 border border-white/[0.08] rounded-lg px-2 py-2 text-[10px] text-slate-400"><option value="todo">To do</option><option value="in_progress">In progress</option><option value="done">Done</option></select>{activeBusiness?.role === 'owner' && <button onClick={() => void remove(task)} className="p-2 rounded-lg text-slate-600 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>}</div>
            </div>
          ))}
        </div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
          <form onSubmit={createTask} className="w-full max-w-lg bg-slate-950 border border-white/[0.08] rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-5"><div><h2 className="text-lg font-semibold text-white">Create task</h2><p className="text-xs text-slate-600 mt-1">Add a concrete piece of work to the operating queue.</p></div><button type="button" onClick={() => setShowForm(false)} className="p-2 text-slate-500"><X className="w-4 h-4" /></button></div>
            <div className="space-y-3">
              <input required placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white placeholder:text-slate-700 outline-none" />
              <textarea rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white placeholder:text-slate-700 outline-none resize-none" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })} className="bg-slate-900/80 border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-slate-300">{priorities.map((item) => <option key={item} value={item}>{item}</option>)}</select><input type="datetime-local" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-slate-300 outline-none" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-5"><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-400">Cancel</button><button disabled={saving} className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50">{saving ? 'Saving…' : 'Create task'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
