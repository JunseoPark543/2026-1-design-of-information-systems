create or replace view public.admin_order_summary as
select
  o.id as order_id,
  o.user_id,
  o.ordered_at,
  o.total_amount,
  coalesce(sum(oi.quantity), 0)::int as item_count,
  string_agg(m.name || ' x' || oi.quantity, ', ' order by m.name) as menu_summary
from public.orders o
left join public.order_items oi on oi.order_id = o.id
left join public.menus m on m.id = oi.menu_id
group by o.id;

grant select on public.admin_order_summary to anon, authenticated;