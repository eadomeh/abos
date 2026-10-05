import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { BusinessMembership, BusinessRole } from '@/types/database';
import {
  Building2, Users, AlertTriangle, Loader2,
  AlertCircle, Check, Trash2, UserPlus, Shield,
  Mail, Phone, MapPin, MessageCircle, ArrowRight, Crown,
  CheckCircle2, CircleDot, Facebook,
} from 'lucide-react';

type FacebookSdk = {
  init: (options: { appId: string; autoLogAppEvents: boolean; version: string }) => void;
  login: (
    callback: (response: {
      authResponse?: { code?: string };
      status?: string;
      error?: { message?: string };
    }) => void,
    options: {
      config_id: string;
      response_type: 'code';
      override_default_response_type: boolean;
      extras: { sessionInfoVersion: number };
    },
  ) => void;
};

declare global {
  interface Window {
    FB?: FacebookSdk;
  }
}

export default function SettingsPage() {
  const { activeBusiness, refreshBusinesses } = useBusiness();
  const { user } = useAuth();
  const [tab, setTab] = useState<'business' | 'whatsapp' | 'team' | 'danger'>('business');

  if (!activeBusiness) return null;

  const isOwner = activeBusiness.role === 'owner';

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 overflow-x-hidden">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your business and team</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 glass rounded-xl max-w-full overflow-x-auto mb-6">
        {([
          { id: 'business', label: 'Business', icon: Building2 },
          { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
          { id: 'team', label: 'Team', icon: Users },
          { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
        ] as const).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                tab === t.id
                  ? t.id === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'business' && <BusinessTab businessId={activeBusiness.id} canEdit={isOwner} />}
      {tab === 'whatsapp' && <WhatsAppTab businessId={activeBusiness.id} canEdit={isOwner} />}
      {tab === 'team' && <TeamTab businessId={activeBusiness.id} isOwner={isOwner} currentUserId={user?.id ?? ''} />}
      {tab === 'danger' && <DangerTab businessId={activeBusiness.id} businessName={activeBusiness.name} canDelete={isOwner} onDeleted={() => refreshBusinesses()} />}
    </div>
  );
}

function BusinessTab({ businessId, canEdit }: { businessId: string; canEdit: boolean }) {
  const { activeBusiness, refreshBusinesses } = useBusiness();
  const [name, setName] = useState(activeBusiness?.name ?? '');
  const [description, setDescription] = useState(activeBusiness?.description ?? '');
  const [phone, setPhone] = useState(activeBusiness?.phone ?? '');
  const [whatsapp, setWhatsapp] = useState(activeBusiness?.whatsapp_number ?? '');
  const [country, setCountry] = useState(activeBusiness?.country ?? '');
  const [currency, setCurrency] = useState(activeBusiness?.currency ?? 'NGN');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Business name is required'); return; }
    setError(null);
    setLoading(true);

    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        name: name.trim(),
        description: description.trim() || null,
        phone: phone.trim() || null,
        whatsapp_number: whatsapp.trim() || null,
        country: country.trim() || null,
        currency: currency.trim() || 'NGN',
      })
      .eq('id', businessId);

    if (updateError) {
      setError('Could not save changes. Please try again.');
      setLoading(false);
    } else {
      setSaved(true);
      setLoading(false);
      await refreshBusinesses();
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (!canEdit) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <Shield className="w-8 h-8 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Only the business owner can edit business details.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
          <Building2 className="w-3 h-3" /> Business Name
        </label>
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
          className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all resize-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
            <Phone className="w-3 h-3" /> Phone
          </label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
            <MessageCircle className="w-3 h-3" /> WhatsApp
          </label>
          <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
            <MapPin className="w-3 h-3" /> Country
          </label>
          <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Currency</label>
          <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{saved ? <><Check className="w-4 h-4" /> Saved!</> : <>Save Changes <ArrowRight className="w-4 h-4" /></>}</>}
        </button>
      </div>
    </form>
  );
}

