import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import { supabase } from '@/lib/supabase';
import type { Order, Product, Customer, OrderItem, OrderStatus, OrderPaymentReport } from '@/types/database';
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [paymentReports, setPaymentReports] = useState<OrderPaymentReport[]>([]);
  const [recordingOrder, setRecordingOrder] = useState<Order | null>(null);

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

    const { data: reports, error: reportsError } = await supabase
      .from('order_payment_reports')
      .select('*')
      .eq('business_id', activeBusiness.id)
      .order('created_at', { ascending: false });
    if (reportsError) {
      setPaymentReports([]);
      setActionError('Payment reports could not be loaded. Retry or reload this page.');
    } else {
      setPaymentReports((reports ?? []) as unknown as OrderPaymentReport[]);
    }
    setLoading(false);
  }, [activeBusiness]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);

  const formatPrice = (amount: number) => {
    const cur = activeBusiness?.currency ?? 'NGN';
    return `${cur} ${Number(amount).toLocaleString()}`;
  };

  const canRecordTransfers = ['owner', 'admin', 'agent'].includes(activeBusiness?.role ?? '');
  const canReviewTransfers = ['owner', 'admin'].includes(activeBusiness?.role ?? '');

  const reviewManualTransfer = async (paymentId: string, decision: 'verified' | 'rejected') => {
    if (!canReviewTransfers) { setActionError('Only the business owner or admin can review a transfer.'); return; }
    const confirmation = decision === 'verified'
      ? 'Confirm that you independently checked the bank account and verified that the funds were received. This does not complete the order.'
      : 'Reject this transfer claim? The claim will remain in the audit history.';
    if (!window.confirm(confirmation)) return;
    setActionError(null);
    const { error } = await supabase.rpc('review_manual_bank_transfer', {
      p_payment_id: paymentId, p_decision: decision, p_review_note: null,
    });
    if (error) { setActionError(error.message || 'Transfer review failed.'); return; }
    await fetchOrders();
  };

  const statusConfig: Record<OrderStatus, { icon: typeof Check; color: string; label: string }> = {
    pending: { icon: Clock, color: 'text-amber-400 bg-amber-500/10', label: 'Pending' },
    completed: { icon: Check, color: 'text-emerald-400 bg-emerald-500/10', label: 'Completed' },
    cancelled: { icon: XCircle, color: 'text-red-400 bg-red-500/10', label: 'Cancelled' },
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setActionError(null);

    const rpcName = status === 'completed' ? 'complete_order' : 'cancel_order';

    const { error } = await supabase.rpc(rpcName, {
      p_order_id: orderId,
    });

    if (error) {
      setActionError(error.message);
      return;
    }

    fetchOrders();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
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

      {actionError && (
        <div className="mb-5 text-sm text-red-300 bg-red-500/5 border border-red-500/20 rounded-xl p-3">
          {actionError}
        </div>
      )}

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
            const orderPayments = paymentReports.filter((payment) => payment.order_id === order.id);
            const verifiedPayment = orderPayments.find((payment) => payment.status === 'verified');
            const pendingPayment = orderPayments.find((payment) => payment.status === 'pending');
            const latestPayment = orderPayments[0];
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

                <div className="mt-4 ml-12 border-t border-white/[0.06] pt-3 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">Payment status</p>
                  {verifiedPayment ? (
                    <p className="text-xs text-emerald-300">Verified by an authorized reviewer on {new Date(verifiedPayment.reviewed_at ?? verifiedPayment.updated_at).toLocaleString()}. Order fulfilment status is unchanged.</p>
                  ) : pendingPayment ? (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">
                      <p className="text-xs font-medium text-amber-200">Transfer claim pending human verification</p>
                      <p className="text-[11px] text-slate-400 mt-1">Amount: {formatPrice(pendingPayment.amount)}{pendingPayment.transfer_reference ? ` · Reference: ${pendingPayment.transfer_reference}` : ''}</p>
                      {pendingPayment.report_note && <p className="text-[11px] text-slate-400 mt-1">Note: {pendingPayment.report_note}</p>}
                      {canReviewTransfers && <div className="flex flex-wrap gap-2 mt-3"><button type="button" onClick={() => void reviewManualTransfer(pendingPayment.id, 'verified')} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20">Confirm funds received</button><button type="button" onClick={() => void reviewManualTransfer(pendingPayment.id, 'rejected')} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 text-xs font-semibold hover:bg-red-500/20">Reject claim</button></div>}
                    </div>
                  ) : latestPayment?.status === 'rejected' ? (
                    <p className="text-xs text-red-300">Last transfer claim was rejected. A new claim may be recorded if appropriate.</p>
                  ) : (
                    <p className="text-xs text-slate-500">No transfer claim recorded.</p>
                  )}
                  {canRecordTransfers && order.status === 'pending' && !pendingPayment && !verifiedPayment && (
                    <button type="button" onClick={() => setRecordingOrder(order)} className="px-3 py-1.5 rounded-lg border border-white/[0.09] text-slate-300 text-xs font-medium hover:bg-white/[0.04]">Record transfer claim</button>
                  )}
                </div>

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
      {recordingOrder && activeBusiness && (
        <RecordTransferClaimModal
          order={recordingOrder}
          currency={activeBusiness.currency ?? 'NGN'}
          onClose={() => setRecordingOrder(null)}
          onCreated={() => { setRecordingOrder(null); void fetchOrders(); }}
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
    setError(null);

    if (product.stock_quantity <= 0) {
      setError(`${product.name} is out of stock.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);

      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          setError(`Only ${product.stock_quantity} unit(s) of ${product.name} are available.`);
          return prev;
        }

        return prev.map((c) =>
          c.product.id === product.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }

      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setError(null);

    setCart((prev) => prev.map((c) => {
      if (c.product.id !== productId) return c;

      const nextQuantity = c.quantity + delta;

      if (nextQuantity < 1) {
        return c;
      }

      if (nextQuantity > c.product.stock_quantity) {
        setError(`Only ${c.product.stock_quantity} unit(s) of ${c.product.name} are available.`);
        return c;
      }

      return { ...c, quantity: nextQuantity };
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const total = cart.reduce((sum, c) => sum + Number(c.product.price) * c.quantity, 0);

  const formatPrice = (amount: number) => `${currency} ${Number(amount).toLocaleString()}`;

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError('Add at least one product to the order');
      return;
    }

    const stockIssue = cart.find(
      (item) => item.quantity > item.product.stock_quantity
    );

    if (stockIssue) {
      setError(`${stockIssue.product.name} only has ${stockIssue.product.stock_quantity} unit(s) available.`);
      return;
    }

    setError(null);
    setLoading(true);

    const { data, error: orderError } = await supabase.rpc('create_order_atomic', {
      p_business_id: businessId,
      p_customer_id: selectedCustomerId || null,
      p_notes: notes.trim() || null,
      p_items: cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    });

    if (orderError || !data?.ok) {
      setError(orderError?.message ?? 'Could not create the order. Please try again.');
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
                      disabled={product.stock_quantity <= 0}
                      onClick={() => addToCart(product)}
                      className="flex flex-col items-start p-3 glass glass-hover rounded-xl text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
                        <button
                          type="button"
                          disabled={item.quantity >= item.product.stock_quantity}
                          onClick={() => updateQty(item.product.id, 1)}
                          className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-slate-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
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
                <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Order Summary</h3>
                <p className="text-[10px] text-slate-600 mb-3">Stock is deducted when the order is marked completed.</p>
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

function RecordTransferClaimModal({ order, currency, onClose, onCreated }: {
  order: Order;
  currency: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (reference.trim().length > 120 || note.trim().length > 500) {
      setError('Reference must be 120 characters or fewer; note must be 500 characters or fewer.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc('record_manual_bank_transfer', {
        p_order_id: order.id,
        p_transfer_reference: reference.trim() || null,
        p_report_note: note.trim() || null,
      });
      if (rpcError) throw rpcError;
      onCreated();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not record the transfer claim.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="transfer-claim-title" className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-white/[0.09] bg-slate-950 p-5 sm:p-6 shadow-2xl">
        <h2 id="transfer-claim-title" className="text-lg font-semibold text-white">Record bank-transfer claim</h2>
        <p className="text-sm text-slate-400 mt-1">Order: {order.order_number ?? order.id.slice(0, 8)} · {currency} {Number(order.total_amount).toLocaleString()}</p>
        <p className="text-xs leading-relaxed text-amber-200 mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">This creates a pending claim only. Do not use a customer message or receipt screenshot alone as proof that the bank received the funds.</p>
        <form onSubmit={submit} className="space-y-4 mt-4">
          <div><label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="transfer-reference">Transfer reference (optional)</label><input id="transfer-reference" className="w-full rounded-xl border border-white/[0.09] bg-slate-900 px-3 py-2.5 text-sm text-white" maxLength={120} autoComplete="off" value={reference} onChange={(e) => setReference(e.target.value)} /></div>
          <div><label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="transfer-note">Internal note (optional)</label><textarea id="transfer-note" className="w-full min-h-20 rounded-xl border border-white/[0.09] bg-slate-900 px-3 py-2.5 text-sm text-white" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></div>
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2"><button type="button" disabled={saving} onClick={onClose} className="px-4 py-2.5 rounded-xl border border-white/[0.09] text-sm text-slate-300 disabled:opacity-50">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl bg-emerald-500 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save as pending'}</button></div>
        </form>
      </section>
    </div>
  );
}
