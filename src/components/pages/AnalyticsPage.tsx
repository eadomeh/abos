import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import { supabase } from '@/lib/supabase';
import type { Order, OrderItem, OrderStatus } from '@/types/database';
import {
  TrendingUp, ShoppingCart, Package, Users, Loader2,
  BarChart3, ArrowUpRight, ArrowDownRight, Trophy, Receipt,
  Sparkles, Calendar,
} from 'lucide-react';

interface DayRevenue {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export default function AnalyticsPage() {
  const { activeBusiness } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  const fetchData = useCallback(async () => {
    if (!activeBusiness) { setLoading(false); return; }
    setLoading(true);

    const [ordersRes, prodCountRes, custCountRes] = await Promise.all([
      supabase.from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('business_id', activeBusiness.id)
        .order('created_at', { ascending: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('business_id', activeBusiness.id),
      supabase.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', activeBusiness.id),
    ]);

    if (ordersRes.data) {
      setOrders(ordersRes.data as unknown as Order[]);
      const allItems = (ordersRes.data as unknown as Order[]).flatMap((o) => o.order_items ?? []);
      setOrderItems(allItems);
    }
    setProductCount(prodCountRes.count ?? 0);
    setCustomerCount(custCountRes.count ?? 0);
    setLoading(false);
  }, [activeBusiness]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const currency = activeBusiness?.currency ?? 'NGN';
  const formatPrice = (amount: number) => `${currency} ${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  // Filter orders by time range
  const filteredOrders = useMemo(() => {
    if (timeRange === 'all') return orders;
    const days = timeRange === '7d' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return orders.filter((o) => new Date(o.created_at) >= cutoff);
  }, [orders, timeRange]);

  // Key metrics
  const completedOrders = filteredOrders.filter((o) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  const conversionRate = totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;

  // Revenue over time (daily)
  const dailyRevenue = useMemo<DayRevenue[]>(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const map = new Map<string, DayRevenue>();
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      map.set(key, { date: key, revenue: 0, orders: 0 });
    }

    completedOrders.forEach((o) => {
      const key = new Date(o.created_at).toISOString().split('T')[0];
      if (map.has(key)) {
        const entry = map.get(key)!;
        entry.revenue += Number(o.total_amount);
        entry.orders += 1;
      }
    });

    return Array.from(map.values());
  }, [completedOrders, timeRange]);

  // Order status breakdown
  const statusBreakdown = useMemo(() => {
    const counts: Record<OrderStatus, number> = { pending: 0, completed: 0, cancelled: 0 };
    filteredOrders.forEach((o) => { counts[o.status]++; });
    return counts;
  }, [filteredOrders]);

  // Top products by revenue
  const topProducts = useMemo<TopProduct[]>(() => {
    const map = new Map<string, TopProduct>();
    orderItems.forEach((item) => {
      const order = orders.find((o) => o.id === item.order_id);
      if (!order || order.status !== 'completed') return;
      const existing = map.get(item.product_name);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += Number(item.subtotal);
      } else {
        map.set(item.product_name, { name: item.product_name, quantity: item.quantity, revenue: Number(item.subtotal) });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orderItems, orders]);

  // Previous period comparison
  const prevPeriodRevenue = useMemo(() => {
    if (timeRange === 'all') return 0;
    const days = timeRange === '7d' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const prevCutoff = new Date(cutoff);
    prevCutoff.setDate(prevCutoff.getDate() - days);
    return orders
      .filter((o) => o.status === 'completed' && new Date(o.created_at) >= prevCutoff && new Date(o.created_at) < cutoff)
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
  }, [orders, timeRange]);

  const revenueChange = prevPeriodRevenue > 0 ? ((totalRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100 : 0;

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  const hasData = orders.length > 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Business performance and insights</p>
        </div>
        <div className="flex gap-1.5 p-1 glass rounded-xl w-fit">
          {(['7d', '30d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                timeRange === r ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-400 mb-2">No Data Yet</h3>
          <p className="text-sm text-slate-600 max-w-md mb-6">
            Create some orders to see your business analytics come to life with revenue charts, top products, and more.
          </p>
        </div>
      ) : (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard label="Total Revenue" value={formatPrice(totalRevenue)} icon={TrendingUp} color="emerald"
              change={timeRange !== 'all' ? revenueChange : undefined} />
            <MetricCard label="Avg Order Value" value={formatPrice(avgOrderValue)} icon={Receipt} color="blue" />
            <MetricCard label="Total Orders" value={totalOrders.toString()} icon={ShoppingCart} color="amber" />
            <MetricCard label="Conversion Rate" value={`${conversionRate.toFixed(0)}%`} icon={Trophy} color="teal" />
          </div>

          {/* Revenue chart */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Revenue Over Time</h3>
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'All time'}
              </span>
            </div>
            <RevenueChart data={dailyRevenue} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Order status breakdown */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingCart className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Order Status</h3>
              </div>
              <StatusDonut breakdown={statusBreakdown} total={totalOrders} />
            </div>

            {/* Top products */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Top Products</h3>
              </div>
              {topProducts.length > 0 ? (
                <div className="space-y-3">
                  {topProducts.map((p, i) => (
                    <ProductBar key={p.name} product={p} rank={i + 1} maxRevenue={topProducts[0].revenue} formatPrice={formatPrice} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">
                  No completed orders yet. Top products will appear here once you start selling.
                </p>
              )}
            </div>
          </div>

          {/* AI insight */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-400 mb-1">AI Insight</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {totalRevenue === 0
                    ? "You have orders but none are completed yet. Mark orders as completed to track your revenue."
                    : topProducts.length > 0
                    ? `Your best-selling product is "${topProducts[0].name}" with ${formatPrice(topProducts[0].revenue)} in revenue from ${topProducts[0].quantity} units sold. ${conversionRate < 50 ? 'Focus on converting more pending orders to boost revenue.' : 'Great conversion rate — keep the momentum going!'}`
                    : `You've generated ${formatPrice(totalRevenue)} in revenue with ${completedOrders.length} completed order${completedOrders.length !== 1 ? 's' : ''}. Average order value is ${formatPrice(avgOrderValue)}.`}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, change }: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  color: string;
  change?: number;
}) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    teal: 'text-teal-400',
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
          <Icon className={`w-5 h-5 ${colorMap[color]}`} />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change).toFixed(0)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function RevenueChart({ data }: { data: DayRevenue[] }) {
  const width = 800;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const step = chartW / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: padding.left + i * step,
    y: padding.top + chartH - (d.revenue / maxRevenue) * chartH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? padding.left} ${padding.top + chartH} L ${points[0]?.x ?? padding.left} ${padding.top + chartH} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => padding.top + chartH - f * chartH);
  const maxLabel = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: '400px' }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((y, i) => (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="10">
              {i === 0 ? '0' : Math.round(maxLabel * (1 - i * 0.25)).toLocaleString()}
            </text>
          </g>
        ))}

        {/* Area */}
        <path d={areaPath} fill="url(#revGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="rgb(16 185 129)" strokeWidth="2" strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            {p.revenue > 0 && (
              <>
                <circle cx={p.x} cy={p.y} r="3" fill="rgb(16 185 129)" />
                <circle cx={p.x} cy={p.y} r="6" fill="rgb(16 185 129)" opacity="0.15" />
              </>
            )}
            {(i % Math.ceil(data.length / 6) === 0 || i === data.length - 1) && (
              <text x={p.x} y={height - 8} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">
                {new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function StatusDonut({ breakdown, total }: { breakdown: Record<OrderStatus, number>; total: number }) {
  const radius = 60;
  const stroke = 16;
  const circumference = 2 * Math.PI * radius;
  const center = 80;

  const segments: { status: OrderStatus; count: number; color: string; offset: number }[] = [];
  let cumulative = 0;
  const statusColors: Record<OrderStatus, string> = {
    completed: '#10b981',
    pending: '#f59e0b',
    cancelled: '#ef4444',
  };

  (['completed', 'pending', 'cancelled'] as OrderStatus[]).forEach((status) => {
    const count = breakdown[status];
    if (count > 0) {
      const fraction = count / total;
      segments.push({
        status,
        count,
        color: statusColors[status],
        offset: cumulative,
      });
      cumulative += fraction;
    }
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
          {segments.map((seg) => {
            const fraction = seg.count / total;
            const dash = fraction * circumference;
            const gap = circumference - dash;
            const rotation = seg.offset * circumference * -1;
            return (
              <circle
                key={seg.status}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={rotation}
                transform={`rotate(-90 ${center} ${center})`}
                strokeLinecap="round"
              />
            );
          })}
          <text x={center} y={center - 5} textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">
            {total}
          </text>
          <text x={center} y={center + 15} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11">
            Orders
          </text>
        </svg>
      </div>
      <div className="flex-1 space-y-3 w-full">
        {(['completed', 'pending', 'cancelled'] as OrderStatus[]).map((status) => {
          const count = breakdown[status];
          const pct = total > 0 ? (count / total) * 100 : 0;
          const colors: Record<OrderStatus, string> = {
            completed: 'text-emerald-400 bg-emerald-500/10',
            pending: 'text-amber-400 bg-amber-500/10',
            cancelled: 'text-red-400 bg-red-500/10',
          };
          const labels: Record<OrderStatus, string> = {
            completed: 'Completed',
            pending: 'Pending',
            cancelled: 'Cancelled',
          };
          return (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[status]}`}>
                  <span className="text-xs font-bold">{count}</span>
                </div>
                <span className="text-sm text-slate-300">{labels[status]}</span>
              </div>
              <span className="text-sm text-slate-500">{pct.toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductBar({ product, rank, maxRevenue, formatPrice }: {
  product: TopProduct;
  rank: number;
  maxRevenue: number;
  formatPrice: (n: number) => string;
}) {
  const pct = maxRevenue > 0 ? (product.revenue / maxRevenue) * 100 : 0;
  const rankColors = ['text-amber-400', 'text-slate-400', 'text-orange-400', 'text-slate-500', 'text-slate-500'];

  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-bold ${rankColors[rank - 1] ?? 'text-slate-500'} w-5`}>{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-white truncate">{product.name}</span>
          <span className="text-xs text-emerald-400 ml-2 flex-shrink-0">{formatPrice(product.revenue)}</span>
        </div>
        <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] text-slate-600 mt-0.5">{product.quantity} units sold</span>
      </div>
    </div>
  );
}
