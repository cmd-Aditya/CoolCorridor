-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  preferred_min_temp numeric default 20,
  preferred_max_temp numeric default 26,
  units text default 'celsius',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Places table
create table public.places (
  id uuid default uuid_generate_v4() primary key,
  google_place_id text unique,
  name text not null,
  type text,
  lat double precision not null,
  lng double precision not null,
  address text,
  is_indoor boolean default false,
  has_ac boolean default false,
  has_shade boolean default false,
  near_water boolean default false,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- User feedback
create table public.user_feedback (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  place_id uuid references public.places(id) on delete cascade,
  mode text check (mode in ('cool', 'warm')),
  rating integer check (rating between 1 and 4),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Favorites
create table public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  place_id uuid references public.places(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, place_id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.user_feedback enable row level security;
alter table public.favorites enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Places are viewable by everyone" on public.places for select using (true);
create policy "Anyone can insert places" on public.places for insert with check (true);

create policy "Feedback is viewable by everyone" on public.user_feedback for select using (true);
create policy "Authenticated users can insert feedback" on public.user_feedback for insert with check (auth.uid() = user_id);

create policy "Favorites are viewable by owner" on public.favorites for select using (auth.uid() = user_id);
create policy "Users can manage own favorites" on public.favorites for all using (auth.uid() = user_id);