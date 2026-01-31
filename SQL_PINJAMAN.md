# SQL Query untuk Table Pinjaman

## 1. Create Table Pinjaman

```sql
-- Table untuk data pinjaman utama
CREATE TABLE pinjaman (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    jumlah_pinjaman DECIMAL(15,2) NOT NULL,
    bunga_tahunan DECIMAL(5,2) NOT NULL,
    tenor_bulan INTEGER NOT NULL,
    tanggal_pinjaman DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table untuk detail angsuran
CREATE TABLE angsuran (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pinjaman_id UUID REFERENCES pinjaman(id) ON DELETE CASCADE,
    bulan INTEGER NOT NULL,
    jumlah DECIMAL(15,2) NOT NULL,
    bunga DECIMAL(15,2) NOT NULL,
    pokok DECIMAL(15,2) NOT NULL,
    sisa_pinjaman DECIMAL(15,2) NOT NULL,
    jatuh_tempo DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'belum_terbayar' CHECK (status IN ('terbayar', 'belum_terbayar')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk performance
CREATE INDEX idx_angsuran_pinjaman_id ON angsuran(pinjaman_id);
CREATE INDEX idx_angsuran_status ON angsuran(status);
CREATE INDEX idx_angsuran_jatuh_tempo ON angsuran(jatuh_tempo);
```

## 2. Insert Data Contoh

```sql
-- Insert pinjaman contoh (10 juta, bunga 3%/tahun, tenor 10 bulan)
INSERT INTO pinjaman (jumlah_pinjaman, bunga_tahunan, tenor_bulan, tanggal_pinjaman) 
VALUES (10000000.00, 3.00, 10, '2026-01-31')
RETURNING id;

-- Anggap id pinjaman yang dihasilkan adalah 'uuid-pinjaman-123'
-- Insert angsuran untuk pinjaman tersebut
INSERT INTO angsuran (pinjaman_id, bulan, jumlah, bunga, pokok, sisa_pinjaman, jatuh_tempo, status) VALUES
('uuid-pinjaman-123', 1, 1025000.00, 25000.00, 1000000.00, 9000000.00, '2026-02-05', 'belum_terbayar'),
('uuid-pinjaman-123', 2, 1025000.00, 25000.00, 1000000.00, 8000000.00, '2026-03-05', 'belum_terbayar'),
('uuid-pinjaman-123', 3, 1025000.00, 25000.00, 1000000.00, 7000000.00, '2026-04-05', 'belum_terbayar'),
('uuid-pinjaman-123', 4, 1025000.00, 25000.00, 1000000.00, 6000000.00, '2026-05-05', 'belum_terbayar'),
('uuid-pinjaman-123', 5, 1025000.00, 25000.00, 1000000.00, 5000000.00, '2026-06-05', 'belum_terbayar'),
('uuid-pinjaman-123', 6, 1025000.00, 25000.00, 1000000.00, 4000000.00, '2026-07-05', 'belum_terbayar'),
('uuid-pinjaman-123', 7, 1025000.00, 25000.00, 1000000.00, 3000000.00, '2026-08-05', 'belum_terbayar'),
('uuid-pinjaman-123', 8, 1025000.00, 25000.00, 1000000.00, 2000000.00, '2026-09-05', 'belum_terbayar'),
('uuid-pinjaman-123', 9, 1025000.00, 25000.00, 1000000.00, 1000000.00, '2026-10-05', 'belum_terbayar'),
('uuid-pinjaman-123', 10, 1025000.00, 25000.00, 1000000.00, 0.00, '2026-11-05', 'belum_terbayar');
```

## 3. RLS (Row Level Security) - Optional

```sql
-- Enable RLS
ALTER TABLE pinjaman ENABLE ROW LEVEL SECURITY;
ALTER TABLE angsuran ENABLE ROW LEVEL SECURITY;

-- Policy untuk pinjaman (sesuaikan dengan user authentication)
CREATE POLICY "Users can view own pinjaman" ON pinjaman FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own pinjaman" ON pinjaman FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own pinjaman" ON pinjaman FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own pinjaman" ON pinjaman FOR DELETE USING (auth.uid()::text = user_id);

-- Policy untuk angsuran
CREATE POLICY "Users can view own angsuran" ON angsuran FOR SELECT USING (auth.uid()::text = (SELECT user_id FROM pinjaman WHERE id = pinjaman_id));
CREATE POLICY "Users can insert own angsuran" ON angsuran FOR INSERT WITH CHECK (auth.uid()::text = (SELECT user_id FROM pinjaman WHERE id = pinjaman_id));
CREATE POLICY "Users can update own angsuran" ON angsuran FOR UPDATE USING (auth.uid()::text = (SELECT user_id FROM pinjaman WHERE id = pinjaman_id));
CREATE POLICY "Users can delete own angsuran" ON angsuran FOR DELETE USING (auth.uid()::text = (SELECT user_id FROM pinjaman WHERE id = pinjaman_id));
```

## 4. Trigger untuk updated_at

```sql
-- Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk pinjaman
CREATE TRIGGER update_pinjaman_updated_at 
    BEFORE UPDATE ON pinjaman 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk angsuran
CREATE TRIGGER update_angsuran_updated_at 
    BEFORE UPDATE ON angsuran 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Cara Eksekusi:

1. Buka Supabase Dashboard
2. Masuk ke SQL Editor
3. Copy dan jalankan query di atas secara berurutan
4. Pastikan untuk mengganti 'uuid-pinjaman-123' dengan ID yang dihasilkan dari INSERT pertama
