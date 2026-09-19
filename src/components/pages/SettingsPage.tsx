import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { BusinessMembership, BusinessRole } from '@/types/database';
import {
  Building2, Users, AlertTriangle, Loader2,
  AlertCircle, Check, Trash2, UserPlus, Shield,
  Mail, Phone, MapPin, MessageCircle, ArrowRight, Crown,
  Copy, CheckCircle2, CircleDot,
} from 'lucide-react';

export default function SettingsPage() {
  const { activeBusiness, refreshBusinesses } = useBusiness();
  const { user } = useAuth();
  const [tab, setTab] = useState<'business' | 'whatsapp' | 'team' | 'danger'>('business');

  if (!activeBusiness) return null;

  const isOwner = activeBusiness.role === 'owner';

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your business and team</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 glass rounded-xl w-fit mb-6">
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
  const { refreshBusinesses } = useBusiness();
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [connection, setConnection] = useState<{
    phone_number_id: string;
    waba_id: string;
    display_phone_number: string | null;
    verified_name: string | null;
    quality_rating: string | null;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const webhookUrl = import.meta.env.VITE_SUPABASE_URL + '/functions/v1/whatsapp-webhook';

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
    if (next) {
      setPhoneNumberId(next.phone_number_id ?? '');
      setWabaId(next.waba_id ?? '');
    }
    setLoading(false);
  }, [businessId]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handleConnect = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const { data, error: invokeError } = await supabase.functions.invoke('whatsapp-connection', {
      body: {
        action: 'connect',
        businessId,
        phoneNumberId: phoneNumberId.trim(),
        wabaId: wabaId.trim(),
        accessToken: accessToken.trim(),
      },
    });

    if (invokeError || !data?.success) {
      setError(data?.details ?? data?.error ?? 'Could not connect WhatsApp.');
      setSaving(false);
      return;
    }

    setConnection(data.connection);
    setAccessToken('');
    setSaving(false);
    await refreshBusinesses();
  };

  const handleDisconnect = async () => {
    setSaving(true);
    setError(null);
    const { data, error: invokeError } = await supabase.functions.invoke('whatsapp-connection', {
      body: { action: 'disconnect', businessId },
    });

    if (invokeError || !data?.success) {
      setError(data?.error ?? 'Could not disconnect WhatsApp.');
      setSaving(false);
      return;
    }

    setConnection(null);
    setPhoneNumberId('');
    setWabaId('');
    setAccessToken('');
    setSaving(false);
    await refreshBusinesses();
  };

  const copyWebhook = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
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
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Webhook endpoint</h3>
            <p className="text-xs text-slate-500 mt-1">Use this HTTPS endpoint in Meta's WhatsApp webhook configuration.</p>
          </div>
          <button onClick={copyWebhook} type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-xs text-slate-300 transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <code className="block px-3 py-3 bg-black/30 rounded-xl text-[11px] text-emerald-400 overflow-x-auto whitespace-nowrap">{webhookUrl}</code>
        <p className="text-[11px] text-slate-600 mt-3">Subscribe the <span className="text-slate-400">messages</span> field in Meta. ABOS verifies Meta webhook signatures server-side.</p>
      </div>

      {connection ? (
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Connected number</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"><p className="text-[10px] uppercase tracking-wide text-slate-600">Phone Number ID</p><p className="text-xs text-slate-300 mt-1 break-all">{connection.phone_number_id}</p></div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"><p className="text-[10px] uppercase tracking-wide text-slate-600">WABA ID</p><p className="text-xs text-slate-300 mt-1 break-all">{connection.waba_id}</p></div>
            </div>
          </div>
          <button type="button" onClick={handleDisconnect} disabled={saving} className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-xl border border-red-500/20 disabled:opacity-50">
            {saving ? 'Working…' : 'Disconnect WhatsApp'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleConnect} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Connect a WhatsApp Business number</h3>
            <p className="text-xs text-slate-500 mt-1">Developer connection mode. The access token is sent over HTTPS and never returned to the browser after saving.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Phone Number ID</label>
            <input required value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} placeholder="123456789012345" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">WhatsApp Business Account ID</label>
            <input required value={wabaId} onChange={(e) => setWabaId(e.target.value)} placeholder="987654321098765" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Meta access token</label>
            <input required type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} placeholder="Paste token for this WhatsApp account" autoComplete="off" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/50" />
          </div>

          {error && <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"><AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /><p className="text-xs text-red-300">{error}</p></div>}

          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageCircle className="w-4 h-4" /> Verify & Connect</>}
          </button>
        </form>
      )}

      <div className="glass rounded-2xl p-4">
        <button type="button" onClick={() => setShowAdvanced((value) => !value)} className="text-xs text-slate-400 hover:text-white transition-colors">
          {showAdvanced ? 'Hide' : 'Show'} setup notes
        </button>
        {showAdvanced && (
          <div className="mt-3 text-xs text-slate-500 leading-relaxed space-y-2">
            <p>For production onboarding we will replace developer credential entry with Meta Embedded Signup.</p>
            <p>Do not store Meta access tokens in GitHub, browser local storage, or the public database.</p>
            <p>After Meta webhook verification succeeds, incoming messages are routed into the ABOS inbox automatically.</p>
          </div>
        )}
      </div>
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
