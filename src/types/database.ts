export type BusinessRole = 'owner' | 'admin' | 'agent' | 'viewer';
export type OrderStatus = 'pending' | 'completed' | 'cancelled';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AutomationRunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'skipped';
export type InsightSeverity = 'info' | 'low' | 'warning' | 'critical';

export interface Business {
  id: string; name: string; description: string | null; category: string | null;
  categories: string[] | null; logo_url: string | null; owner_id: string;
  created_at: string; updated_at: string; owner_name: string | null; phone: string | null;
  whatsapp_number: string | null; whatsapp_phone_number_id: string | null; whatsapp_waba_id: string | null;
  whatsapp_connected_at: string | null; whatsapp_business_name: string | null; country: string | null;
  currency: string | null; setup_complete: boolean | null;
}
export interface BusinessMembership { id: string; business_id: string; user_id: string; role: BusinessRole; created_at: string; }
export interface BusinessWithMembership extends Business { role: BusinessRole; membership_id: string; }
export interface Product { id: string; business_id: string; name: string; description: string | null; price: number; currency: string | null; stock_quantity: number; sku: string | null; category: string | null; image_url: string | null; is_active: boolean; created_at: string; updated_at: string; }
export interface Customer { id: string; business_id: string; name: string; phone: string | null; email: string | null; notes: string | null; created_at: string; updated_at: string; }
export interface OrderItem { id: string; order_id: string; product_id: string | null; product_name: string; unit_price: number; quantity: number; subtotal: number; created_at: string; }
export interface Order { id: string; business_id: string; order_number: string | null; customer_id: string | null; status: OrderStatus; total_amount: number; currency: string | null; notes: string | null; created_at: string; updated_at: string; order_items?: OrderItem[]; customer?: Customer | null; }
export type MessageDirection = 'incoming' | 'outgoing';
export type ConversationChannel = 'whatsapp' | 'instagram' | 'messenger' | 'email' | 'web';
export interface Conversation { id: string; business_id: string; customer_id: string | null; customer_name: string; customer_phone: string | null; channel: ConversationChannel; external_thread_id: string | null; last_message_preview: string | null; last_message_at: string | null; unread_count: number; created_at: string; updated_at: string; }
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';
export interface Message { id: string; conversation_id: string; business_id: string; direction: MessageDirection; content: string; wa_message_id: string | null; channel: ConversationChannel; metadata: Record<string, unknown>; status: MessageStatus; error_code: string | null; error_message: string | null; created_at: string; }
export interface Lead {
  id: string; business_id: string; customer_id: string | null; name: string; phone: string | null; email: string | null;
  source: string; status: LeadStatus; score: number; estimated_value: number; notes: string | null;
  assigned_to: string | null; created_at: string; updated_at: string;
}
export interface Task {
  id: string; business_id: string; title: string; description: string | null; status: TaskStatus; priority: TaskPriority;
  due_at: string | null; assigned_to: string | null; related_customer_id: string | null; related_lead_id: string | null;
  created_by: string | null; completed_at: string | null; created_at: string; updated_at: string;
}
export interface Note { id: string; business_id: string; customer_id: string | null; lead_id: string | null; title: string; content: string; created_by: string | null; created_at: string; updated_at: string; }
export interface Automation { id: string; business_id: string; name: string; description: string | null; trigger_type: string; trigger_config: Record<string, unknown>; actions: unknown[]; is_active: boolean; created_by: string | null; created_at: string; updated_at: string; }
export interface AutomationRun { id: string; business_id: string; automation_id: string | null; status: AutomationRunStatus; trigger_data: Record<string, unknown>; result: Record<string, unknown>; error_message: string | null; started_at: string | null; finished_at: string | null; created_at: string; }
export interface Integration { id: string; business_id: string; provider: string; status: 'connected' | 'disconnected' | 'error'; external_account_id: string | null; config: Record<string, unknown>; connected_at: string | null; last_synced_at: string | null; created_at: string; updated_at: string; }
export interface ActivityEvent { id: string; business_id: string; actor_user_id: string | null; event_type: string; entity_type: string | null; entity_id: string | null; payload: Record<string, unknown>; created_at: string; }
export interface AiInsight { id: string; business_id: string; insight_type: string; title: string; summary: string; severity: InsightSeverity; data: Record<string, unknown>; period_start: string | null; period_end: string | null; expires_at: string | null; is_dismissed: boolean; created_at: string; }
export interface AuthUser { id: string; email: string; }
