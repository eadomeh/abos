import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import { supabase } from '@/lib/supabase';
import ImageCropEditor from '@/components/ImageCropEditor';
import { cropImageFile } from '@/lib/imageCrop';
import type { Product } from '@/types/database';
import {
  Package, Plus, Search, Pencil, Trash2, X, Loader2, AlertCircle,
  Box, ArrowRight, Filter, TrendingUp,
} from 'lucide-react';

export default function ProductsPage() {
  const { activeBusiness } = useBusiness();
  const canManageProducts = ['owner', 'admin', 'agent'].includes(activeBusiness?.role ?? '');
  const canDeleteProducts = activeBusiness?.role === 'owner';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Product | null>(null);
  const [showStockAdjust, setShowStockAdjust] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!activeBusiness) { setProducts([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', activeBusiness.id)
      .order('created_at', { ascending: false });
    if (error) {
      setProducts([]);
    } else {
      setProducts(data as Product[]);
    }
    setLoading(false);
  }, [activeBusiness]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[]];

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    const cur = activeBusiness?.currency ?? 'NGN';
    return `${cur} ${Number(price).toLocaleString()}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Products</h1>
          <p className="text-sm text-slate-500 mt-1">
            {canManageProducts
              ? 'Manage your product catalog and inventory'
              : 'Read-only view of your product catalog and inventory'}
          </p>
        </div>
        {canManageProducts && (
          <button
            onClick={() => { setEditingProduct(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 glass rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>
        {categories.length > 1 && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 glass rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer min-w-[160px]"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#0B141A]">
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
            <Box className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-400 mb-2">
            {products.length === 0 ? 'No Products Yet' : 'No Results'}
          </h3>
          <p className="text-sm text-slate-600 max-w-md mb-6">
            {products.length === 0
              ? 'Add your first product to start building your catalog.'
              : 'Try a different search or filter.'}
          </p>
          {products.length === 0 && canManageProducts && (
            <button
              onClick={() => { setEditingProduct(null); setShowModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Your First Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="glass glass-hover rounded-2xl p-5 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-slate-400" />
                </div>
                {canManageProducts && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Adjust stock"
                      aria-label={`Adjust stock for ${product.name}`}
                      onClick={() => setShowStockAdjust(product)}
                      className="p-2 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Edit product"
                      aria-label={`Edit ${product.name}`}
                      onClick={() => { setEditingProduct(product); setShowModal(true); }}
                      className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {canDeleteProducts && (
                      <button
                        type="button"
                        title="Delete product"
                        aria-label={`Delete ${product.name}`}
                        onClick={() => setShowDeleteConfirm(product)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="w-full aspect-[4/3] mb-4 overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.025] flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(event) => { event.currentTarget.style.opacity = '0.25'; }}
                  />
                ) : (
                  <Package className="w-8 h-8 text-slate-700" />
                )}
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 truncate">{product.name}</h3>
              {product.description && (
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{product.description}</p>
              )}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-600">Selling price</p>
                  <p className="text-sm font-bold text-emerald-400 mt-1">{formatPrice(product.price)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-600">
                    <TrendingUp className="w-3 h-3" />
                    Margin
                  </div>
                  <p className={`text-sm font-semibold mt-1 ${product.price >= product.cost_price ? 'text-slate-200' : 'text-red-400'}`}>
                    {formatMargin(product.price, product.cost_price)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">
                  Stock: <span className="text-slate-200 font-medium">{product.stock_quantity}</span>
                </span>
                <span className={`text-[10px] px-2 py-1 rounded-md ${
                  product.stock_quantity === 0
                    ? 'bg-red-500/10 text-red-400'
                    : product.stock_quantity <= product.low_stock_threshold
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {product.stock_quantity === 0
                    ? 'Out of stock'
                    : product.stock_quantity <= product.low_stock_threshold
                      ? 'Low stock'
                      : 'In stock'}
                </span>
              </div>
              {product.category && (
                <span className="inline-block mt-3 text-[10px] px-2 py-0.5 bg-white/[0.06] rounded-md text-slate-400">
                  {product.category}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && canManageProducts && (
        <ProductModal
          product={editingProduct}
          businessId={activeBusiness!.id}
          currency={activeBusiness?.currency ?? 'NGN'}
          onClose={() => { setShowModal(false); setEditingProduct(null); }}
          onSaved={() => { setShowModal(false); setEditingProduct(null); fetchProducts(); }}
        />
      )}

      {showStockAdjust && canManageProducts && (
        <StockAdjustModal
          product={showStockAdjust}
          onClose={() => setShowStockAdjust(null)}
          onSaved={() => { setShowStockAdjust(null); fetchProducts(); }}
        />
      )}

      {showDeleteConfirm && canDeleteProducts && (
        <DeleteConfirm
          product={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          onDeleted={() => { setShowDeleteConfirm(null); fetchProducts(); }}
        />
      )}
    </div>
  );
}

function ProductModal({ product, businessId, currency, onClose, onSaved }: {
  product: Product | null;
  businessId: string;
  currency: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
  const [costPrice, setCostPrice] = useState(product?.cost_price?.toString() ?? '0');
  const [stock, setStock] = useState(product?.stock_quantity?.toString() ?? '0');
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.low_stock_threshold?.toString() ?? '5');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePositionX, setImagePositionX] = useState(50);
  const [imagePositionY, setImagePositionY] = useState(50);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Product name is required'); return; }
    if (!price || isNaN(Number(price)) || Number(price) < 0) { setError('Valid price is required'); return; }

    setError(null);
    setLoading(true);

    const numericPrice = Number(price);
    const numericCost = Number(costPrice);
    const numericStock = Math.max(0, Math.floor(Number(stock) || 0));
    const numericThreshold = Math.max(0, Math.floor(Number(lowStockThreshold) || 0));

    if (Number.isNaN(numericCost) || numericCost < 0) {
      setError('Valid cost price is required');
      setLoading(false);
      return;
    }

    if (Number.isNaN(Number(stock)) || Number(stock) < 0) {
      setError('Stock quantity cannot be negative');
      setLoading(false);
      return;
    }

    if (Number.isNaN(Number(lowStockThreshold)) || Number(lowStockThreshold) < 0) {
      setError('Low-stock threshold cannot be negative');
      setLoading(false);
      return;
    }

    const productId = product?.id ?? crypto.randomUUID();
    let uploadedPath: string | null = null;
    let nextImageUrl = imageUrl.trim() || null;

    try {
      if (imageFile) {
        const croppedImage = await cropImageFile(
          imageFile, 4 / 3, imageZoom, imagePositionX, imagePositionY,
        );

        if (croppedImage.size > 5 * 1024 * 1024) {
          throw new Error('The cropped product photo exceeds 5 MB. Choose a smaller image.');
        }

        const candidatePath =
          `${businessId}/products/${productId}/${crypto.randomUUID()}.webp`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(candidatePath, croppedImage, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/webp',
          });

        if (uploadError) {
          setError(`Photo upload failed: ${uploadError.message}`);
          return;
        }

        uploadedPath = candidatePath;
        const { data: publicUrl } = supabase.storage
          .from('product-images')
          .getPublicUrl(candidatePath);
        nextImageUrl = publicUrl.publicUrl;
      }

      const payload = {
        business_id: businessId,
        name: name.trim(),
        description: description.trim() || null,
        price: numericPrice,
        cost_price: numericCost,
        currency,
        stock_quantity: product ? product.stock_quantity : numericStock,
        low_stock_threshold: numericThreshold,
        sku: sku.trim() || null,
        category: category.trim() || null,
        image_url: nextImageUrl,
        is_active: isActive,
      };

      const result = product
        ? await supabase.from('products').update(payload).eq('id', product.id)
        : await supabase.from('products').insert({ ...payload, id: productId });

      if (result.error) {
        if (uploadedPath) {
          await supabase.storage.from('product-images').remove([uploadedPath]);
          uploadedPath = null;
        }
        setError(`Could not save the product: ${result.error.message}`);
        return;
      }

      if (uploadedPath && product?.image_url) {
        try {
          const marker = '/storage/v1/object/public/product-images/';
          const oldPath = new URL(product.image_url).pathname;
          const markerIndex = oldPath.indexOf(marker);
          if (markerIndex >= 0) {
            const previousPath = decodeURIComponent(oldPath.slice(markerIndex + marker.length));
            if (previousPath && previousPath !== uploadedPath) {
              await supabase.storage.from('product-images').remove([previousPath]);
            }
          }
        } catch {
          // External image URLs do not need Storage cleanup.
        }
      }

      onSaved();
    } catch (cause) {
      if (uploadedPath) {
        await supabase.storage.from('product-images').remove([uploadedPath]);
      }
      setError(cause instanceof Error ? cause.message : 'Could not save the product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-lg glass rounded-2xl shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-semibold text-white">{product ? 'Edit Product' : 'Add Product'}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Product name" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description" rows={2} className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Selling Price ({currency})</label>
              <input type="number" step="0.01" min="0" required value={price} onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Cost Price ({currency})</label>
              <input type="number" step="0.01" min="0" required value={costPrice} onChange={(e) => setCostPrice(e.target.value)}
              placeholder="0.00" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">{product ? 'Current Stock' : 'Initial Stock'}</label>
              <input
                type="number"
                min="0"
                value={stock}
                readOnly={Boolean(product)}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-60"
              />
              {product && <p className="text-[10px] text-slate-600 mt-1.5">Use Adjust Stock on the product card to change existing inventory.</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Low Stock Alert At</label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                placeholder="5"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Category</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Fashion" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">SKU</label>
              <input type="text" value={sku} onChange={(e) => setSku(e.target.value)}
              placeholder="Optional" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
              Product photo
            </label>

            {imagePreview ? (
              <ImageCropEditor
                src={imagePreview}
                alt="Product photo crop preview"
                aspectRatio={4 / 3}
                zoom={imageZoom}
                positionX={imagePositionX}
                positionY={imagePositionY}
                onZoomChange={setImageZoom}
                onPositionXChange={setImagePositionX}
                onPositionYChange={setImagePositionY}
              />
            ) : imageUrl ? (
              <div className="w-full aspect-[4/3] overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]">
                <img
                  src={imageUrl}
                  alt="Current product photo"
                  className="w-full h-full object-cover"
                  onError={(event) => { event.currentTarget.style.opacity = '0.25'; }}
                />
              </div>
            ) : (
              <div className="w-full aspect-[4/3] rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] flex flex-col items-center justify-center gap-2">
                <Package className="w-8 h-8 text-slate-600" />
                <p className="text-xs text-slate-500">Select a photo to preview and adjust it</p>
              </div>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                if (!file) return;

                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                  setError('Product photos must be JPEG, PNG, or WebP.');
                  event.currentTarget.value = '';
                  return;
                }
                if (file.size > 5 * 1024 * 1024) {
                  setError('Product photos must be 5 MB or smaller.');
                  event.currentTarget.value = '';
                  return;
                }

                setError(null);
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
                setImageZoom(1);
                setImagePositionX(50);
                setImagePositionY(50);
              }}
              className="block w-full text-xs text-slate-400 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-emerald-500/10 file:text-emerald-300 hover:file:bg-emerald-500/20"
            />
            <p className="text-[11px] text-slate-600">
              JPEG, PNG or WebP · Maximum 5 MB. Adjust the 4:3 crop before saving.
            </p>
            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  setImageZoom(1);
                  setImagePositionX(50);
                  setImagePositionY(50);
                  if (imageInputRef.current) imageInputRef.current.value = '';
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Discard selected photo
              </button>
            )}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-white/[0.08] bg-white/[0.03] accent-emerald-500" />
            <span className="text-sm text-slate-300">Product is active and visible</span>
          </label>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{product ? 'Save Changes' : 'Add Product'} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatMargin(price: number, cost: number) {
  const margin = Number(price) - Number(cost);
  const percent = Number(price) > 0 ? (margin / Number(price)) * 100 : 0;
  return `${margin >= 0 ? '+' : ''}${margin.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${percent.toFixed(1)}%)`;
}

type InventoryReason = 'sale' | 'restock' | 'adjustment' | 'return' | 'damage' | 'correction';

function StockAdjustModal({ product, onClose, onSaved }: {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [quantityChange, setQuantityChange] = useState('');
  const [reason, setReason] = useState<InventoryReason>('adjustment');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const delta = Number(quantityChange);

    if (!Number.isInteger(delta) || delta === 0) {
      setError('Enter a non-zero whole number, e.g. +10 or -2.');
      return;
    }

    setError(null);
    setLoading(true);

    const { error: rpcError } = await supabase.rpc('adjust_product_stock', {
      p_product_id: product.id,
      p_quantity_change: delta,
      p_reason: reason,
      p_note: note.trim() || null,
      p_reference_type: null,
      p_reference_id: null,
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md glass rounded-2xl shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-emerald-400">Inventory</p>
            <h2 className="text-lg font-semibold text-white mt-1">Adjust Stock</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
            <p className="text-sm font-semibold text-white truncate">{product.name}</p>
            <p className="text-xs text-slate-500 mt-1">Current stock: {product.stock_quantity}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Quantity Change</label>
            <input
              type="number"
              step="1"
              required
              value={quantityChange}
              onChange={(e) => setQuantityChange(e.target.value)}
              placeholder="+10 or -2"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
            />
            <p className="text-[10px] text-slate-600 mt-1.5">Use a positive number to add stock or a negative number to remove it.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as InventoryReason)}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
            >
              <option value="adjustment" className="bg-[#0B141A]">Adjustment</option>
              <option value="restock" className="bg-[#0B141A]">Restock</option>
              <option value="sale" className="bg-[#0B141A]">Sale</option>
              <option value="return" className="bg-[#0B141A]">Return</option>
              <option value="damage" className="bg-[#0B141A]">Damage</option>
              <option value="correction" className="bg-[#0B141A]">Correction</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Optional reason or context"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply Stock Change'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ product, onClose, onDeleted }: {
  product: Product;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (error) {
      setLoading(false);
    } else {
      onDeleted();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-sm glass rounded-2xl shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Delete Product?</h3>
        <p className="text-sm text-slate-500 mb-6">
          "{product.name}" will be permanently removed from your catalog.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 hover:text-white text-sm font-medium transition-all">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 py-2.5 bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
