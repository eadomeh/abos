import { useBusiness } from '@/context/BusinessContext';
import {
  LayoutDashboard, Package, ShoppingCart, Users, MessageSquare,
  Settings, Building2, BarChart3, Zap, X,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'conversations', label: 'Conversations', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'automations', label: 'Automations', icon: Zap },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  currentPage,
  onNavigate,
  collapsed,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const { activeBusiness } = useBusiness();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        className={`${
          mobileOpen
            ? 'fixed inset-y-0 left-0 z-50 flex w-72'
            : 'hidden md:flex'
        } ${collapsed ? 'md:w-16' : 'md:w-60'} flex-shrink-0 abos-bg border-r border-white/[0.06] flex-col transition-all duration-300`}
      >
        <div className="h-16 flex items-center justify-between px-3 border-b border-white/[0.06]">
          <div className="flex items-center min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            {!collapsed && (
              <span className="ml-2.5 text-lg font-bold text-white tracking-tight">ABOS</span>
            )}
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile?.();
                }}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {activeBusiness && !collapsed && (
          <div className="p-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg glass">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400 truncate">{activeBusiness.name}</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
