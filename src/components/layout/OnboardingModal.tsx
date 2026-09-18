import { useState, type FormEvent } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import {
  Building2, Store, UtensilsCrossed, Wrench, Scissors, Shirt, Watch,
  Smartphone, Home, Heart, Sparkles, X, Loader2, AlertCircle, ArrowRight,
  Check, MapPin, Phone, User, MessageCircle,
} from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
}

const allCategories = [
  { id: 'fashion', label: 'Fashion', icon: Shirt },
  { id: 'accessories', label: 'Accessories', icon: Watch },
  { id: 'beauty', label: 'Beauty', icon: Scissors },
  { id: 'barbing', label: 'Barbing', icon: Scissors },
  { id: 'food', label: 'Food & Restaurant', icon: UtensilsCrossed },
  { id: 'electronics', label: 'Electronics', icon: Smartphone },
  { id: 'home', label: 'Home & Living', icon: Home },
  { id: 'health', label: 'Health & Wellness', icon: Heart },
  { id: 'jewelry', label: 'Jewelry', icon: Sparkles },
  { id: 'services', label: 'Services', icon: Wrench },
  { id: 'retail', label: 'Retail / Shop', icon: Store },
  { id: 'general', label: 'General', icon: Building2 },
];

const countries = [
  { code: 'Nigeria', currency: 'NGN', flag: 'NG' },
  { code: 'Ghana', currency: 'GHS', flag: 'GH' },
  { code: 'Kenya', currency: 'KES', flag: 'KE' },
  { code: 'South Africa', currency: 'ZAR', flag: 'ZA' },
  { code: 'Uganda', currency: 'UGX', flag: 'UG' },
  { code: 'Tanzania', currency: 'TZS', flag: 'TZ' },
  { code: 'Rwanda', currency: 'RWF', flag: 'RW' },
  { code: 'Egypt', currency: 'EGP', flag: 'EG' },
  { code: 'Morocco', currency: 'MAD', flag: 'MA' },
  { code: 'Senegal', currency: 'XOF', flag: 'SN' },
];

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const { createBusiness } = useBusiness();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [currency, setCurrency] = useState('NGN');
  const [customCategory, setCustomCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const addCustomCategory = () => {
    const trimmed = customCategory.trim().toLowerCase();
    if (trimmed && !selectedCategories.includes(trimmed)) {
      setSelectedCategories((prev) => [...prev, trimmed]);
      setCustomCategory('');
    }
  };

  const handleCountryChange = (c: string) => {
    setCountry(c);
    const found = countries.find((co) => co.code === c);
    if (found) setCurrency(found.currency);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Business name is required'); return; }
    if (!ownerName.trim()) { setError('Your name is required'); return; }
    if (!phone.trim()) { setError('Phone number is required'); return; }
    if (selectedCategories.length === 0) { setError('Select at least one category'); return; }

    setError(null);
    setLoading(true);
    const result = await createBusiness({
      name: name.trim(),
      description: description.trim(),
      categories: selectedCategories,
      owner_name: ownerName.trim(),
      phone: phone.trim(),
      whatsapp_number: whatsapp.trim(),
      country,
      currency,
    });
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onClose();
    }
  };

  const canProceedStep1 = name.trim().length > 0 && selectedCategories.length > 0;
  const canProceedStep2 = ownerName.trim().length > 0 && phone.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-xl glass rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Building2 className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Set Up Your Workspace</h2>
              <p className="text-xs text-slate-500">Step {step} of 2 — ABOS will tailor your dashboard to your business</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 px-6 pt-4">
          <div className={`h-1 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-emerald-500' : 'bg-white/[0.06]'}`} />
          <div className={`h-1 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-emerald-500' : 'bg-white/[0.06]'}`} />
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {step === 1 && (
            <>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                  <Building2 className="w-3 h-3" /> Business Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ada's Fashion Store"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                  <Store className="w-3 h-3" /> What does your business do?
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what you sell or the services you offer"
                  rows={2}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all resize-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                  <Sparkles className="w-3 h-3" /> Business Categories
                  <span className="text-slate-600 normal-case tracking-normal">— pick all that apply</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allCategories.map((cat) => {
                    const Icon = cat.icon;
                    const selected = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                          selected
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:border-white/[0.12]'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{cat.label}</span>
                        {selected && <Check className="w-3 h-3 ml-auto flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom category */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomCategory(); } }}
                    placeholder="Add custom category..."
                    className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addCustomCategory}
                    className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
                  >
                    Add
                  </button>
                </div>

                {/* Selected chips */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedCategories.map((catId) => (
                      <span key={catId} className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[11px] text-emerald-400">
                        {catId}
                        <button type="button" onClick={() => toggleCategory(catId)} className="hover:text-emerald-300">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <button
                type="button"
                disabled={!canProceedStep1}
                onClick={() => { setError(null); setStep(2); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                  <User className="w-3 h-3" /> Your Name
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Ada Okafor"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                    <Phone className="w-3 h-3" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                    <span className="text-slate-600 normal-case tracking-normal">— optional</span>
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Same as phone if empty"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                    <MapPin className="w-3 h-3" /> Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code} className="bg-[#0B141A]">{c.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="NGN"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setError(null); setStep(1); }}
                  className="px-5 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !canProceedStep2}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Create Workspace
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
