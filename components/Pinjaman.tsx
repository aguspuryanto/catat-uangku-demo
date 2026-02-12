import React, { useState, useEffect } from 'react';
import { Calculator, Calendar, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import type { Angsuran, Pinjaman } from '../types';
import { getPinjaman, updateAngsuranStatus, formatRupiahHuman, formatRupiah } from '../utils/supabase';

// Helper function to generate UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const Pinjaman: React.FC = () => {
  const [pinjamanList, setPinjamanList] = useState<Pinjaman[]>([]);
  const [pinjaman, setPinjaman] = useState<Pinjaman | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState({
    tanggalBayar: new Date().toISOString().split('T')[0],
    buktiBayar: null as File | null
  });
  const [formData, setFormData] = useState({
    jumlahPinjaman: 10000000,
    bungaTahunan: 3,
    tenorBulan: 10
  });

  useEffect(() => {
    loadPinjaman();
  }, []);

  const loadPinjaman = async () => {
    try {
      setLoading(true);
      console.log('Loading pinjaman data...');
      const { data, error } = await getPinjaman();
      
      if (error) {
        console.error('Error loading pinjaman:', error);
        // Fallback to mock data if database not available
        // console.log('Using fallback mock data due to error');
        // const contohPinjaman = generatePinjaman(
        //   10000000,
        //   3,
        //   10,
        //   new Date().toISOString().split('T')[0]
        // );
        // setPinjaman(contohPinjaman);
      } else if (!data || data.length === 0) {
        console.log('No pinjaman data found, using mock data');
        // Fallback to mock data if no pinjaman exists
        // const contohPinjaman = generatePinjaman(
        //   10000000,
        //   3,
        //   10,
        //   new Date().toISOString().split('T')[0]
        // );
        // setPinjaman(contohPinjaman);
      } else {
        console.log('Found pinjaman data:', data.length, 'items');
        setPinjamanList(data);
        // Set first pinjaman as active
        if (data && data.length > 0) {
          setPinjaman(data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading pinjaman:', error);
      // Fallback to mock data
      console.log('Using fallback mock data due to exception');
      const contohPinjaman = generatePinjaman(
        10000000,
        3,
        10,
        new Date().toISOString().split('T')[0]
      );
      setPinjaman(contohPinjaman);
    } finally {
      setLoading(false);
    }
  };

  const generatePinjaman = (
    jumlah: number,
    bungaTahunan: number,
    tenor: number,
    tanggal: string
  ): Pinjaman => {
    const bungaBulanan = bungaTahunan / 100 / 12;
    const angsuranPokok = jumlah / tenor;
    const bungaPerBulan = jumlah * bungaBulanan; // Bunga flat dari pinjaman awal
    const totalAngsuran = angsuranPokok + bungaPerBulan;
    const angsuranList: Angsuran[] = [];
    let sisaPinjaman = jumlah;

    for (let i = 1; i <= tenor; i++) {
      sisaPinjaman -= angsuranPokok;

      const jatuhTempo = new Date(tanggal);
      jatuhTempo.setDate(5); // Set tanggal 5 setiap bulan
      jatuhTempo.setMonth(jatuhTempo.getMonth() + i - 1);

      angsuranList.push({
        id: generateUUID(), // Use valid UUID instead of "angsuran-${i}"
        bulan: i,
        jumlah: totalAngsuran,
        bunga: bungaPerBulan,
        pokok: angsuranPokok,
        sisaPinjaman: Math.max(0, sisaPinjaman),
        jatuhTempo: jatuhTempo.toISOString().split('T')[0],
        status: 'belum_terbayar'
      });
    }

    return {
      id: generateUUID(), // Use valid UUID instead of "pinjaman-${Date.now()}"
      jumlahPinjaman: jumlah,
      bungaTahunan: bungaTahunan,
      tenorBulan: tenor,
      tanggalPinjaman: tanggal,
      angsuran: angsuranList
    };
  };

  const handleCreatePinjaman = () => {
    const newPinjaman = generatePinjaman(
      formData.jumlahPinjaman,
      formData.bungaTahunan,
      formData.tenorBulan,
      new Date().toISOString().split('T')[0]
    );
    setPinjaman(newPinjaman);
    setShowForm(false);
  };

  const handlePaymentClick = (angsuranId: string) => {
    setShowPaymentModal(angsuranId);
    setPaymentData({
      tanggalBayar: new Date().toISOString().split('T')[0],
      buktiBayar: null
    });
  };

  const handleConfirmPayment = async () => {
    if (!showPaymentModal || !pinjaman) return;

    // Find the angsuran to update
    const angsuran = pinjaman.angsuran.find(a => a.id === showPaymentModal);
    if (!angsuran) {
      console.error('Angsuran not found:', showPaymentModal);
      alert('Data angsuran tidak ditemukan. Silakan coba lagi.');
      return;
    }

    // Optimistic update - update UI immediately
    const updatedPinjaman = {
      ...pinjaman,
      angsuran: pinjaman.angsuran.map(a =>
        a.id === showPaymentModal
          ? { ...a, status: 'terbayar' as const }
          : a
      )
    };

    setPinjaman(updatedPinjaman);
    setShowPaymentModal(null);

    // Update to Supabase
    try {
      console.log('Updating angsuran status:', {
        id: showPaymentModal,
        status: 'terbayar',
        paymentDate: paymentData.tanggalBayar,
        buktiBayar: paymentData.buktiBayar?.name
      });

      const { error } = await updateAngsuranStatus(showPaymentModal, 'terbayar', {
        tanggalBayar: paymentData.tanggalBayar,
        buktiBayar: paymentData.buktiBayar?.name || null
      });
      
      if (error) {
        console.error('Error updating angsuran status:', error);
        // Revert optimistic update on error
        setPinjaman(pinjaman);
        alert(`Gagal memperbarui status angsuran: ${error.message || 'Silakan coba lagi.'}`);
      } else {
        // Success
        console.log('Payment confirmed successfully for:', showPaymentModal);
        console.log('Payment date:', paymentData.tanggalBayar);
        console.log('Payment proof:', paymentData.buktiBayar);
        
        // Show success message
        alert('Pembayaran berhasil dikonfirmasi!');
      }
    } catch (error) {
      console.error('Error updating angsuran status:', error);
      // Revert optimistic update on error
      setPinjaman(pinjaman);
      alert(`Terjadi kesalahan: ${error instanceof Error ? error.message : 'Silakan coba lagi.'}`);
    }
  };

  const toggleStatusAngsuran = async (angsuranId: string) => {
    if (!pinjaman) return;

    const currentStatus = pinjaman.angsuran.find(a => a.id === angsuranId)?.status;
    
    // If trying to mark as paid, show confirmation modal
    if (currentStatus === 'belum_terbayar') {
      handlePaymentClick(angsuranId);
      return;
    }

    // If trying to cancel payment, do it directly
    const newStatus = 'belum_terbayar';
    const angsuran = pinjaman.angsuran.find(a => a.id === angsuranId);
    
    if (!angsuran) {
      console.error('Angsuran not found:', angsuranId);
      alert('Data angsuran tidak ditemukan. Silakan coba lagi.');
      return;
    }

    const updatedPinjaman = {
      ...pinjaman,
      angsuran: pinjaman.angsuran.map(a =>
        a.id === angsuranId
          ? { ...a, status: newStatus }
          : a
      )
    };

    setPinjaman(updatedPinjaman);

    // Update to Supabase
    try {
      console.log('Cancelling payment for angsuran:', {
        id: angsuranId,
        newStatus: newStatus
      });

      const { error } = await updateAngsuranStatus(angsuranId, newStatus);
      
      if (error) {
        console.error('Error updating angsuran status:', error);
        // Revert optimistic update on error
        setPinjaman(pinjaman);
        alert(`Gagal membatalkan pembayaran: ${error.message || 'Silakan coba lagi.'}`);
      } else {
        console.log('Payment cancelled successfully for:', angsuranId);
        alert('Pembayaran berhasil dibatalkan.');
      }
    } catch (error) {
      console.error('Error updating angsuran status:', error);
      // Revert optimistic update on error
      setPinjaman(pinjaman);
      alert(`Terjadi kesalahan: ${error instanceof Error ? error.message : 'Silakan coba lagi.'}`);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const totalTerbayar = pinjaman?.angsuran.filter(a => a.status === 'terbayar').reduce((sum, a) => sum + a.jumlah, 0) || 0;
  const totalBelumTerbayar = pinjaman?.angsuran.filter(a => a.status === 'belum_terbayar').reduce((sum, a) => sum + a.jumlah, 0) || 0;
  const persenTerbayar = pinjaman ? (totalTerbayar / (pinjaman.angsuran.reduce((sum, a) => sum + a.jumlah, 0)) * 100) : 0;
  
  // Cek apakah ada pinjaman yang belum lunas
  const adaPinjamanBelumLunas = pinjaman && totalBelumTerbayar > 0;

  return (
    <div className="space-y-8">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Memuat data pinjaman...</p>
          </div>
        </div>
      )}

      {/* Content - Only show when not loading */}
      {!loading && (
        <>
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">Pinjaman</h1>
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[11px]">Loan Management System</p>
            </div>
            {!adaPinjamanBelumLunas && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg shadow-indigo-200/50"
              >
                <Plus size={20} />
                <span className="font-bold">Pinjaman Baru</span>
              </button>
            )}
          </div>

      {/* Total Pinjaman Card */}
      {pinjaman && (
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl p-8 shadow-2xl shadow-indigo-900/20 text-white border border-indigo-700/30">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-3">Total Pinjaman Aktif</p>
              <p className="text-4xl sm:text-5xl font-black mb-4">{formatRupiahHuman(pinjaman.jumlahPinjaman)}</p>
              <div className="flex flex-wrap gap-4 text-indigo-200 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                  <span>Bunga: {pinjaman.bungaTahunan}%/tahun</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                  <span>Tenor: {pinjaman.tenorBulan} bulan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                  <span>Mulai: {formatDate(pinjaman.tanggalPinjaman)}</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/20">
              <Calculator size={40} className="text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Progress Cards */}
      {pinjaman && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Terbayar & Belum Terbayar Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-6 border border-emerald-200/50 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-200">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Terbayar</p>
                  <p className="text-2xl font-black text-emerald-700">{persenTerbayar.toFixed(1)}%</p>
                </div>
              </div>
              <p className="text-emerald-600 font-bold text-lg">{formatRupiahHuman(totalTerbayar)}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-6 border border-amber-200/50 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-200">
                  <XCircle size={20} />
                </div>
                <div>
                  <p className="text-amber-600 text-[10px] font-bold uppercase tracking-wider">Belum Terbayar</p>
                  <p className="text-2xl font-black text-amber-700">{(100 - persenTerbayar).toFixed(1)}%</p>
                </div>
              </div>
              <p className="text-amber-600 font-bold text-lg">{formatRupiahHuman(totalBelumTerbayar)}</p>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-3xl p-6 border border-indigo-200/50 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-200">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-wider">Progress</p>
                <p className="text-2xl font-black text-indigo-700">{persenTerbayar.toFixed(1)}%</p>
              </div>
            </div>
            <p className="text-indigo-600 font-bold text-lg">{formatRupiahHuman(totalTerbayar)}</p>
          </div>
        </div>
      )}

      {/* Form Pinjaman Baru */}
      {showForm && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-slate-900">Buat Pinjaman Baru</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-all"
            >
              <XCircle size={24} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Jumlah Pinjaman</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rp</span>
                <input
                  type="number"
                  value={formData.jumlahPinjaman}
                  onChange={(e) => setFormData({...formData, jumlahPinjaman: Number(e.target.value)})}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 focus:bg-white transition-all text-lg"
                  placeholder="10.000.000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Bunga Tahunan (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.bungaTahunan}
                onChange={(e) => setFormData({...formData, bungaTahunan: Number(e.target.value)})}
                className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 focus:bg-white transition-all text-lg"
                placeholder="3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Tenor (Bulan)</label>
              <input
                type="number"
                value={formData.tenorBulan}
                onChange={(e) => setFormData({...formData, tenorBulan: Number(e.target.value)})}
                className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 focus:bg-white transition-all text-lg"
                placeholder="12"
              />
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleCreatePinjaman}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg shadow-indigo-200/50"
            >
              Buat Pinjaman
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-slate-100 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all duration-200"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Detail Pinjaman & Tabel Angsuran */}
      {pinjaman && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Detail Angsuran</h3>
            <p className="text-slate-500">Jadual pembayaran dan status angsuran pinjaman</p>
          </div>

          {/* Tabel Angsuran */}
          <div className="overflow-x-auto -mx-8 px-8">
            <div className="min-w-full">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider">No</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Jatuh Tempo</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider hidden sm:table-cell">Pokok</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider hidden sm:table-cell">Bunga</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Total</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider hidden lg:table-cell">Sisa Pinjaman</th>
                    <th className="text-center py-4 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pinjaman.angsuran.map((angsuran, index) => (
                    <tr key={angsuran.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      angsuran.status === 'terbayar' ? 'bg-emerald-50/50' : ''
                    }`}>
                      <td className="py-4 px-4 text-sm text-slate-900 font-medium">{index + 1}</td>
                      <td className="py-4 px-4 text-sm text-slate-900">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="font-medium">{formatDate(angsuran.jatuhTempo)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-right text-slate-900 hidden sm:table-cell font-medium">{formatRupiah(angsuran.pokok)}</td>
                      <td className="py-4 px-4 text-sm text-right text-slate-900 hidden sm:table-cell font-medium">{formatRupiah(angsuran.bunga)}</td>
                      <td className="py-4 px-4 text-sm text-right font-bold text-slate-900">{formatRupiah(angsuran.jumlah)}</td>
                      <td className="py-4 px-4 text-sm text-right text-slate-900 hidden lg:table-cell font-medium">{formatRupiah(angsuran.sisaPinjaman)}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          {/* Status Badge */}
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold">
                            {angsuran.status === 'terbayar' ? (
                              <><CheckCircle size={12} /> <span>Lunas</span></>
                            ) : (
                              <><XCircle size={12} /> <span>Belum</span></>
                            )}
                          </span>
                          
                          {/* Action Button - Hanya untuk yang belum lunas */}
                          {angsuran.status === 'belum_terbayar' && (
                            <button onClick={() => toggleStatusAngsuran(angsuran.id)}>
                              Bayar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-200">
                    <td colSpan={5} className="py-4 px-4 text-sm font-bold text-slate-900 uppercase tracking-wider">Total</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-900">
                      {formatRupiah(pinjaman.angsuran.reduce((sum, a) => sum + a.jumlah, 0))}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentModal && pinjaman && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Konfirmasi Pembayaran</h2>
              <button 
                onClick={() => setShowPaymentModal(null)}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-all"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            {(() => {
              const angsuran = pinjaman.angsuran.find(a => a.id === showPaymentModal);
              if (!angsuran) return null;
              
              return (
                <div className="space-y-6">
                  {/* Detail Angsuran */}
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">Angsuran ke-{angsuran.bulan}</span>
                      <span className="text-sm font-bold text-slate-900">{formatDate(angsuran.jatuhTempo)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Jumlah</span>
                      <span className="text-lg font-bold text-slate-900">{formatRupiah(angsuran.jumlah)}</span>
                    </div>
                  </div>

                  {/* Form Pembayaran */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Tanggal Pembayaran
                      </label>
                      <input
                        type="date"
                        value={paymentData.tanggalBayar}
                        onChange={(e) => setPaymentData({...paymentData, tanggalBayar: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Bukti Pembayaran (Opsional)
                      </label>
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setPaymentData({...paymentData, buktiBayar: e.target.files?.[0] || null})}
                          className="hidden"
                          id="bukti-bayar"
                        />
                        <label 
                          htmlFor="bukti-bayar"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <div className="p-3 bg-indigo-100 rounded-xl">
                            <CheckCircle size={20} className="text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {paymentData.buktiBayar ? paymentData.buktiBayar.name : 'Pilih File Bukti Pembayaran'}
                            </p>
                            <p className="text-xs text-slate-500">PNG, JPG, PDF (max. 5MB)</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowPaymentModal(null)}
                      className="flex-1 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all duration-200"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg shadow-emerald-200/50"
                    >
                      Konfirmasi Bayar
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default Pinjaman;
