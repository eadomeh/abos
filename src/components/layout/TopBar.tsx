import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBusiness } from '@/context/BusinessContext';
import { ChevronDown, LogOut, Plus, Menu, Building2, Check } from 'lucide-react';

interface TopBarProps {
  onToggleSidebar: () => void;
  onOpenOnboarding: () => void;
}

export default function TopBar({ onToggleSidebar, onOpenOnboarding }: TopBarProps) {
  const { signOut } = useAuth();
  const { businesses, activeBusiness, switchBusiness } = useBusiness();
  const [bizDropdown, setBizDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const bizRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bizRef.current && !bizRef.current.contains(e.target as Node)) setBizDropdown(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-16 abos-bg border-b border-white/[0.06] flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div ref={bizRef} className="relative">
          <button
            onClick={() => setBizDropdown(!bizDropdown)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg glass glass-hover transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-white leading-tight max-w-[140px] truncate">
                {activeBusiness?.name ?? 'No Business'}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                {activeBusiness?.role ?? ''}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${bizDropdown ? 'rotate-180' : ''}`} />
          </button>

          {bizDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 glass rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-1.5">
                <p className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-slate-600 font-semibold">
                  Your Businesses
                </p>
                {businesses.map((biz) => (
                  <button
                    key={biz.id}
                    onClick={() => { switchBusiness(biz.id); setBizDropdown(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-all text-left"
                  >
                    <div className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-sm text-slate-300 flex-1 truncate">{biz.name}</span>
                    {activeBusiness?.id === biz.id && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-white/[0.06] p-1.5">
                <button
                  onClick={() => { onOpenOnboarding(); setBizDropdown(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-all text-left"
                >
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-sm text-emerald-400">New Business</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div ref={userRef} className="relative">
        <button
          onClick={() => setUserDropdown(!userDropdown)}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all"
          aria-label="Open workspace menu"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-sm font-medium text-white">
            {activeBusiness?.owner_name?.trim()?.[0]?.toUpperCase() ?? activeBusiness?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
        </button>

        {userDropdown && (
          <div className="absolute top-full right-0 mt-2 w-56 glass rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="p-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/80 to-teal-700 flex items-center justify-center text-sm font-medium text-white">
                  {activeBusiness?.owner_name?.trim()?.[0]?.toUpperCase() ?? activeBusiness?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{activeBusiness?.owner_name || activeBusiness?.name || 'Workspace'}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">{activeBusiness?.role || 'Member'}</p>
                </div>
              </div>
            </div>
            <div className="p-1.5">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-all text-left"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
