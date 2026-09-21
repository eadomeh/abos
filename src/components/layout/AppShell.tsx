import { useState, useEffect } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import OnboardingModal from './OnboardingModal';
import DashboardPage from '@/components/pages/DashboardPage';
import ProductsPage from '@/components/pages/ProductsPage';
import CustomersPage from '@/components/pages/CustomersPage';
import OrdersPage from '@/components/pages/OrdersPage';
import AnalyticsPage from '@/components/pages/AnalyticsPage';
import SettingsPage from '@/components/pages/SettingsPage';
import ConversationsPage from '@/components/pages/ConversationsPage';
import LeadsPage from '@/components/pages/LeadsPage';
import TasksPage from '@/components/pages/TasksPage';
import PlaceholderPage from '@/components/pages/PlaceholderPage';
import { Zap, Building2 } from 'lucide-react';

export default function AppShell() {
  const { businesses, loading, activeBusiness } = useBusiness();
  const [page, setPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!loading && businesses.length === 0) setShowOnboarding(true);
  }, [loading, businesses.length]);

  const handleNavigate = (nextPage: string) => {
    setPage(nextPage);
    setMobileNavOpen(false);
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage onNavigate={handleNavigate} />;
      case 'products': return <ProductsPage />;
      case 'orders': return <OrdersPage />;
      case 'customers': return <CustomersPage />;
      case 'leads': return <LeadsPage />;
      case 'tasks': return <TasksPage />;
      case 'conversations': return <ConversationsPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'automations':
        return <PlaceholderPage title="Automations" description="Event-driven workflows and automated actions. The execution engine is the next platform layer." icon={Zap} />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen abos-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen abos-bg flex overflow-hidden">
      <Sidebar currentPage={page} onNavigate={handleNavigate} collapsed={sidebarCollapsed} mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenMobileMenu={() => setMobileNavOpen(true)}
          onOpenOnboarding={() => setShowOnboarding(true)}
        />
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {activeBusiness ? renderPage() : (
            <div className="flex flex-col items-center justify-center min-h-full text-center px-4 py-10">
              <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-400 mb-2">No Business Selected</h3>
              <p className="text-sm text-slate-600 max-w-md mb-6">Create your first business to start using ABOS.</p>
              <button onClick={() => setShowOnboarding(true)} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                Create Business
              </button>
            </div>
          )}
        </main>
      </div>
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </div>
  );
}
