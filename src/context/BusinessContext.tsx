import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Business, BusinessRole, BusinessWithMembership } from '@/types/database';

interface CreateBusinessInput {
  name: string;
  description: string;
  categories: string[];
  owner_name: string;
  phone: string;
  whatsapp_number: string;
  country: string;
  currency: string;
}

interface BusinessContextValue {
  businesses: BusinessWithMembership[];
  activeBusiness: BusinessWithMembership | null;
  loading: boolean;
  switchBusiness: (businessId: string) => void;
  refreshBusinesses: () => Promise<void>;
  createBusiness: (input: CreateBusinessInput) => Promise<{ error: string | null }>;
}

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined);

const STORAGE_KEY = 'abos_active_business_id';

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<BusinessWithMembership[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<BusinessWithMembership | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshBusinesses = useCallback(async () => {
    if (!user) {
      setBusinesses([]);
      setActiveBusiness(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('business_memberships')
      .select(`
        id,
        role,
        business_id,
        businesses (
          id,
          name,
          description,
          category,
          categories,
          logo_url,
          owner_id,
          owner_name,
          phone,
          whatsapp_number,
          whatsapp_phone_number_id,
          whatsapp_waba_id,
          whatsapp_connected_at,
          whatsapp_business_name,
          whatsapp_verify_token,
          country,
          currency,
          setup_complete,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id);

    if (error || !data) {
      setBusinesses([]);
      setActiveBusiness(null);
      setLoading(false);
      return;
    }

    type MembershipRow = {
      id: string;
      role: BusinessRole;
      business_id: string;
      businesses: Business | Business[];
    };

    const mapped: BusinessWithMembership[] = (data as unknown as MembershipRow[])
      .filter((m) => m.businesses)
      .flatMap((m) => {
        const biz = Array.isArray(m.businesses) ? m.businesses[0] : m.businesses;
        if (!biz) return [];
        return [{
          ...biz,
          role: m.role,
          membership_id: m.id,
        }];
      });

    setBusinesses(mapped);

    if (mapped.length === 0) {
      setActiveBusiness(null);
      setLoading(false);
      return;
    }

    const storedId = localStorage.getItem(STORAGE_KEY);
    const found = storedId ? mapped.find((b) => b.id === storedId) : null;
    const next = found ?? mapped[0];
    setActiveBusiness(next);
    localStorage.setItem(STORAGE_KEY, next.id);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshBusinesses();
  }, [refreshBusinesses]);

  const switchBusiness = useCallback((businessId: string) => {
    const found = businesses.find((b) => b.id === businessId);
    if (found) {
      setActiveBusiness(found);
      localStorage.setItem(STORAGE_KEY, businessId);
    }
  }, [businesses]);

  const createBusiness = useCallback(async (input: CreateBusinessInput) => {
    if (!user) return { error: 'Not authenticated' };

    const { data: biz, error: bizError } = await supabase
      .from('businesses')
      .insert({
        name: input.name,
        description: input.description,
        categories: input.categories,
        owner_name: input.owner_name,
        phone: input.phone,
        whatsapp_number: input.whatsapp_number || null,
        country: input.country,
        currency: input.currency,
        category: input.categories[0] || 'general',
        setup_complete: true,
        owner_id: user.id,
      })
      .select()
      .maybeSingle();

    if (bizError || !biz) return { error: bizError?.message ?? 'Failed to create business' };

    const { error: memError } = await supabase
      .from('business_memberships')
      .insert({ business_id: biz.id, user_id: user.id, role: 'owner' });

    if (memError) return { error: memError.message };

    await refreshBusinesses();
    return { error: null };
  }, [user, refreshBusinesses]);

  return (
    <BusinessContext.Provider value={{ businesses, activeBusiness, loading, switchBusiness, refreshBusinesses, createBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider');
  return ctx;
}
