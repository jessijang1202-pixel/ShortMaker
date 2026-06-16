-- SnapReel — Supabase Schema
-- Supabase 대시보드 > SQL Editor 에서 이 파일 전체를 붙여넣고 실행하세요.

-- ─── 1. user_profiles (API 키 저장) ───────────────────────────────────────────

create table if not exists public.user_profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  gemini_api_key      text,
  elevenlabs_api_key  text,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

alter table public.user_profiles enable row level security;

create policy "본인 프로필만 조회"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "본인 프로필만 수정"
  on public.user_profiles for all
  using (auth.uid() = id);

-- ─── 2. projects (작업 내역 저장) ─────────────────────────────────────────────
-- 저장 항목: 영상 제목, 생성/수정 일자, 대본, 설명, 전체 세션(영상 제외)

create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  title         text not null default '제목 없음',   -- planning.topic
  description   text not null default '',            -- selectedIdea.one_line_synopsis
  full_script   text,                                -- scriptSplit.full_script
  current_step  text not null default 'planning',    -- 마지막 작업 단계
  session_data  jsonb not null default '{}',         -- 전체 세션 (blob 제외)
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

alter table public.projects enable row level security;

create policy "본인 프로젝트만 조회"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "본인 프로젝트만 생성"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "본인 프로젝트만 수정"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "본인 프로젝트만 삭제"
  on public.projects for delete
  using (auth.uid() = user_id);

-- ─── 3. updated_at 자동 갱신 트리거 ──────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_projects
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger set_updated_at_user_profiles
  before update on public.user_profiles
  for each row execute function public.set_updated_at();
