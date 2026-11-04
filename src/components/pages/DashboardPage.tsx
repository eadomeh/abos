import { getInitial } from '@/lib/avatar';
import { useQueryClient } from '@tanstack/react-query';
import { fetchWorkspaceBootstrap, type DashboardSnapshot } from '@/lib/workspace-bootstrap';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import {
  Activity, AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, Clock3,
  Inbox, Package, RefreshCw, ShoppingCart, Sparkles, Target, TrendingUp,
  Users, XCircle,
} from 'lucide-react';

interface DashboardPageProps { onNavigate: (page: string) => void; }

type OrderRow = { id: string; total_amount: number | string; status: string; created_at: string };
type ConversationRow = { id: string; customer_name: string; last_message_preview: string | null; last_message_at: string | null; unread_count: number };
type ActivityRow = { id: string; event_type: string; entity_type: string | null; created_at: string; payload: Record<string, unknown> };
type InsightRow = { id: string; title: string; summary: string; severity: string; created_at: string };

const emptyTrend = () => Array.from({ length: 7 }, (_, index) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (6 - index));
  return { key: date.toISOString().slice(0, 10), label: date.toLocaleDateString(undefined, { weekday: 'short' }), amount: 0 };
});

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { activeBusiness } = useBusiness();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    revenue30d: 0, revenueToday: 0, orders30d: 0, customers30d: 0,
    conversations: 0, unread: 0, openLeads: 0, pipelineValue: 0,
    openTasks: 0, dueToday: 0, lowStock: 0,
  });
  const [trend, setTrend] = useState(emptyTrend());
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([]);
  const [recentConvos, setRecentConvos] = useState<ConversationRow[]>([]);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [insights, setInsights] = useState<InsightRow[]>([]);

  const load = useCallback(async (manual = false) => {
    if (!activeBusiness) return;
    if (manual) setRefreshing(true);

    const now = new Date();
    const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);
    const sevenDaysAgo = new Date(dayStart); sevenDaysAgo.setDate(dayStart.getDate() - 6);
    const dayKey = `${dayStart.getFullYear()}-${dayStart.getMonth() + 1}-${dayStart.getDate()}`;
    const queryKey = ['workspace-bootstrap', activeBusiness.id, dayKey] as const;

    const applySnapshot = (snapshot: DashboardSnapshot) => {
      setStats(snapshot.stats);
      setTrend(snapshot.trend);
      setRecentOrders(snapshot.recentOrders);
      setRecentConvos(snapshot.recentConvos);
      setActivities(snapshot.activities);
      setInsights(snapshot.insights);
    };

    const cached = queryClient.getQueryData<DashboardSnapshot>(queryKey);
    if (cached) {
      applySnapshot(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      if (manual) await queryClient.invalidateQueries({ queryKey, exact: true });
      const snapshot = await queryClient.fetchQuery({
        queryKey,
        staleTime: 30_000,
        queryFn: () => fetchWorkspaceBootstrap({
          businessId: activeBusiness.id,
          now,
          dayStart,
          thirtyDaysAgo,
          sevenDaysAgo,
        }),
      });
      applySnapshot(snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeBusiness, queryClient]);

  useEffect(() => { void load(); }, [load]);

  const currency = activeBusiness?.currency ?? 'NGN';
  const formatMoney = useCallback((amount: number) => `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, [currency]);

  const trendMax = Math.max(...trend.map((point) => point.amount), 1);
  const conversionSignal = useMemo(() => {
    if (stats.openLeads === 0) return 'No active leads yet. Capture every serious enquiry.';
    if (stats.pipelineValue === 0) return `${stats.openLeads} active leads need estimated deal values.`;
    return `${formatMoney(stats.pipelineValue)} is sitting in the active pipeline.`;
  }, [stats.openLeads, stats.pipelineValue, formatMoney]);

  const signal = stats.lowStock > 0
    ? `${stats.lowStock} active product${stats.lowStock === 1 ? '' : 's'} are at or below 5 units.`
    : stats.unread > 0
      ? `${stats.unread} conversation${stats.unread === 1 ? '' : 's'} need attention.`
      : stats.dueToday > 0
        ? `${stats.dueToday} task${stats.dueToday === 1 ? '' : 's'} are due today.`
        : 'Core operating metrics are stable.';

  const statCards = [
    { label: 'Revenue · 30d', value: formatMoney(stats.revenue30d), meta: `${formatMoney(stats.revenueToday)} today`, icon: TrendingUp, tone: 'emerald' },
    { label: 'Orders · 30d', value: String(stats.orders30d), meta: `${formatMoney(stats.revenue30d)} completed`, icon: ShoppingCart, tone: 'blue' },
    { label: 'New Customers', value: String(stats.customers30d), meta: 'Last 30 days', icon: Users, tone: 'teal' },
    { label: 'Inbox Attention', value: String(stats.unread), meta: `${stats.conversations} total conversations`, icon: Inbox, tone: 'amber' },
  ];

  const tones: Record<string, string> = {
    emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400',
    teal: 'from-teal-500/10 to-teal-500/5 border-teal-500/20 text-teal-400',
    amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
  };

  const activityLabel = (event: ActivityRow) => {
    const map: Record<string, string> = {
      lead_created: 'Lead created',
      lead_status_changed: 'Lead status updated',
      task_created: 'Task created',
      task_completed: 'Task completed',
    };
    return map[event.event_type] ?? event.event_type.replace(/_/g, ' ');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex min-w-0 items-center gap-4">
          {activeBusiness?.logo_url ? (
            <img
              src={activeBusiness.logo_url}
              alt={`${activeBusiness.name} logo`}
              className="h-14 w-14 shrink-0 rounded-2xl border border-white/[0.08] bg-white/[0.03] object-cover"
            />
          ) : (
            <div className="h-14 w-14 shrink-0 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center">
              <span className="text-xl font-bold text-emerald-300">
                {getInitial(activeBusiness?.name, 'A')}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400 mb-2">Operating command center</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight line-clamp-2 break-words">{activeBusiness?.name}</h1>
            <p className="text-sm text-slate-500 mt-1">Live business data from your ABOS workspace.</p>
          </div>
        </div>
        <button type="button" onClick={() => void load(true)} disabled={refreshing} className="self-start inline-flex items-center gap-2 px-3 py-2 rounded-xl glass text-xs text-slate-300 hover:text-white transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
          <div><p className="text-sm font-medium text-red-300">Dashboard data error</p><p className="text-xs text-red-300/70 mt-1">{error}</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`bg-gradient-to-br ${tones[stat.tone]} border rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center"><Icon className="w-5 h-5" /></div>
              </div>
              <p className="text-2xl font-bold text-white">{loading ? '—' : stat.value}</p>
              <p className="text-xs font-medium text-slate-400 mt-1">{stat.label}</p>
              <p className="text-[11px] text-slate-600 mt-1">{stat.meta}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Active Leads', value: stats.openLeads, page: 'leads', icon: Target },
          { label: 'Pipeline', value: formatMoney(stats.pipelineValue), page: 'leads', icon: TrendingUp },
          { label: 'Open Tasks', value: stats.openTasks, page: 'tasks', icon: ClipboardList },
          { label: 'Due Today', value: stats.dueToday, page: 'tasks', icon: Clock3 },
          { label: 'Low Stock', value: stats.lowStock, page: 'products', icon: Package },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} onClick={() => onNavigate(item.page)} className="glass glass-hover rounded-2xl p-4 text-left">
              <Icon className="w-4 h-4 text-slate-500 mb-3" />
              <p className="text-lg font-bold text-white">{item.value}</p>
              <p className="text-[11px] text-slate-500 mt-1">{item.label}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 glass rounded-2xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-sm font-semibold text-white">Sales pulse</h2><p className="text-xs text-slate-500 mt-1">Completed-order revenue over the last 7 days.</p></div>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="h-44 flex items-end gap-2">
            {trend.map((point) => (
              <div key={point.key} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                <div title={formatMoney(point.amount)} className="w-full max-w-12 rounded-t-lg bg-emerald-500/60 hover:bg-emerald-400/70 transition-colors" style={{ height: `${Math.max(6, (point.amount / trendMax) * 100)}%` }} />
                <span className="text-[10px] text-slate-600">{point.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center"><Sparkles className="w-5 h-5 text-emerald-400" /></div>
            <div><p className="text-sm font-semibold text-white">Business signals</p><p className="text-xs text-slate-500">Grounded in live workspace data</p></div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">{signal}</p>
          <p className="text-sm text-slate-400 leading-relaxed">{conversionSignal}</p>
          {insights.length > 0 && (
            <div className="mt-5 pt-5 border-t border-white/[0.06] space-y-3">
              {insights.map((insight) => (
                <div key={insight.id}>
                  <p className="text-xs font-semibold text-emerald-300">{insight.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{insight.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-semibold text-white">Recent orders</h2><button onClick={() => onNavigate('orders')} className="text-xs text-emerald-400">View all <ArrowRight className="inline w-3 h-3" /></button></div>
          {recentOrders.length === 0 ? <p className="text-sm text-slate-600 py-8 text-center">No orders yet.</p> : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <div><p className="text-sm text-white">{formatMoney(Number(order.total_amount))}</p><p className="text-[11px] text-slate-600">{new Date(order.created_at).toLocaleString(undefined, { dateStyle: 'medium' })}</p></div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] capitalize ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>{order.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-semibold text-white">Inbox</h2><button onClick={() => onNavigate('conversations')} className="text-xs text-emerald-400">Open inbox <ArrowRight className="inline w-3 h-3" /></button></div>
          {recentConvos.length === 0 ? <p className="text-sm text-slate-600 py-8 text-center">No conversations yet.</p> : (
            <div className="space-y-3">
              {recentConvos.map((convo) => (
                <div key={convo.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-semibold text-white">{getInitial(convo.customer_name)}</div>
                  <div className="min-w-0 flex-1"><p className="text-sm text-white truncate">{convo.customer_name}</p><p className="text-[11px] text-slate-600 truncate">{convo.last_message_preview ?? 'No preview'}</p></div>
                  {convo.unread_count > 0 && <span className="min-w-5 h-5 px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">{convo.unread_count}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5 md:p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-semibold text-white">Operating activity</h2><Activity className="w-4 h-4 text-slate-600" /></div>
          {activities.length === 0 ? <p className="text-sm text-slate-600 py-8 text-center">Activity will appear as you work leads and tasks.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {activities.map((event) => (
                <div key={event.id} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                    {event.event_type.includes('completed') ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : event.event_type.includes('failed') ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <Activity className="w-4 h-4 text-slate-500" />}
                  </div>
                  <div className="min-w-0"><p className="text-xs font-medium text-slate-300 capitalize">{activityLabel(event)}</p><p className="text-[10px] text-slate-600">{new Date(event.created_at).toLocaleString()}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