function TeamTab({ businessId, isOwner, currentUserId }: {
  businessId: string;
  isOwner: boolean;
  currentUserId: string;
}) {
  const [members, setMembers] = useState<BusinessMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<BusinessRole>('agent');
  const [error, setError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('business_memberships')
      .select('id, business_id, user_id, role, created_at')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });

    if (data) {
      setMembers(data as BusinessMembership[]);
    }
    setLoading(false);
  }, [businessId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) { setError('Email is required'); return; }
    setError(null);
    setInviteLoading(true);

    // Look up user by email - in Supabase we need to query auth.users
    // Since we can't directly, we'll use a different approach:
    // Try to find the user via their email in auth.users using a helper
    const { data: userData, error: userError } = await supabase
      .rpc('get_user_id_by_email', { email: inviteEmail.trim() });

    if (userError || !userData) {
      setError('Could not find a user with that email. They need to sign up first.');
      setInviteLoading(false);
      return;
    }

    const userId = userData as string;

    // Check if already a member
    const existing = members.find((m) => m.user_id === userId);
    if (existing) {
      setError('This person is already a team member.');
      setInviteLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('business_memberships')
      .insert({ business_id: businessId, user_id: userId, role: inviteRole });

    if (insertError) {
      setError('Could not add team member. They may need to create an account first.');
      setInviteLoading(false);
    } else {
      setShowInvite(false);
      setInviteEmail('');
      setInviteRole('agent');
      fetchMembers();
    }
  };

  const handleRemoveMember = async (memberId: string, userId: string) => {
    if (userId === currentUserId) return; // Can't remove yourself
    await supabase.from('business_memberships').delete().eq('id', memberId);
    fetchMembers();
  };

  const handleRoleChange = async (memberId: string, role: BusinessRole) => {
    await supabase.from('business_memberships').update({ role }).eq('id', memberId);
    fetchMembers();
  };

  const roleConfig: Record<BusinessRole, { label: string; color: string; icon: typeof Crown }> = {
    owner: { label: 'Owner', color: 'text-amber-400 bg-amber-500/10', icon: Crown },
    admin: { label: 'Admin', color: 'text-blue-400 bg-blue-500/10', icon: Shield },
    agent: { label: 'Agent', color: 'text-teal-400 bg-teal-500/10', icon: Users },
    viewer: { label: 'Viewer', color: 'text-slate-400 bg-white/[0.06]', icon: Users },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Team Members</h3>
            <span className="text-xs text-slate-500">({members.length})</span>
          </div>
          {isOwner && (
            <button
              onClick={() => setShowInvite(!showInvite)}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Member
            </button>
          )}
        </div>

        {showInvite && (
          <form onSubmit={handleInvite} className="mb-4 p-4 glass rounded-xl space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@example.com"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Role</label>
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as BusinessRole)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer">
                <option value="admin" className="bg-[#0B141A]">Admin — can manage everything except deleting</option>
                <option value="agent" className="bg-[#0B141A]">Agent — can manage products, orders, customers</option>
                <option value="viewer" className="bg-[#0B141A]">Viewer — read-only access</option>
              </select>
            </div>
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => { setShowInvite(false); setError(null); }}
                className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 hover:text-white text-xs font-medium transition-all">
                Cancel
              </button>
              <button type="submit" disabled={inviteLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-medium rounded-xl transition-all disabled:opacity-50">
                {inviteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><UserPlus className="w-3.5 h-3.5" /> Add to Team</>}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {members.map((member) => {
            const isYou = member.user_id === currentUserId;
            return (
              <div key={member.id} className="flex items-center gap-3 p-3 glass rounded-xl">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-sm font-medium text-white">
                  {member.user_id.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {isYou ? 'You' : `User ${member.user_id.slice(0, 8)}`}
                    {member.role === 'owner' && <Crown className="inline w-3.5 h-3.5 text-amber-400 ml-1.5" />}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${roleConfig[member.role].color}`}>
                      {roleConfig[member.role].label}
                    </span>
                  </div>
                </div>
                {isOwner && member.role !== 'owner' && (
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as BusinessRole)}
                      className="px-2 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-slate-300 text-xs focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="admin" className="bg-[#0B141A]">Admin</option>
                      <option value="agent" className="bg-[#0B141A]">Agent</option>
                      <option value="viewer" className="bg-[#0B141A]">Viewer</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(member.id, member.user_id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white mb-1">How team access works</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Team members must create an ABOS account with the same email you invite. Once added, they can access this business workspace with permissions based on their role. Only the owner can manage team members and delete the business.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhatsAppTab({ businessId, canEdit }: { businessId: string; canEdit: boolean }) {
  const [connection, setConnection] = useState<{
    phone_number_id: string;
    waba_id: string;
    display_phone_number: string | null;
    verified_name: string | null;
    quality_rating: string | null;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showConnectFlow, setShowConnectFlow] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const embeddedSignupRef = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState<'idle' | 'launching' | 'authorizing' | 'received' | 'error' | 'cancelled'>(
    'idle',
  );
  const [embeddedSignupData, setEmbeddedSignupData] = useState<{
    auth_code?: string;
    waba_id?: string;
    phone_number_id?: string;
    display_phone_number?: string;
    verified_name?: string;
  } | null>(null);

  // Meta Embedded Signup v4 configuration - use public environment-driven config only
  const metaAppId = import.meta.env.VITE_META_APP_ID ?? '';
  const embeddedSignupConfigId = import.meta.env.VITE_META_EMBEDDED_SIGNUP_CONFIG_ID ?? '';

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: invokeError } = await supabase.functions.invoke('whatsapp-connection', {
      body: { action: 'status', businessId },
    });

    if (invokeError) {
      setError('Could not load WhatsApp connection status.');
      setLoading(false);
      return;
    }

    const next = data?.connection ?? null;
    setConnection(next);
    setLoading(false);
  }, [businessId]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  // Load Facebook JavaScript SDK dynamically and initialize with app ID
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!metaAppId) {
      setSdkError('Meta App ID is not configured.');
      return;
    }

    const initializeSdk = () => {
      const fb = window.FB;
      if (!fb) {
        setSdkError('Meta JavaScript SDK failed to load.');
        setSdkReady(false);
        return;
      }

      fb.init({
        appId: metaAppId,
        autoLogAppEvents: true,
        version: 'v16.0',
      });
      setSdkReady(true);
    };

    if (window.FB) {
      initializeSdk();
      return;
    }

    const existing = window.document.getElementById('facebook-jssdk');
    if (existing) {
      existing.addEventListener('load', initializeSdk);
      return () => existing.removeEventListener('load', initializeSdk);
    }

    const js = window.document.createElement('script');
    js.id = 'facebook-jssdk';
    js.async = true;
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    js.onload = initializeSdk;
    js.onerror = () => setSdkError('Meta JavaScript SDK failed to load.');
    window.document.head.appendChild(js);

    return () => {
      js.onload = null;
      js.onerror = null;
    };
  }, [metaAppId]);

  // Receive the Embedded Signup session event.
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      try {
        const hostname = new URL(event.origin).hostname;
        const allowed =
          hostname === 'facebook.com' || hostname.endsWith('.facebook.com');
        if (!allowed) return;

        const data =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (data?.type !== 'WA_EMBEDDED_SIGNUP') return;

        const eventName = String(data.event ?? '').toUpperCase();

        if (
          eventName === 'FINISH' ||
          eventName === 'FINISH_ONLY_WABA' ||
          eventName === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'
        ) {
          setEmbeddedSignupData((prev) => ({
            ...prev,
            waba_id: data.data?.waba_id,
            phone_number_id: data.data?.phone_number_id,
            display_phone_number: data.data?.display_phone_number,
            verified_name: data.data?.verified_name,
          }));
          setState('authorizing');
          return;
        }

        if (eventName === 'CANCEL') {
          setSdkError('WhatsApp Embedded Signup was cancelled.');
          setState('cancelled');
          setShowConnectFlow(false);
          return;
        }

        if (eventName === 'ERROR') {
          setSdkError(
            data.data?.error_message ?? 'WhatsApp Embedded Signup failed.',
          );
          setState('error');
          setShowConnectFlow(false);
        }
      } catch {
        // Ignore unrelated postMessage events.
      }
    };

    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, []);

  useEffect(() => {
    if (
      embeddedSignupData?.auth_code &&
      embeddedSignupData?.waba_id &&
      embeddedSignupData?.phone_number_id
    ) {
      setState('received');
      setShowConnectFlow(false);
    }
  }, [embeddedSignupData]);

  const launchEmbeddedSignup = () => {
    setEmbeddedSignupData(null);
    setShowConnectFlow(true);
    setState('launching');
    setSdkError(null);

    if (!embeddedSignupConfigId) {
      setSdkError('Meta Embedded Signup configuration is not configured.');
      setState('error');
      return;
    }

    if (!sdkReady || !window.FB) {
      setSdkError('Meta JavaScript SDK is still loading. Please wait a moment and try again.');
      setState('error');
      return;
    }

    window.FB.login(
      {
        config_id: embeddedSignupConfigId,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          sessionInfoVersion: 3,
        },
      },
      (response) => {
        if (response.error) {
          setSdkError(response.error.message ?? 'Meta Embedded Signup was cancelled or failed.');
          setState('error');
          return;
        }

        if (response.authResponse) {
          setEmbeddedSignupData((prev) => ({
            ...prev,
            auth_code: response.authResponse.code,
          }));
          setState('authorizing');
          return;
        }

        setSdkError('Meta Embedded Signup returned no authorization response.');
        setState('error');
      },
    );
  };

  const handleCancel = () => {
    setShowConnectFlow(false);
    setSdkError(null);
  };

  if (!canEdit) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <Shield className="w-8 h-8 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Only the business owner can configure WhatsApp.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>;
  }


  return (
    <div className="space-y-4">
      <div className={
        'glass rounded-2xl p-5 border ' + (connection ? 'border-emerald-500/20' : 'border-amber-500/20')
      }>
        <div className="flex items-center gap-4">
          <div className={
            'w-10 h-10 rounded-xl flex items-center justify-center ' + (connection ? 'bg-emerald-500/15' : 'bg-amber-500/15')
          }>
            {connection ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <CircleDot className="w-5 h-5 text-amber-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white">
              {connection ? (connection.verified_name || 'WhatsApp Connected') : 'WhatsApp Not Connected'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {connection?.display_phone_number ?? 'Connect a WhatsApp Business number to activate customer conversations.'}
            </p>
          </div>
          {connection && (
            <span className="text-[10px] px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 uppercase tracking-wide font-semibold">
              {connection.quality_rating ?? 'Connected'}
            </span>
          )}
          <button
            type="button"
            onClick={launchEmbeddedSignup}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs font-medium transition-all"
          >
            <Facebook className="w-3.5 h-3.5" />
            {connection ? 'Reconnect with Meta' : 'Connect with Meta'}
          </button>
        </div>
      </div>

      {/* Webhook endpoint UI - preserved from existing ABOS setup */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Webhook endpoint</h3>
            <p className="text-xs text-slate-500 mt-1">Use this HTTPS endpoint in Meta's WhatsApp webhook configuration.</p>
          </div>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(import.meta.env.VITE_SUPABASE_URL + '/functions/v1/whatsapp-webhook');
            }}
            type="button"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-xs text-slate-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 text-slate-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20 21v2h-2v-2h-3v2H7v-2H4v-3h2V7h3v2H7v3h2v-3h3v-2h-2v-3h-3v-2h-3v2H2v-2h2v3h3v-2h-3v2H1v2h2v3h3v-2h-3v2H0v2h2v3h3v-2h-3ZM7 5.3L5.3 7H5v3h2v-3h2v3h2V7h-2V5.3zM3 15v2H1v-2h2v3h3v-2h2v-3h2v3h3v-2h-2v-3H3v-2zM21 15v2h-2v-2h-3v2H11v-2H8v2H5v-3h2V15h2v3h3v-2h-2v-3H20v-2h-2v3h2v-3h3v2h-3Z" />
            </svg>
            Copy
          </button>
        </div>
        <code className="block px-3 py-3 bg-black/30 rounded-xl text-[11px] text-emerald-400 overflow-x-auto whitespace-nowrap">
          {import.meta.env.VITE_SUPABASE_URL + '/functions/v1/whatsapp-webhook'}
        </code>
        <p className="text-[11px] text-slate-600 mt-3">
          Subscribe the <span className="text-slate-400">messages</span> field in Meta. ABOS verifies Meta webhook signatures server-side.
        </p>
      </div>

      {/* Embedded Signup v4 Flow - replaces manual credential form */}
      {state === 'received' && (
        <div className="glass rounded-2xl p-6 border border-emerald-500/20">
          <h3 className="text-sm font-semibold text-white">Authorization received</h3>
          <p className="text-xs text-slate-500 mt-1">
            Authorization received — finishing setup…
          </p>
          {embeddedSignupData && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {embeddedSignupData.phone_number_id && (
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[10px] uppercase tracking-wide text-slate-600">Phone Number ID</p>
                  <p className="text-xs text-slate-300 break-all">{embeddedSignupData.phone_number_id}</p>
                </div>
              )}
              {embeddedSignupData.waba_id && (
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[10px] uppercase tracking-wide text-slate-600">WABA ID</p>
                  <p className="text-xs text-slate-300 break-all">{embeddedSignupData.waba_id}</p>
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-slate-500 mt-3">
            The authorization code and WABA/phone metadata will be sent to the backend in the next step (SET-004).
          </p>
        </div>
      )}

      {showConnectFlow && !sdkReady && (
        <div className="glass rounded-2xl p-6 border border-red-500/20">
          <h3 className="text-sm font-semibold text-white">SDK Not Available</h3>
          <p className="text-xs text-slate-500 mt-1">
            Meta JavaScript SDK is required for Embedded Signup. Please ensure the SDK is loaded.
          </p>
        </div>
      )}

      {showConnectFlow && sdkReady && (
        <div className="glass rounded-2xl p-6 border border-emerald-500/20">
          <h3 className="text-sm font-semibold text-white">Connect WhatsApp Business</h3>
          <p className="text-xs text-slate-500 mt-1">
            Connecting via Meta Embedded Signup v4. No access tokens are stored in the browser.
          </p>

          {sdkError ? (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-300">{sdkError}</p>
            </div>
          ) : null}

          {/* Meta Embedded Signup v4 button - triggers FB.login */}
          {!connection && (
            <button
              ref={embeddedSignupRef}
              type="button"
              disabled={!sdkReady || !embeddedSignupConfigId}
              onClick={launchEmbeddedSignup}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <Facebook className="w-4 h-4" /> Connect with Facebook
            </button>
          )}

          {connection ? (
            <p className="text-xs text-slate-500 mt-3">WhatsApp Business connected successfully.</p>
          ) : null}

          {/* Cancellation button */}
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 hover:text-white text-xs font-medium transition-all mt-3"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Fallback: show manual mode note when SDK not available when not in flow */}
      {connection && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Connected number</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] uppercase tracking-wide text-slate-600">Phone Number ID</p>
                <p className="text-xs text-slate-300 mt-1 break-all">{connection.phone_number_id}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] uppercase tracking-wide text-slate-600">WABA ID</p>
                <p className="text-xs text-slate-300 mt-1 break-all">{connection.waba_id}</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              setConnection(null);
              setSaving(true);
              const { data, error: invokeError } = await supabase.functions.invoke('whatsapp-connection', {
                body: { action: 'disconnect', businessId },
              });

              if (invokeError || !data?.success) {
                setError(data?.error ?? 'Could not disconnect WhatsApp.');
                setSaving(false);
                return;
              }

              setSaving(false);
            }}
            disabled={saving} className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-xl border border-red-500/20 disabled:opacity-50"
          >
            {saving ? 'Working…' : 'Disconnect WhatsApp'}
          </button>
        </div>
      )}
    </div>
  );
}

function DangerTab({ businessId, businessName, canDelete, onDeleted }: {
  businessId: string;
  businessName: string;
  canDelete: boolean;
  onDeleted: () => void;
}) {
  const [confirmText, setConfirmText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirmText !== businessName) {
      setError('Type the exact business name to confirm.');
      return;
    }
    setError(null);
    setLoading(true);

    // Delete memberships first, then business
    const { error: memError } = await supabase
      .from('business_memberships')
      .delete()
      .eq('business_id', businessId);

    if (memError) {
      setError('Could not remove team members. Please try again.');
      setLoading(false);
      return;
    }

    const { error: bizError } = await supabase
      .from('businesses')
      .delete()
      .eq('id', businessId);

    if (bizError) {
      setError('Could not delete the business. Please try again.');
      setLoading(false);
    } else {
      onDeleted();
    }
  };

  if (!canDelete) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <Shield className="w-8 h-8 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Only the business owner can delete the business.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 border border-red-500/20">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Delete Business</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            This will permanently delete "{businessName}" and all associated products, customers, orders, and team memberships. This action cannot be undone.
          </p>
        </div>
      </div>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-xl transition-all border border-red-500/20"
        >
          Delete Business
        </button>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
              Type <span className="text-red-400 font-bold">{businessName}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-3 bg-red-500/5 border border-red-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-red-500/50 transition-all"
              placeholder={businessName}
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => { setShowConfirm(false); setConfirmText(''); setError(null); }}
              className="px-5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 hover:text-white text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || confirmText !== businessName}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Delete Forever</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
