alter table public.orders
  add column if not exists order_number text;

create unique index if not exists ux_orders_business_order_number
  on public.orders (business_id, order_number)
  where order_number is not null;