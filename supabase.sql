-- Skopiuj ten kod i wklej w zakładce "SQL Editor" w Twoim projekcie na supabase.com i kliknij "Run"

create table flashcards (
  id uuid default gen_random_uuid() primary key,
  word text not null,
  translation text not null,
  example text,
  example_pl text,
  category text default 'Bez kategorii',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Zezwalamy na publiczny odczyt, dodawanie, modyfikowanie i usuwanie
-- Ponieważ to Twoja prywatna aplikacja do nauki
alter table flashcards enable row level security;

create policy "Umożliw publiczny odczyt fiszek"
  on flashcards for select
  using (true);

create policy "Umożliw publiczne dodawanie"
  on flashcards for insert
  with check (true);

create policy "Umożliw publiczną modyfikację"
  on flashcards for update
  using (true);

create policy "Umożliw publiczne usuwanie"
  on flashcards for delete
  using (true);
