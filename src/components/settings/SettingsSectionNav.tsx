import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle, Bot, BookOpen, Building2, Landmark, MessageCircle, Users,
} from 'lucide-react';

type SettingsSectionItem = {
  id: SettingsSectionId;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type SettingsSectionId = 'business' | 'payments' | 'ai' | 'knowledge' | 'whatsapp' | 'team' | 'danger';

type SettingsSectionNavProps = {
  activeSection: SettingsSectionId;
  onSelect: (section: SettingsSectionId) => void;
  businessName: string;
  role: string;
};

const sectionGroups: { label: string; items: SettingsSectionItem[] }[] = [
  { label: 'WORKSPACE', items: [
    { id: 'business', label: 'Business profile', description: 'Identity and contact details', icon: Building2 },
    { id: 'payments', label: 'Payments & bank details', description: 'Bank transfer instructions', icon: Landmark },
  ] },
  { label: 'AI EXPERIENCE', items: [
    { id: 'ai', label: 'AI agent', description: 'Language, tone and replies', icon: Bot },
    { id: 'knowledge', label: 'Business knowledge', description: 'Verified answers and policies', icon: BookOpen },
  ] },
  { label: 'CHANNELS', items: [
    { id: 'whatsapp', label: 'WhatsApp', description: 'Connection and messaging', icon: MessageCircle },
  ] },
  { label: 'PEOPLE & ACCESS', items: [
    { id: 'team', label: 'Team & permissions', description: 'Members and roles', icon: Users },
  ] },
  { label: 'ADVANCED', items: [
    { id: 'danger', label: 'Danger zone', description: 'Irreversible workspace actions', icon: AlertTriangle },
  ] },
];

export default function SettingsSectionNav({ activeSection, onSelect, businessName, role }: SettingsSectionNavProps) {
  return (
    <nav aria-label="Settings categories" className="glass rounded-2xl border border-white/[0.07] p-2.5 sm:p-3 flex flex-col gap-3 h-fit">
      <div className="px-2 pt-1 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Configure</p>
        <p className="text-xs text-slate-400 mt-1">Choose a section</p>
      </div>
      {sectionGroups.map((group) => (
        <div key={group.label} className="space-y-1.5">
          <p className="px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">{group.label}</p>
          <div className="space-y-1">
            {group.items.map((item) => {
              if (item.id === 'payments' && role !== 'owner') return null;
              const Icon = item.icon;
              const selected = activeSection === item.id;
              const danger = item.id === 'danger';
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={selected ? 'page' : undefined}
                  onClick={() => onSelect(item.id)}
                  className={`relative w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${
                    selected
                      ? danger
                        ? 'bg-red-500/[0.09] border-red-500/20 text-red-200'
                        : 'bg-emerald-500/[0.09] border-emerald-400/20 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/[0.035]'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selected ? danger ? 'bg-red-500/10 text-red-300' : 'bg-emerald-400/10 text-emerald-300' : 'bg-white/[0.035] text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="min-w-0 pt-0.5">
                    <span className="block text-xs font-semibold leading-5">{item.label}</span>
                    <span className={`block text-[10px] leading-4 mt-0.5 ${selected ? 'text-slate-400' : 'text-slate-600'}`}>{item.description}</span>
                  </span>
                  {selected && <span aria-hidden="true" className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${danger ? 'bg-red-400' : 'bg-emerald-400'}`} />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="mt-1 border-t border-white/[0.06] pt-3 px-2 pb-1">
        <p className="text-[9px] uppercase tracking-[0.15em] text-slate-600 font-semibold">Current workspace</p>
        <p className="text-xs text-slate-300 font-medium truncate mt-1.5" title={businessName}>{businessName}</p>
        <p className="text-[10px] text-slate-500 capitalize mt-1">Your role: {role}</p>
      </div>
    </nav>
  );
}
