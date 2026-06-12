create or replace view public.admin_profile_summary as
with order_stats as (
  select user_id, count(*)::int as order_count, coalesce(sum(total_amount), 0)::int as total_spent
  from public.orders
  where user_id is not null
  group by user_id
), review_stats as (
  select user_id, count(*)::int as review_count
  from public.reviews
  where user_id is not null
  group by user_id
), request_stats as (
  select user_id, coalesce(sum(request_count), 0)::int as request_count
  from public.menu_requests
  where user_id is not null
  group by user_id
)
select
  p.id,
  p.name,
  p.phone,
  p.gender,
  p.age,
  p.created_at,
  coalesce(os.order_count, 0) as order_count,
  coalesce(os.total_spent, 0) as total_spent,
  coalesce(rs.review_count, 0) as review_count,
  coalesce(mrs.request_count, 0) as request_count
from public.profiles p
left join order_stats os on os.user_id = p.id
left join review_stats rs on rs.user_id = p.id
left join request_stats mrs on mrs.user_id = p.id;

grant select on public.admin_profile_summary to anon, authenticated;