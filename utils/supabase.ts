
import { createClient } from "@supabase/supabase-js";
import { Transaction } from '../types';

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