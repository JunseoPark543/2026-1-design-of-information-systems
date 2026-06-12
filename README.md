# 소비자 취향 분석 기반 매출 증진 시스템 MVP

음식점 운영자가 소비자의 주문, 리뷰, 요청 메뉴 데이터를 분석해 소비자에게 맞춤형 메뉴를 추천하고, 관리자에게 메뉴 개선 및 매출 전략 인사이트를 제공하는 26-1 정보시스템 설계 프로젝트용 웹서비스입니다.

## 주요 기능

- Supabase Auth 익명 세션 기반 소비자 정보 등록
- 소비자 프로필 저장/수정: 이름, 전화번호, 성별, 나이
- 메뉴 조회, 카테고리 필터, 평균 별점 표시
- 장바구니 주문 및 주문 상세 저장
- 주문 메뉴 별점 작성 및 평균 평점 반영
- 원하는 메뉴 요청 등록, 기존 요청은 요청 횟수 증가
- rule-based 맞춤형 메뉴 추천과 추천 이유 표시
- 관리자 대시보드: 판매량, 매출, 인기 메뉴 TOP 5, 요청 메뉴, 회원 정보, 개선/홍보 인사이트
- 관리자 메뉴 CRUD 및 활성/비활성 관리

## 기술 스택

- Frontend: Next.js App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Backend/DB/Auth: Supabase
- Chart: Recharts
- Deployment: Vercel
- ORM: 사용하지 않음. Supabase client와 SQL migration 중심으로 구현

## 코드 구조

```text
app/
  page.tsx
  login/page.tsx
  signup/page.tsx
  menus/page.tsx
  cart/page.tsx
  orders/page.tsx
  reviews/new/page.tsx
  requests/page.tsx
  recommendations/page.tsx
  admin/page.tsx
  admin/menus/page.tsx
components/
lib/
  supabase/client.ts
  supabase/server.ts
  recommendation.ts
  admin-insights.ts
  types.ts
supabase/
  migrations/001_initial_schema.sql
  seed.sql
```

## Supabase 테이블 구조

- `profiles`: 사용자 프로필
- `menus`: 메뉴 기본 정보
- `orders`: 주문 헤더
- `order_items`: 주문 상세
- `reviews`: 메뉴 리뷰 및 별점
- `menu_requests`: 소비자 요청 메뉴
- `insights`: 관리자 인사이트 메모 확장용

추가 view:

- `menu_metrics`: 메뉴별 평균 별점, 리뷰 수, 판매 수량
- `admin_menu_metrics`: 관리자 대시보드용 메뉴별 판매량, 매출, 평점
- `menu_request_summary`: 요청 메뉴별 누적 요청 수

## 로컬 실행 방법

```bash
npm install
npm run dev
```

PowerShell 실행 정책 때문에 `npm`이 막히면 Windows에서는 아래처럼 실행할 수 있습니다.

```powershell
npm.cmd install
npm.cmd run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## `.env.local` 설정 방법

`.env.example`을 참고해 프로젝트 루트에 `.env.local`을 만듭니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_ADMIN_ACCESS_CODE=admin2026
```

Supabase 프로젝트의 Project Settings > API에서 URL과 anon key를 확인할 수 있습니다.

## Supabase migration/seed 적용 방법

Supabase SQL Editor에서 아래 순서로 실행합니다.

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_admin_profile_summary.sql`
3. `supabase/migrations/003_admin_order_summary.sql`
4. `supabase/seed.sql`

Supabase CLI를 사용하는 경우:

```bash
supabase db push
supabase db seed
```

`seed.sql`에는 메뉴, 주문, 리뷰, 요청 메뉴, 인사이트 샘플 데이터가 포함되어 있어 관리자 대시보드를 바로 시연할 수 있습니다. 소비자 개인 주문/추천 흐름은 앱에서 소비자 정보 등록 후 직접 주문과 별점을 생성해 확인합니다.

이미 `001_initial_schema.sql`과 `seed.sql`을 실행했다면, 관리자 회원/주문 조회 기능을 위해 `002_admin_profile_summary.sql`과 `003_admin_order_summary.sql`만 추가로 실행하면 됩니다. `Could not find the table public.admin_profile_summary in the schema cache` 오류도 이 migration을 실행하면 해결됩니다.

## Vercel 배포 방법

1. GitHub에 이 프로젝트를 push합니다.
2. Vercel에서 New Project로 import합니다.
3. Environment Variables에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_ADMIN_ACCESS_CODE`를 등록합니다.
4. Build command는 `npm run build`, Output은 Next.js 기본값을 사용합니다.
5. Supabase Authentication 설정에서 Vercel 배포 URL을 Site URL 또는 Redirect URL에 추가합니다.

