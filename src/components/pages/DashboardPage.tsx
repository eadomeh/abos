import { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import { supabase } from '@/lib/supabase';
import {
  TrendingUp, Package, ShoppingCart, Users, Sparkles,
  ArrowUpRight, MessageCircle, MapPin, CheckCircle2,
  ArrowRight, Phone, Check, Box,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { activeBusiness } = useBusiness();
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0, conversations: 0 });
  const [recentOrders, setRecentOrders] = useState<Array<{ id: string; total_amount: number; status: string; created_at: string; customer_name: string | null }>>([]);
  const [recentConvos, setRecentConvos] = useState<Array<{ id: string; customer_name: string; last_message_preview: string | null; last_message_at: string | null; unread_count: number }>>([]);

  const fetchStats = useCallback(async () => {
    if (!activeBusiness) return;
    const [prodRes, custRes, ordersRes, recentRes, convosRes, recentConvosRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('business_id', activeBusiness.id),
      supabase.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', activeBusiness.id),
      supabase.from('orders').select('total_amount, status').eq('business_id', activeBusiness.id),
      supabase.from('orders')
        .select('id, total_amount, status, created_at, customer:customers(name)')
        .eq('business_id', activeBusiness.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('business_id', activeBusiness.id),
      supabase.from('conversations')
        .select('id, customer_name, last_message_preview, last_message_at, unread_count')
        .eq('business_id', activeBusiness.id)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(3),
    ]);

    const completedOrders = (ordersRes.data ?? []).filter((o) => o.status === 'completed');
    const revenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

    setStats({
      products: prodRes.count ?? 0, customers: custRes.count ?? 0, orders: ordersRes.data?.length ?? 0, revenue, conversations: convosRes.count ?? 0 });

    const recent = (recentRes.data ?? []).map((o) => {
      const order = o as unknown as { id: string; total_amount: number; status: string; created_at: string; customer: { name: string } | null };
      return { id: order.id, total_amount: order.total_amount, status: order.status, created_at: order.created_at, customer_name: order.customer?.name ?? null };
    });
    setRecentOrders(recent);

    if (recentConvosRes.data) {
      setRecentConvos(recentConvosRes.data as Array<{ id: string; customer_name: string; last_message_preview: string | null; last_message_at: string | null; unread_count: number }>);
    }
  }, [activeBusiness]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const currency = activeBusiness?.currency ?? 'NGN';
  const formatPrice = (amount: number) => `${currency} ${Number(amount).toLocaleString()}`;

  const statCards = [
    { label: 'Revenue', value: formatPrice(stats.revenue), icon: TrendingUp, color: 'emerald' },
    { label: 'Orders', value: stats.orders.toString(), icon: ShoppingCart, color: 'blue' },
    { label: 'Products', value: stats.products.toString(), icon: Package, color: 'amber' },
    { label: 'Customers', value: stats.customers.toString(), icon: Users, color: 'teal' },
  ];

  const colorMap: Record<string, string> = {
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    blue: 'from-blue-500/10 to-blue-500/5 text-blue-400 border-blue-500/20',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-400 border-amber-500/20',
    teal: 'from-teal-500/10 to-teal-500/5 text-teal-400 border-teal-500/20',
  };

  const nextActions = [
    { label: 'Add your first product', desc: 'Start building your catalog', icon: Package, page: 'products', done: stats.products > 0 },
    { label: 'Add your first customer', desc: 'Build your customer base', icon: Users, page: 'customers', done: stats.customers > 0 },
    { label: 'Create your first order', desc: 'Start tracking sales', icon: ShoppingCart, page: 'orders', done: stats.orders > 0 },
    { label: 'Start a conversation', desc: 'Chat with your customers', icon: MessageCircle, page: 'conversations', done: stats.conversations > 0 },
  ];

  const ownerFirstName = activeBusiness?.owner_name?.split(' ')[0] ?? activeBusiness?.name ?? 'there';
  const ownerFirstLetter = activeBusiness?.owner_name?.[0]?.toUpperCase() ?? activeBusiness?.name?.[0]?.toUpperCase() ?? 'A';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-lg font-bold text-white">{ownerFirstLetter}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome back, {ownerFirstName}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {activeBusiness?.name} — {activeBusiness?.country}
            </p>
          </div>
        </div>
      </div>

      {/* Setup complete banner */}
      <div className="glass rounded-2xl p-5 mb-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">Workspace Ready</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Your business workspace is set up. Complete the next actions below to start selling.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {activeBusiness?.country}</span>
          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {activeBusiness?.phone}</span>
          <span className="px-2 py-0.5 bg-white/[0.06] rounded-md font-medium">{currency}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${colorMap[stat.color]} border rounded-2xl p-5 backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium flex items-center gap-0.5 text-slate-500">
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* AI insight card */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 mb-1">AI Insight</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {stats.products === 0
                ? "Welcome to ABOS! Start by adding your first product to build your catalog. As you grow, I'll surface insights to help you increase revenue."
                : stats.orders === 0
                ? `You have ${stats.products} product${stats.products !== 1 ? 's' : ''} in your catalog. Create your first order to start tracking sales and revenue.`
                : `You've processed ${stats.orders} order${stats.orders !== 1 ? 's' : ''} with ${formatPrice(stats.revenue)} in completed revenue. Keep it up!`}
            </p>
          </div>
        </div>
      </div>

      {/* Next actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Next Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {nextActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => onNavigate(action.page)}
                className={`glass glass-hover rounded-2xl p-5 text-left transition-all group ${action.done ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    action.done ? 'bg-emerald-500/10' : 'bg-white/[0.06] group-hover:bg-emerald-500/10'
                  }`}>
                    {action.done ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium text-white mb-1">{action.label}</p>
                <p className="text-xs text-slate-500">{action.desc}</p>
                {!action.done && <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 mt-3 transition-colors" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Conversations</h3>
            <button onClick={() => onNavigate('conversations')} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {recentConvos.length > 0 ? (
            <div className="space-y-2">
              {recentConvos.map((convo) => (
                <div key={convo.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                    {convo.customer_name[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{convo.customer_name}</p>
                    <p className="text-xs text-slate-500 truncate">{convo.last_message_preview ?? 'No messages yet'}</p>
                  </div>
                  {convo.unread_count > 0 && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                      {convo.unread_count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">
              No conversations yet. Start chatting with your customers from the Conversations page.
            </p>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Orders</h3>
            <button onClick={() => onNavigate('orders')} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map((order) => {
                const statusColors: Record<string, string> = {
                  pending: 'text-amber-400 bg-amber-500/10',
                  completed: 'text-emerald-400 bg-emerald-500/10',
                  cancelled: 'text-red-400 bg-red-500/10',
                };
                return (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${statusColors[order.status] ?? statusColors.pending}`}>
                        {order.status[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-white">{order.customer_name ?? 'Walk-in'}</p>
                        <p className="text-[10px] text-slate-500">{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-400">{formatPrice(Number(order.total_amount))}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">
              No orders yet. Add products and start selling to see orders here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
