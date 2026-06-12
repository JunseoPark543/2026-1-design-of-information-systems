truncate table public.order_items, public.orders, public.reviews, public.menu_requests, public.insights, public.menus restart identity cascade;

insert into public.menus (name, category, price, description, is_active) values
('아메리카노', '커피', 3000, '깔끔한 산미와 고소한 향의 기본 커피', true),
('카페라떼', '커피', 4500, '진한 에스프레소와 부드러운 우유의 조합', true),
('바닐라라떼', '커피', 5000, '달콤한 바닐라 향을 더한 인기 라떼', true),
('딸기스무디', '음료', 5500, '상큼한 딸기와 부드러운 얼음 블렌드', true),
('초코라떼', '음료', 5000, '진한 초콜릿 풍미의 논커피 음료', true),
('치즈케이크', '디저트', 6000, '꾸덕한 크림치즈와 바삭한 크러스트', true),
('소금빵', '디저트', 3500, '버터 풍미와 짭짤함이 살아있는 베이커리', true),
('샌드위치', '식사', 6500, '신선한 채소와 햄, 치즈가 들어간 간편 식사', true),
('샐러드', '식사', 7000, '가벼운 한 끼로 좋은 신선 채소 샐러드', true),
('말차라떼', '음료', 5500, '신메뉴 후보로 인기가 높은 진한 말차 음료', true),
('토마토 파니니', '식사', 7500, '따뜻하게 눌러 구운 토마토 기반 신메뉴 후보', true),
('흑임자 크림라떼', '커피', 5800, '고소한 흑임자 크림을 올린 시즌 후보 메뉴', true);

insert into public.orders (user_id, ordered_at, total_amount) values
(null, now() - interval '8 days', 11000),
(null, now() - interval '7 days', 9500),
(null, now() - interval '6 days', 15000),
(null, now() - interval '5 days', 12500),
(null, now() - interval '4 days', 18000),
(null, now() - interval '3 days', 10500),
(null, now() - interval '2 days', 14500),
(null, now() - interval '1 day', 16000);

insert into public.order_items (order_id, menu_id, quantity, unit_price) values
(1, 1, 2, 3000), (1, 7, 1, 3500),
(2, 2, 1, 4500), (2, 3, 1, 5000),
(3, 3, 2, 5000), (3, 6, 1, 6000),
(4, 8, 1, 6500), (4, 4, 1, 5500),
(5, 3, 2, 5000), (5, 6, 1, 6000), (5, 7, 1, 3500),
(6, 5, 1, 5000), (6, 7, 1, 3500),
(7, 9, 1, 7000), (7, 2, 1, 4500),
(8, 10, 2, 5500), (8, 11, 1, 7500);

insert into public.reviews (user_id, menu_id, rating, content, created_at) values
(null, 1, 4, '기본 메뉴라 재주문하기 좋았습니다.', now() - interval '8 days'),
(null, 2, 5, '우유 맛이 부드러웠습니다.', now() - interval '7 days'),
(null, 3, 5, '달콤해서 만족도가 높았습니다.', now() - interval '6 days'),
(null, 4, 4, '상큼하고 양도 적당했습니다.', now() - interval '5 days'),
(null, 5, 3, '조금 더 진하면 좋겠습니다.', now() - interval '4 days'),
(null, 6, 4, '커피와 같이 먹기 좋았습니다.', now() - interval '3 days'),
(null, 7, 3, '맛은 좋지만 조금 더 따뜻하면 좋겠습니다.', now() - interval '2 days'),
(null, 8, 4, '간편 식사로 괜찮았습니다.', now() - interval '2 days'),
(null, 9, 5, '가볍지만 만족도가 높았습니다.', now() - interval '1 day'),
(null, 10, 5, '말차 맛이 진해서 신메뉴로 좋아 보입니다.', now() - interval '1 day'),
(null, 11, 4, '따뜻한 식사 메뉴로 괜찮았습니다.', now()),
(null, 12, 4, '고소한 맛이 차별화됩니다.', now());

insert into public.menu_requests (user_id, requested_name, request_count, created_at) values
(null, '말차라떼', 6, now() - interval '5 days'),
(null, '토마토 파니니', 4, now() - interval '4 days'),
(null, '디카페인 커피', 3, now() - interval '3 days'),
(null, '저당 디저트', 5, now() - interval '2 days'),
(null, '프로틴 샐러드', 2, now() - interval '1 day');

insert into public.insights (title, content, type) values
('대표 메뉴 유지/홍보', '바닐라라떼는 주문량과 평점이 모두 높아 대표 메뉴로 유지할 수 있습니다.', 'maintain'),
('신메뉴 검토', '말차라떼 요청이 많아 신메뉴 후보로 검토할 수 있습니다.', 'new-menu'),
('개선 필요', '소금빵은 판매량이 있으나 평점이 낮아 제공 온도와 품질 점검이 필요합니다.', 'improve');
