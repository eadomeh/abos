import { supabase } from "@/lib/supabase";

type OrderRow = { id: string; total_amount: number | string; status: string; created_at: string };
type ConversationRow = { id: string; customer_name: string; last_message_preview: string | null; last_message_at: string | null; unread_count: number };
type ActivityRow = { id: string; event_type: string; entity_type: string | null; created_at: string; payload: Record<string, unknown> };
type InsightRow = { id: string; title: string; summary: string; severity: string; created_at: string; expires_at?: string | null };

export type DashboardSnapshot = {
  stats: {
    revenue30d: number; revenueToday: number; orders30d: number; customers30d: number;
    conversations: number; unread: number; openLeads: number; pipelineValue: number;
    openTasks: number; dueToday: number; lowStock: number;
  };
  trend: Array<{ key: string; label: string; amount: number }>;
  recentOrders: OrderRow[];
  recentConvos: ConversationRow[];
  activities: ActivityRow[];
  insights: InsightRow[];
};

type BootstrapArgs = { businessId: string; now: Date; dayStart: Date; thirtyDaysAgo: Date; sevenDaysAgo: Date };
type RpcError = { code?: string; message?: string };

function emptyTrend(): DashboardSnapshot["trend"] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return { key: date.toISOString().slice(0, 10), label: date.toLocaleDateString(undefined, { weekday: "short" }), amount: 0 };
  });
}

function normalizeSnapshot(value: unknown): DashboardSnapshot {
  if (!value || typeof value !== "object") throw new Error("Workspace bootstrap returned an invalid response.");
  const raw = value as Partial<DashboardSnapshot>;
  if (!raw.stats || !Array.isArray(raw.trend)) throw new Error("Workspace bootstrap response is incomplete.");
  const stats = raw.stats as DashboardSnapshot["stats"];
  const trendMap = new Map<string, number>();
  for (const point of raw.trend as Array<{ key?: unknown; amount?: unknown }>) {
    if (typeof point?.key === "string") trendMap.set(point.key, Number(point.amount ?? 0));
  }
  const trend = emptyTrend().map((point) => ({ ...point, amount: trendMap.get(point.key) ?? 0 }));
  const recentOrders = Array.isArray(raw.recentOrders) ? raw.recentOrders : [];
  const recentConvos = Array.isArray(raw.recentConvos) ? raw.recentConvos : [];
  const activities = Array.isArray(raw.activities) ? raw.activities : [];
  const now = Date.now();
  const insights = (Array.isArray(raw.insights) ? raw.insights : []).filter((item) => {
    const expiry = (item as InsightRow).expires_at;
    return !expiry || new Date(expiry).getTime() > now;
  }).slice(0, 3);
  return {
    stats: {
      revenue30d: Number(stats.revenue30d ?? 0), revenueToday: Number(stats.revenueToday ?? 0),
      orders30d: Number(stats.orders30d ?? 0), customers30d: Number(stats.customers30d ?? 0),
      conversations: Number(stats.conversations ?? 0), unread: Number(stats.unread ?? 0),
      openLeads: Number(stats.openLeads ?? 0), pipelineValue: Number(stats.pipelineValue ?? 0),
      openTasks: Number(stats.openTasks ?? 0), dueToday: Number(stats.dueToday ?? 0), lowStock: Number(stats.lowStock ?? 0),
    },
    trend,
    recentOrders: recentOrders as OrderRow[], recentConvos: recentConvos as ConversationRow[],
    activities: activities as ActivityRow[], insights: insights as InsightRow[],
  };
}

