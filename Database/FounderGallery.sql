create table public.founder_gallery (
    id uuid default gen_random_uuid() primary key,
    image_url text not null,
    order_index integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
