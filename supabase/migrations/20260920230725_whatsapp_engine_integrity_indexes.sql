create unique index if not exists customers_business_phone_unique on public.customers (business_id, phone) where phone is not null;
create unique index if not exists conversations_business_channel_phone_unique on public.conversations (business_id, channel, customer_phone) where customer_phone is not null;
create unique index if not exists messages_business_wa_id_unique on public.messages (business_id, wa_message_id) where wa_message_id is not null;
create index if not exists conversations_business_last_message_idx on public.conversations (business_id, last_message_at desc nulls last);
create index if not exists messages_conversation_created_idx on public.messages (conversation_id, created_at);
create index if not exists whatsapp_webhook_events_business_created_idx on public.whatsapp_webhook_events (business_id, created_at desc);