
# ⚠️ ACTION REQUIRED: Fix Database Access

Your application is getting this error when trying to save transactions:

> new row violates row-level security policy for table "transaksi"

This means Supabase is blocking write access because there are no security policies set up for your table yet.

## FIX INSTRUCTIONS

1. Go to your **Supabase Dashboard** (https://supabase.com/dashboard).
2. Click on the **SQL Editor** icon in the left sidebar.
3. Paste and RUN the following SQL code:

```sql
-- Enable Row Level Security (RLS)
ALTER TABLE "transaksi" ENABLE ROW LEVEL SECURITY;

-- Allow public access (read/write/delete) to the table
CREATE POLICY "Allow public access"
ON "transaksi"
FOR ALL
USING ( true )
WITH CHECK ( true );
```

After running this SQL, your application will work immediately.
