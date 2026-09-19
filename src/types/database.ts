export type BusinessRole = 'owner' | 'admin' | 'agent' | 'viewer';

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface Business {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  categories: string[] | null;
  logo_url: string | null;
  owner_id: string;
  owner_name: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  whatsapp_phone_number_id: string | null;
  whatsapp_waba_id: string | null;
  whatsapp_connected_at: string | null;
  whatsapp_business_name: string | null;
  country: string | null;
  currency: string | null;
  setup_complete: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessMembership {
  id: string;
  business_id: string;
  user_id: string;
  role: BusinessRole;
  created_at: string;
}

export interface BusinessWithMembership extends Business {
  role: BusinessRole;
  membership_id: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string | null;
  stock_quantity: number;
  sku: string | null;
  category: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface Order {
  id: string;
  business_id: string;
  customer_id: string | null;
  status: OrderStatus;
  total_amount: number;
  currency: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  customer?: Customer | null;
}

export type MessageDirection = 'incoming' | 'outgoing';
export type ConversationChannel = 'whatsapp' | 'instagram' | 'messenger' | 'email' | 'web';

export interface Conversation {
  id: string;
  business_id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  channel: ConversationChannel;
  external_thread_id: string | null;
  last_message_preview: string | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  conversation_id: string;
  business_id: string;
  direction: MessageDirection;
  content: string;
  wa_message_id: string | null;
  channel: ConversationChannel;
  metadata: Record<string, unknown>;
  status: MessageStatus;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}