## 추천 로직

복잡한 AI 모델 대신 MVP에 맞는 rule-based 추천을 사용했습니다.

1. 주문 이력이 있고 높은 별점을 준 메뉴와 같은 카테고리 추천
2. 낮은 별점을 준 메뉴만 있으면 다른 카테고리 추천
3. 요청 메뉴와 이름/카테고리가 유사한 메뉴 추천
4. 평균 별점 4점 이상 인기 메뉴 추천
5. 데이터가 부족하면 전체 인기 메뉴 추천

각 추천 카드에는 사용자에게 보이는 추천 이유를 함께 표시합니다.

## 관리자 인사이트 규칙

- 요청 빈도 높음: 신메뉴 검토
- 주문량 많음 + 평균 평점 낮음: 맛/가격/구성 개선 필요
- 주문량 적음 + 평균 평점 높음: 홍보 강화 필요
- 주문량 많음 + 평균 평점 높음: 대표 메뉴 유지 및 프로모션 추천

## MVP 기준 결정 사항

- 관리자 대시보드 `/admin`과 `/admin/menus`는 접근 코드 입력 후 볼 수 있습니다. 기본 코드는 `admin2026`이며 `NEXT_PUBLIC_ADMIN_ACCESS_CODE`로 변경할 수 있습니다.
- 관리자 메뉴 CRUD는 접근 코드 확인 후 필요한 Supabase 세션을 생성해 조작합니다. 운영 버전에서는 server-side admin 권한과 RLS 정책으로 좁혀야 합니다.
- 장바구니는 빠른 시연을 위해 `localStorage`에 저장했습니다. 주문 시 Supabase의 `orders`, `order_items`에 영구 저장됩니다.
- 소비자 정보 등록 화면은 계정 식별 정보를 받지 않고 Supabase Auth 익명 세션을 생성한 뒤 프로필만 저장합니다. 기존 세션이 있으면 새 사용자를 만들지 않고 같은 프로필을 갱신합니다.
- 별점 작성은 주문 내역 페이지에서 주문한 메뉴별로 가능하고, 메뉴 평균 평점에 반영됩니다.
- 메뉴 요청은 소비자 세션이 있는 상태에서 가능하며, 같은 요청 메뉴는 요청 횟수가 증가합니다.
- Supabase Dashboard의 Authentication 설정에서 Anonymous sign-ins를 켜야 합니다.
- 추천은 SQL 함수가 아니라 TypeScript 도메인 로직으로 구현했습니다. 발표 시 규칙 설명과 코드 확인이 쉽고, 나중에 ML 모델로 교체하기 편합니다.

## 시연 시나리오

1. `/signup`에서 소비자 정보 등록 또는 기존 정보 수정
2. `/menus`에서 카테고리별 메뉴 조회
3. 메뉴를 장바구니에 담고 `/cart`에서 주문
4. `/orders`에서 주문 내역 확인 후 별점 작성
5. `/requests`에서 원하는 메뉴 요청
6. `/recommendations`에서 추천 메뉴와 추천 이유 확인
7. `/admin`에서 매출, 인기 메뉴, 회원 정보, 회원별 주문 내역, 요청 메뉴, 개선 인사이트 확인
8. `/admin/menus`에서 메뉴 추가/수정/비활성 처리 시연
