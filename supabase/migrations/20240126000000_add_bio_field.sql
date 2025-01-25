-- Add bio field to profiles table
alter table "public"."profiles" 
add column if not exists "bio" text;

-- Update RLS policy for bio field
create policy "Users can update own bio"
    on profiles
    for update
    using ( auth.uid() = id )
    with check ( auth.uid() = id ); 