import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import { supabase } from '@/lib/supabase';
import type { Customer } from '@/types/database';
import {
  Users, Plus, Pencil, Trash2, X, Loader2, AlertCircle, ArrowRight,
  Phone, Mail, User, UserPlus, ShoppingCart, MessageCircle, Target,
  ClipboardList, Eye, CalendarDays, CircleDollarSign, ChevronRight,
} from 'lucide-react';

type CustomerOrderSummary = {
  id: string;
  order_number: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  total_amount: number;
  currency: string | null;
  created_at: string;
};

type Customer360 = {
  orderCount: number;
  completedOrderCount: number;
  totalSpent: number;
  lastOrder: CustomerOrderSummary | null;
  leadCount: number;
  conversationCount: number;
  openTaskCount: number;
  recentOrders: CustomerOrderSummary[];
};

export default function CustomersPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { activeBusiness } = useBusiness();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customer360, setCustomer360] = useState<Customer360 | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    if (!activeBusiness) { setCustomers([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', activeBusiness.id)
      .order('created_at', { ascending: false });
    if (error) {
      setCustomers([]);
    } else {
      setCustomers(data as Customer[]);
    }
    setLoading(false);
  }, [activeBusiness]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search)
  );

  useEffect(() => {
    if (!activeBusiness || !selectedCustomer) {
      setCustomer360(null);
      return;
    }

    let cancelled = false;

    const loadCustomer360 = async () => {
      setDetailLoading(true);

      const [
        ordersRes,
        completedOrdersRes,
        leadsRes,
        conversationsRes,
        tasksRes,
      ] = await Promise.all([
        supabase
          .from('orders')
          .select('id, order_number, status, total_amount, currency, created_at')
          .eq('business_id', activeBusiness.id)
          .eq('customer_id', selectedCustomer.id)
          .order('created_at', { ascending: false })
          .limit(20),

        supabase
          .from('orders')
          .select('total_amount')
          .eq('business_id', activeBusiness.id)
          .eq('customer_id', selectedCustomer.id)
          .eq('status', 'completed'),

        supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', activeBusiness.id)
          .eq('customer_id', selectedCustomer.id)
          .not('status', 'in', '(won,lost)'),

        supabase
          .from('conversations')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', activeBusiness.id)
          .eq('customer_id', selectedCustomer.id),

        supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', activeBusiness.id)
          .eq('related_customer_id', selectedCustomer.id)
          .neq('status', 'done'),
      ]);

      if (cancelled) return;

      const recentOrders = (ordersRes.data ?? []) as CustomerOrderSummary[];
      const completedOrders = (completedOrdersRes.data ?? []) as Array<{ total_amount: number }>;

      setCustomer360({
        orderCount: recentOrders.length,
        completedOrderCount: completedOrders.length,
        totalSpent: completedOrders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0),
        lastOrder: recentOrders[0] ?? null,
        leadCount: leadsRes.count ?? 0,
        conversationCount: conversationsRes.count ?? 0,
        openTaskCount: tasksRes.count ?? 0,
        recentOrders: recentOrders.slice(0, 5),
      });

      setDetailLoading(false);
    };

    void loadCustomer360();

    return () => {
      cancelled = true;
    };
  }, [activeBusiness, selectedCustomer]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your customer relationships</p>
        </div>
        <button
          onClick={() => { setEditingCustomer(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Customer</span>
        </button>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full px-4 py-2.5 glass rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-400 mb-2">
            {customers.length === 0 ? 'No Customers Yet' : 'No Results'}
          </h3>
          <p className="text-sm text-slate-600 max-w-md mb-6">
            {customers.length === 0
              ? 'Add your first customer to start building your customer base.'
              : 'Try a different search.'}
          </p>
          {customers.length === 0 && (
            <button
              onClick={() => { setEditingCustomer(null); setShowModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              <UserPlus className="w-4 h-4" />
              Add Your First Customer
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((customer) => (
            <div
              key={customer.id}
              className="glass glass-hover rounded-xl p-4 transition-all"
            >
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(customer)}
                  className="flex items-center gap-4 flex-1 min-w-0 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                    {customer.name[0]?.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{customer.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-0.5">
                      {customer.phone && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="w-3 h-3" /> {customer.phone}
                        </span>
                      )}
                      {customer.email && (
                        <span className="flex items-center gap-1 text-xs text-slate-500 truncate">
                          <Mail className="w-3 h-3" /> {customer.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="View customer"
                    onClick={() => setSelectedCustomer(customer)}
                    className="p-2 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Edit customer"
                    onClick={() => { setEditingCustomer(customer); setShowModal(true); }}
                    className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Delete customer"
                    onClick={() => setShowDeleteConfirm(customer)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCustomer && (
        <Customer360Panel
          customer={selectedCustomer}
          detail={customer360}
          loading={detailLoading}
          onClose={() => {
            setSelectedCustomer(null);
            setCustomer360(null);
          }}
          onEdit={() => {
            setEditingCustomer(selectedCustomer);
            setShowModal(true);
          }}
          onNavigate={onNavigate}
        />
      )}

      {showModal && (
        <CustomerModal
          customer={editingCustomer}
          businessId={activeBusiness!.id}
          onClose={() => { setShowModal(false); setEditingCustomer(null); }}
          onSaved={() => { setShowModal(false); setEditingCustomer(null); fetchCustomers(); }}
        />
      )}

      {showDeleteConfirm && (
        <DeleteCustomerConfirm
          customer={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          onDeleted={() => { setShowDeleteConfirm(null); fetchCustomers(); }}
        />
      )}
    </div>
  );
}

function Customer360Panel({
  customer,
  detail,
  loading,
  onClose,
  onEdit,
  onNavigate,
}: {
  customer: Customer;
  detail: Customer360 | null;
  loading: boolean;
  onClose: () => void;
  onEdit: () => void;
  onNavigate?: (page: string) => void;
}) {
  const currency = detail?.recentOrders[0]?.currency ?? 'NGN';

  const formatMoney = (amount: number) =>
    `${currency} ${Number(amount).toLocaleString()}`;

  const statusTone = (status: CustomerOrderSummary['status']) => {
    if (status === 'completed') return 'text-emerald-400 bg-emerald-500/10';
    if (status === 'cancelled') return 'text-red-400 bg-red-500/10';
    return 'text-amber-400 bg-amber-500/10';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto glass rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {customer.name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-400">Customer 360</p>
              <h2 className="text-lg md:text-xl font-semibold text-white truncate">{customer.name}</h2>
            </div>
          </div>

          <button type="button" onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 md:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MetricCard
              icon={ShoppingCart}
              label="Orders"
              value={loading || !detail ? '—' : String(detail.orderCount)}
            />
            <MetricCard
              icon={CircleDollarSign}
              label="Total spent"
              value={loading || !detail ? '—' : formatMoney(detail.totalSpent)}
            />
            <MetricCard
              icon={CalendarDays}
              label="Last order"
              value={loading || !detail || !detail.lastOrder
                ? '—'
                : new Date(detail.lastOrder.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MiniMetric icon={Target} label="Active leads" value={loading || !detail ? '—' : String(detail.leadCount)} />
            <MiniMetric icon={MessageCircle} label="Conversations" value={loading || !detail ? '—' : String(detail.conversationCount)} />
            <MiniMetric icon={ClipboardList} label="Open tasks" value={loading || !detail ? '—' : String(detail.openTaskCount)} />
          </div>

          <div className="glass rounded-2xl p-4 md:p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm font-semibold text-white">Contact</p>
                <p className="text-xs text-slate-600 mt-1">Core customer information</p>
              </div>
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-xs text-slate-300 hover:text-white"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={Phone} label="Phone" value={customer.phone ?? 'Not provided'} />
              <InfoRow icon={Mail} label="Email" value={customer.email ?? 'Not provided'} />
            </div>

            {customer.notes && (
              <div className="mt-3 rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">Notes</p>
                <p className="text-sm text-slate-300 whitespace-pre-wrap break-words">{customer.notes}</p>
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-4 md:p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm font-semibold text-white">Recent orders</p>
                <p className="text-xs text-slate-600 mt-1">
                  {detail ? `${detail.completedOrderCount} completed order(s)` : 'Loading customer activity...'}
                </p>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('orders');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Open Orders <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-10 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              </div>
            ) : !detail || detail.recentOrders.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingCart className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-600">No orders linked to this customer yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {detail.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.025] border border-white/[0.05] p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {order.order_number ?? 'Order'}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-emerald-400">{formatMoney(Number(order.total_amount))}</p>
                      <span className={`inline-flex mt-1 px-2 py-0.5 rounded-md text-[10px] ${statusTone(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: {
  icon: typeof ShoppingCart;
  label: string;
  value: string;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <Icon className="w-4 h-4 text-emerald-400 mb-3" />
      <p className="text-[10px] uppercase tracking-wider text-slate-600">{label}</p>
      <p className="text-lg font-semibold text-white mt-1 truncate">{value}</p>
    </div>
  );
}

function MiniMetric({ icon: Icon, label, value }: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.025] border border-white/[0.05] p-3">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-[10px] uppercase tracking-wider text-slate-600">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-200 mt-2">{value}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: {
  icon: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.025] border border-white/[0.05] p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-[10px] uppercase tracking-wider text-slate-600">{label}</span>
      </div>
      <p className="text-sm text-slate-300 break-words">{value}</p>
    </div>
  );
}

function CustomerModal({ customer, businessId, onClose, onSaved }: {
  customer: Customer | null;
  businessId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(customer?.name ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');
  const [email, setEmail] = useState(customer?.email ?? '');
  const [notes, setNotes] = useState(customer?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Customer name is required'); return; }
    setError(null);
    setLoading(true);

    const payload = {
      business_id: businessId,
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      notes: notes.trim() || null,
    };

    let result;
    if (customer) {
      result = await supabase.from('customers').update(payload).eq('id', customer.id);
    } else {
      result = await supabase.from('customers').insert(payload);
    }

    if (result.error) {
      setError('Could not save the customer. Please try again.');
      setLoading(false);
    } else {
      onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-lg glass rounded-2xl shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-semibold text-white">{customer ? 'Edit Customer' : 'Add Customer'}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Customer name" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Optional" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this customer" rows={2} className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all resize-none" />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{customer ? 'Save Changes' : 'Add Customer'} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteCustomerConfirm({ customer, onClose, onDeleted }: {
  customer: Customer;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const { error } = await supabase.from('customers').delete().eq('id', customer.id);
    if (error) { setLoading(false); } else { onDeleted(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-sm glass rounded-2xl shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Delete Customer?</h3>
        <p className="text-sm text-slate-500 mb-6">"{customer.name}" will be permanently removed.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 hover:text-white text-sm font-medium transition-all">Cancel</button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 py-2.5 bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
