import { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import { supabase } from '@/lib/supabase';
import type { Order, Product, Customer, OrderItem, OrderStatus } from '@/types/database';
import {
  ShoppingCart, Plus, X, Loader2, AlertCircle, ArrowRight,
  Check, Clock, XCircle, Package, Trash2, Minus, Receipt,
} from 'lucide-react';

export default function OrdersPage() {
  const { activeBusiness } = useBusiness();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

  const fetchOrders = useCallback(async () => {
    if (!activeBusiness) { setOrders([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        customer:customers (name, phone )
      `)
      .eq('business_id', activeBusiness.id)
      .order('created_at', { ascending: false });
    if (error) {
      setOrders([]);
    } else {
      setOrders(data as unknown as Order[]);
    }
    setLoading(false);
  }, [activeBusiness]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);

  const formatPrice = (amount: number) => {
    const cur = activeBusiness?.currency ?? 'NGN';
    return `${cur} ${Number(amount).toLocaleString()}`;
  };

  const statusConfig: Record<OrderStatus, { icon: typeof Check; color: string; label: string }> = {
    pending: { icon: Clock, color: 'text-amber-400 bg-amber-500/10', label: 'Pending' },
    completed: { icon: Check, color: 'text-emerald-400 bg-emerald-500/10', label: 'Completed' },
    cancelled: { icon: XCircle, color: 'text-red-400 bg-red-500/10', label: 'Cancelled' },
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    fetchOrders();
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Create and track customer orders</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Order</span>
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1.5 mb-6 p-1 glass rounded-xl w-fit">
        {(['all', 'pending', 'completed', 'cancelled'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
              statusFilter === s ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
            <ShoppingCart className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-400 mb-2">
            {orders.length === 0 ? 'No Orders Yet' : 'No Orders Found'}
          </h3>
          <p className="text-sm text-slate-600 max-w-md mb-6">
            {orders.length === 0
              ? 'Create your first order to start tracking sales.'
              : 'No orders match this filter.'}
          </p>
          {orders.length === 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              Create Your First Order
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            return (
              <div key={order.id} className="glass rounded-2xl p-5 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${statusConfig[order.status].color}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {order.customer?.name ?? 'Walk-in Customer'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-emerald-400">{formatPrice(order.total_amount)}</span>
                </div>

                {/* Order items */}
                {order.order_items && order.order_items.length > 0 && (
                  <div className="space-y-1 mb-3 pl-12">
                    {order.order_items.map((item: OrderItem) => (
                      <div key={item.id} className="flex items-center justify-between text-xs text-slate-400">
                        <span>{item.product_name} x{item.quantity}</span>
                        <span>{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Status actions */}
                <div className="flex gap-2 pl-12">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg transition-all"
                      >
                        <Check className="w-3 h-3" /> Mark Completed
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-all"
                      >
                        <XCircle className="w-3 h-3" /> Cancel
                      </button>
                    </>
                  )}
                  {order.status === 'completed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'pending')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium rounded-lg transition-all"
                    >
                      <Clock className="w-3 h-3" /> Reopen
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && activeBusiness && (
        <CreateOrderModal
          businessId={activeBusiness.id}
          currency={activeBusiness.currency ?? 'NGN'}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchOrders(); }}
        />
      )}
    </div>
  );
}

function CreateOrderModal({ businessId, currency, onClose, onCreated }: {
  businessId: string;
  currency: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    (async () => {
      const [prodRes, custRes] = await Promise.all([
        supabase.from('products').select('*').eq('business_id', businessId).eq('is_active', true).order('name'),
        supabase.from('customers').select('*').eq('business_id', businessId).order('name'),
      ]);
      if (prodRes.data) setProducts(prodRes.data as Product[]);
      if (custRes.data) setCustomers(custRes.data as Customer[]);
    })();
  }, [businessId]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        return prev.map((c) => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => prev.map((c) => {
      if (c.product.id !== productId) return c;
      const newQty = Math.max(1, c.quantity + delta);
      return { ...c, quantity: newQty };
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const total = cart.reduce((sum, c) => sum + Number(c.product.price) * c.quantity, 0);

  const formatPrice = (amount: number) => `${currency} ${Number(amount).toLocaleString()}`;

  const handleSubmit = async () => {
    if (cart.length === 0) { setError('Add at least one product to the order'); return; }
    setError(null);
    setLoading(true);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        business_id: businessId,
        customer_id: selectedCustomerId || null,
        status: 'pending',
        total_amount: total,
        currency,
        notes: notes.trim() || null,
      })
      .select()
      .maybeSingle();

    if (orderError || !order) {
      setError('Could not create the order. Please try again.');
      setLoading(false);
      return;
    }

    const orderItems = cart.map((c) => ({
      order_id: order.id,
      product_id: c.product.id,
      product_name: c.product.name,
      unit_price: Number(c.product.price),
      quantity: c.quantity,
      subtotal: Number(c.product.price) * c.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      setError('Order created but items could not be added. Please try again.');
      setLoading(false);
      return;
    }

    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl glass rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">New Order</h2>
              <p className="text-xs text-slate-500">Step {step} of 2</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-1.5 px-6 pt-4 flex-shrink-0">
          <div className={`h-1 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-emerald-500' : 'bg-white/[0.06]'}`} />
          <div className={`h-1 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-emerald-500' : 'bg-white/[0.06]'}`} />
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          {step === 1 && (
            <>
              {/* Customer selection */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                  Customer <span className="text-slate-600 normal-case">— optional</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-4 py-3 glass rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#0B141A]">Walk-in Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0B141A]">{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Product selection */}
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                Select Products
              </label>
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Package className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-sm text-slate-500">No products available. Add products first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addToCart(product)}
                      className="flex flex-col items-start p-3 glass glass-hover rounded-xl text-left transition-all"
                    >
                      <span className="text-sm font-medium text-white truncate w-full">{product.name}</span>
                      <span className="text-xs text-emerald-400 mt-1">{formatPrice(Number(product.price))}</span>
                      <span className="text-[10px] text-slate-600 mt-0.5">{product.stock_quantity} in stock</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Cart */}
              {cart.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Order Items</label>
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 glass rounded-xl p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                        <p className="text-xs text-slate-500">{formatPrice(Number(item.product.price))} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateQty(item.product.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm text-white w-6 text-center">{item.quantity}</span>
                        <button type="button" onClick={() => updateQty(item.product.id, 1)}
                          className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button type="button" onClick={() => removeFromCart(item.product.id)}
                          className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors ml-1">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-emerald-400 w-20 text-right">
                        {formatPrice(Number(item.product.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-medium text-slate-400">Total</span>
                    <span className="text-lg font-bold text-emerald-400">{formatPrice(total)}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mt-4">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => { setError(null); setStep(2); }}
                className="w-full flex items-center justify-center gap-2 py-3 mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-5">
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                  Order Notes <span className="text-slate-600 normal-case">— optional</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or notes for this order"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                />
              </div>

              {/* Order summary */}
              <div className="glass rounded-xl p-4 mb-4">
                <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Order Summary</h3>
                <div className="space-y-2 mb-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{item.product.name} x{item.quantity}</span>
                      <span className="text-slate-400">{formatPrice(Number(item.product.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <span className="text-sm font-medium text-white">Total</span>
                  <span className="text-lg font-bold text-emerald-400">{formatPrice(total)}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => { setError(null); setStep(1); }}
                  className="px-5 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition-all">
                  Back
                </button>
                <button type="button" disabled={loading} onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Create Order</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
