
# Supabase RLS Policy Required

You are encountering a "new row violates row-level security policy" error. This is because Supabase blocks database writes by default for security.

Since your app uses a hardcoded login and connects as an "anonymous" user, you need to allow anonymous access to your `transaksi` table.

## Steps to Fix

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Open the **SQL Editor**.
3.  Run the following SQL query to allow public read/write access to the `transaksi` table:

```sql
alter table "transaksi" enable row level security;

create policy "Allow public access"
on "transaksi"
for all
using ( true )
with check ( true );
```

> [!WARNING]
> This makes your data public. Anyone with your API key (which is in your frontend code) can read/write data. For a production app, you should implement Supabase Auth (`supabase.auth`) and restrict policies to `auth.uid()`.