async function loadLegacySnapshot({ businessId, now, dayStart, thirtyDaysAgo, sevenDaysAgo }: BootstrapArgs): Promise<DashboardSnapshot> {
  const [orders, customerCount, conversations, unreadConversations, openLeads, openLeadRows, openTasks, dueToday, lowStock,
    recentOrderRows, recentConversationRows, activityRows, insightRows] = await Promise.all([
    supabase.from("orders").select("id,total_amount,status,created_at").eq("business_id", businessId).gte("created_at", thirtyDaysAgo.toISOString()).order("created_at", { ascending: false }).limit(500),
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("business_id", businessId).gte("created_at", thirtyDaysAgo.toISOString()),
    supabase.from("conversations").select("id", { count: "exact", head: true }).eq("business_id", businessId).eq("kind", "customer"),
    supabase.from("conversations").select("id", { count: "exact", head: true }).eq("business_id", businessId).eq("kind", "customer").gt("unread_count", 0),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("business_id", businessId).in("status", ["new", "contacted", "qualified"]),
    supabase.from("leads").select("estimated_value,status").eq("business_id", businessId).in("status", ["new", "contacted", "qualified"]).limit(500),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("business_id", businessId).neq("status", "done"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("business_id", businessId).gte("due_at", dayStart.toISOString()).lt("due_at", new Date(dayStart.getTime() + 86_400_000).toISOString()).neq("status", "done"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("business_id", businessId).eq("is_active", true).lte("stock_quantity", 5),
    supabase.from("orders").select("id,total_amount,status,created_at").eq("business_id", businessId).order("created_at", { ascending: false }).limit(5),
    supabase.from("conversations").select("id,customer_name,last_message_preview,last_message_at,unread_count").eq("business_id", businessId).eq("kind", "customer").order("last_message_at", { ascending: false, nullsFirst: false }).limit(5),
    supabase.from("activity_events").select("id,event_type,entity_type,created_at,payload").eq("business_id", businessId).order("created_at", { ascending: false }).limit(8),
    supabase.from("ai_insights").select("id,title,summary,severity,created_at,expires_at").eq("business_id", businessId).eq("is_dismissed", false).order("created_at", { ascending: false }).limit(5),
  ]);
  const failed = [orders, customerCount, conversations, unreadConversations, openLeads, openLeadRows, openTasks, dueToday, lowStock,
    recentOrderRows, recentConversationRows, activityRows, insightRows].find((result) => result.error);
  if (failed?.error) throw failed.error;

  const orderRows = (orders.data ?? []) as OrderRow[];
  const completed = orderRows.filter((order) => order.status === "completed");
  const trend = emptyTrend();
  const trendMap = new Map(trend.map((point) => [point.key, point]));
  completed.filter((order) => new Date(order.created_at) >= sevenDaysAgo).forEach((order) => {
    const point = trendMap.get(new Date(order.created_at).toISOString().slice(0, 10));
    if (point) point.amount += Number(order.total_amount);
  });
  const openLeadValues = (openLeadRows.data ?? []) as Array<{ estimated_value: number | string | null }>;
  return {
    stats: {
      revenue30d: completed.reduce((sum, order) => sum + Number(order.total_amount), 0),
      revenueToday: completed.filter((order) => new Date(order.created_at) >= dayStart && new Date(order.created_at) <= now).reduce((sum, order) => sum + Number(order.total_amount), 0),
      orders30d: orderRows.length, customers30d: customerCount.count ?? 0,
      conversations: conversations.count ?? 0, unread: unreadConversations.count ?? 0,
      openLeads: openLeads.count ?? 0, pipelineValue: openLeadValues.reduce((sum, lead) => sum + Number(lead.estimated_value ?? 0), 0),
      openTasks: openTasks.count ?? 0, dueToday: dueToday.count ?? 0, lowStock: lowStock.count ?? 0,
    },
    trend,
    recentOrders: (recentOrderRows.data ?? []) as OrderRow[],
    recentConvos: (recentConversationRows.data ?? []) as ConversationRow[],
    activities: (activityRows.data ?? []) as ActivityRow[],
    insights: ((insightRows.data ?? []) as InsightRow[]).filter((row) => !row.expires_at || new Date(row.expires_at) > now).slice(0, 3),
  };
}

export async function fetchWorkspaceBootstrap(args: BootstrapArgs): Promise<DashboardSnapshot> {
  const rpc = supabase.rpc.bind(supabase) as unknown as (
    name: string,
    params: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: RpcError | null }>;
  const { data, error } = await rpc("get_workspace_bootstrap", {
    p_business_id: args.businessId,
    p_now: args.now.toISOString(),
    p_day_start: args.dayStart.toISOString(),
    p_thirty_days_ago: args.thirtyDaysAgo.toISOString(),
    p_seven_days_ago: args.sevenDaysAgo.toISOString(),
  });
  if (!error) return normalizeSnapshot(data);
  // Safe rollout: before the tracked migration is deployed, use the pre-A3 RLS-protected reads.
  if (error.code !== "PGRST202" && error.code !== "42883") throw new Error(error.message || "Workspace bootstrap failed.");
  return loadLegacySnapshot(args);
}
