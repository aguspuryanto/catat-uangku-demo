
import { createClient } from "@supabase/supabase-js";
import { Transaction, Pinjaman, Angsuran } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getTransactions = async (): Promise<{ data: Transaction[], error: any }> => {
    const { data, error } = await supabase
        .from('transaksi')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching transactions:', error);
        return { data: [], error };
    }

    const mappedData = data.map((t: any) => ({
        id: String(t.id),
        type: t.type,
        mainCategory: t.main_category,
        subCategory: t.sub_category,
        amount: t.amount,
        createdAt: t.created_at,
        description: t.description,
    }));

    return { data: mappedData, error: null };
};

export const createTransaction = async (transaction: Transaction) => {
    const { data, error } = await supabase
        .from('transaksi')
        .insert({
            type: transaction.type,
            main_category: transaction.mainCategory,
            sub_category: transaction.subCategory,
            amount: transaction.amount,
            created_at: transaction.createdAt,
            description: transaction.description,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }

    return data;
};

export const removeTransaction = async (id: string) => {
    const { error } = await supabase
        .from('transaksi')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
};

// PINJAMAN FUNCTIONS
export const getPinjaman = async (): Promise<{ data: Pinjaman[], error: any }> => {
    const { data: pinjamanData, error: pinjamanError } = await supabase
        .from('pinjaman')
        .select('*')
        .order('created_at', { ascending: false });

    if (pinjamanError) {
        console.error('Error fetching pinjaman:', pinjamanError);
        return { data: [], error: pinjamanError };
    }

    // Get angsuran for each pinjaman
    const pinjamanWithAngsuran = await Promise.all(
        pinjamanData.map(async (pinjaman: any) => {
            const { data: angsuranData, error: angsuranError } = await supabase
                .from('angsuran')
                .select('*')
                .eq('pinjaman_id', pinjaman.id)
                .order('bulan', { ascending: true });

            const mappedAngsuran = angsuranData?.map((a: any) => ({
                id: String(a.id),
                bulan: a.bulan,
                jumlah: a.jumlah,
                bunga: a.bunga,
                pokok: a.pokok,
                sisaPinjaman: a.sisa_pinjaman,
                jatuhTempo: a.jatuh_tempo,
                status: a.status
            })) || [];

            return {
                id: String(pinjaman.id),
                jumlahPinjaman: pinjaman.jumlah_pinjaman,
                bungaTahunan: pinjaman.bunga_tahunan,
                tenorBulan: pinjaman.tenor_bulan,
                tanggalPinjaman: pinjaman.tanggal_pinjaman,
                angsuran: mappedAngsuran
            };
        })
    );

    return { data: pinjamanWithAngsuran, error: null };
};

export const createPinjaman = async (pinjaman: Pinjaman): Promise<{ data: any, error: any }> => {
    // Insert pinjaman
    const { data: pinjamanData, error: pinjamanError } = await supabase
        .from('pinjaman')
        .insert({
            jumlah_pinjaman: pinjaman.jumlahPinjaman,
            bunga_tahunan: pinjaman.bungaTahunan,
            tenor_bulan: pinjaman.tenorBulan,
            tanggal_pinjaman: pinjaman.tanggalPinjaman
        })
        .select()
        .single();

    if (pinjamanError) {
        console.error('Error creating pinjaman:', pinjamanError);
        return { data: null, error: pinjamanError };
    }

    // Insert angsuran
    const angsuranInserts = pinjaman.angsuran.map(a => ({
        pinjaman_id: pinjamanData.id,
        bulan: a.bulan,
        jumlah: a.jumlah,
        bunga: a.bunga,
        pokok: a.pokok,
        sisa_pinjaman: a.sisaPinjaman,
        jatuh_tempo: a.jatuhTempo,
        status: a.status
    }));

    const { error: angsuranError } = await supabase
        .from('angsuran')
        .insert(angsuranInserts);

    if (angsuranError) {
        console.error('Error creating angsuran:', angsuranError);
        return { data: null, error: angsuranError };
    }

    return { data: pinjamanData, error: null };
};

export const updateAngsuranStatus = async (angsuranId: string, status: 'terbayar' | 'belum_terbayar'): Promise<{ error: any }> => {
    const { error } = await supabase
        .from('angsuran')
        .update({ status })
        .eq('id', angsuranId);

    if (error) {
        console.error('Error updating angsuran status:', error);
        return { error };
    }

    return { error: null };
};

export const deletePinjaman = async (pinjamanId: string): Promise<{ error: any }> => {
    const { error } = await supabase
        .from('pinjaman')
        .delete()
        .eq('id', pinjamanId);

    if (error) {
        console.error('Error deleting pinjaman:', error);
        return { error };
    }

    return { error: null };
};