-- Create a bucket for avatars
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true);

-- Create storage policy to allow users to upload their own avatar
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policy to allow users to update their own avatar
create policy "Users can update their own avatar"
  on storage.objects for update
  with check (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policy to allow users to delete their own avatar
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policy to allow public access to avatars
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Add a trigger to delete old avatar when a new one is uploaded
create or replace function public.handle_avatar_update()
returns trigger as $$
declare
  old_avatar_path text;
begin
  -- Get the old avatar path
  select avatar_url into old_avatar_path
  from public.profiles
  where id = auth.uid();

  -- If there was an old avatar and it's different from the new one, delete it
  if old_avatar_path is not null and old_avatar_path <> new.avatar_url then
    delete from storage.objects
    where name = replace(old_avatar_path, 'avatars/', '');
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
create trigger on_avatar_update
  before update of avatar_url
  on public.profiles
  for each row
  execute function public.handle_avatar_update(); 