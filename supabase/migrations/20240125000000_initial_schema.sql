-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- Create custom types
create type "public"."story_status" as enum ('draft', 'published', 'archived');
create type "public"."visibility" as enum ('public', 'private', 'unlisted');

-- Create profiles table
create table "public"."profiles" (
    "id" uuid references auth.users on delete cascade not null primary key,
    "username" text unique not null,
    "display_name" text,
    "avatar_url" text,
    "bio" text,
    "website" text,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    "updated_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint "username_length" check (char_length(username) >= 3)
);

-- Create categories table
create table "public"."categories" (
    "id" uuid default uuid_generate_v4() primary key,
    "name" text not null unique,
    "slug" text not null unique,
    "description" text,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create stories table
create table "public"."stories" (
    "id" uuid default uuid_generate_v4() primary key,
    "title" text not null,
    "slug" text not null,
    "content" text not null,
    "excerpt" text,
    "author_id" uuid references public.profiles on delete cascade not null,
    "category_id" uuid references public.categories on delete set null,
    "status" story_status default 'draft'::story_status not null,
    "visibility" visibility default 'public'::visibility not null,
    "reading_time" integer,
    "cover_image" text,
    "likes_count" integer default 0 not null,
    "comments_count" integer default 0 not null,
    "views_count" integer default 0 not null,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    "updated_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    "published_at" timestamp with time zone,
    constraint "title_length" check (char_length(title) >= 3),
    constraint "content_length" check (char_length(content) >= 100)
);

-- Create likes table
create table "public"."likes" (
    "id" uuid default uuid_generate_v4() primary key,
    "user_id" uuid references public.profiles on delete cascade not null,
    "story_id" uuid references public.stories on delete cascade not null,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    unique ("user_id", "story_id")
);

-- Create comments table
create table "public"."comments" (
    "id" uuid default uuid_generate_v4() primary key,
    "content" text not null,
    "user_id" uuid references public.profiles on delete cascade not null,
    "story_id" uuid references public.stories on delete cascade not null,
    "parent_id" uuid references public.comments on delete cascade,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    "updated_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint "content_length" check (char_length(content) >= 1)
);

-- Create tags table
create table "public"."tags" (
    "id" uuid default uuid_generate_v4() primary key,
    "name" text not null unique,
    "slug" text not null unique,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create stories_tags junction table
create table "public"."stories_tags" (
    "story_id" uuid references public.stories on delete cascade not null,
    "tag_id" uuid references public.tags on delete cascade not null,
    primary key ("story_id", "tag_id")
);

-- Create bookmarks table
create table "public"."bookmarks" (
    "id" uuid default uuid_generate_v4() primary key,
    "user_id" uuid references public.profiles on delete cascade not null,
    "story_id" uuid references public.stories on delete cascade not null,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    unique ("user_id", "story_id")
);

-- Create functions and triggers
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, username, display_name)
    values (
        new.id,
        substr(new.email, 1, position('@' in new.email) - 1) || '_' || substr(md5(random()::text), 1, 6),
        coalesce(new.raw_user_meta_data->>'full_name', substr(new.email, 1, position('@' in new.email) - 1))
    );
    return new;
end;
$$ language plpgsql security definer;

-- Trigger for creating profile on signup
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Create RLS policies
alter table "public"."profiles" enable row level security;
alter table "public"."stories" enable row level security;
alter table "public"."categories" enable row level security;
alter table "public"."likes" enable row level security;
alter table "public"."comments" enable row level security;
alter table "public"."tags" enable row level security;
alter table "public"."stories_tags" enable row level security;
alter table "public"."bookmarks" enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
    on profiles for select
    using ( true );

create policy "Users can update own profile"
    on profiles for update
    using ( auth.uid() = id );

-- Stories policies
create policy "Public stories are viewable by everyone"
    on stories for select
    using ( status = 'published' and visibility = 'public' );

create policy "Users can view their own stories"
    on stories for select
    using ( auth.uid() = author_id );

create policy "Users can create stories"
    on stories for insert
    with check ( auth.uid() = author_id );

create policy "Users can update own stories"
    on stories for update
    using ( auth.uid() = author_id );

create policy "Users can delete own stories"
    on stories for delete
    using ( auth.uid() = author_id );

-- Create indexes
create index stories_author_id_index on stories(author_id);
create index stories_category_id_index on stories(category_id);
create index stories_status_index on stories(status);
create index stories_created_at_index on stories(created_at);
create index stories_title_trgm_index on stories using gin(title gin_trgm_ops);
create index stories_content_trgm_index on stories using gin(content gin_trgm_ops);

-- Insert default categories
insert into public.categories (name, slug, description) values
    ('Ghost Stories', 'ghost-stories', 'Tales of spectral encounters and haunting presences'),
    ('Urban Legends', 'urban-legends', 'Modern myths and contemporary cautionary tales'),
    ('Paranormal', 'paranormal', 'Supernatural experiences and unexplained phenomena'),
    ('Psychological Horror', 'psychological-horror', 'Stories that challenge the mind and perception'),
    ('Creature Features', 'creature-features', 'Tales of monsters and mysterious beings'),
    ('Folk Horror', 'folk-horror', 'Stories rooted in folklore and ancient traditions'),
    ('Cosmic Horror', 'cosmic-horror', 'Tales of existential dread and unknowable entities'); 