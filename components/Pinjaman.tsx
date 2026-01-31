import React, { useState, useEffect } from 'react';
import { Calculator, Calendar, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import type { Angsuran, Pinjaman } from '../types';
import { updateAngsuranStatus, formatRupiahHuman, formatRupiah } from '../utils/supabase';

const Pinjaman: React.FC = () => {
  const [pinjaman, setPinjaman] = useState<Pinjaman | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    jumlahPinjaman: 10000000,
    bungaTahunan: 3,
    tenorBulan: 10
  });

  useEffect(() => {
    // Load contoh pinjaman saat component pertama kali dimuat
    const contohPinjaman = generatePinjaman(
      10000000,
      3,
      10,
      new Date().toISOString().split('T')[0]
    );
    setPinjaman(contohPinjaman);
  }, []);

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
      jatuhTempo.setMonth(jatuhTempo.getMonth() + i);

      angsuranList.push({
        id: `angsuran-${i}`,
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
      id: `pinjaman-${Date.now()}`,
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

  const toggleStatusAngsuran = async (angsuranId: string) => {
    if (!pinjaman) return;

    // Optimistic update - update UI immediately
    const newStatus = pinjaman.angsuran.find(a => a.id === angsuranId)?.status === 'terbayar' 
      ? 'belum_terbayar' 
      : 'terbayar';

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
      const { error } = await updateAngsuranStatus(angsuranId, newStatus);
      
      if (error) {
        console.error('Error updating angsuran status:', error);
        // Revert optimistic update on error
        setPinjaman(pinjaman);
        alert('Gagal memperbarui status angsuran. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error updating angsuran status:', error);
      // Revert optimistic update on error
      setPinjaman(pinjaman);
      alert('Terjadi kesalahan. Silakan coba lagi.');
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
    <div className="space-y-6">
      {/* Total Pinjaman Card - Pindah ke Atas */}
      {pinjaman && (
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-6 sm:p-8 shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm sm:text-base font-medium mb-2">Total Pinjaman</p>
              <p className="text-3xl sm:text-4xl font-bold">{formatRupiahHuman(pinjaman.jumlahPinjaman)}</p>
              <p className="text-indigo-200 text-xs sm:text-sm mt-2">
                Bunga: {pinjaman.bungaTahunan}%/tahun • Tenor: {pinjaman.tenorBulan} bulan
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
              <Calculator size={32} className="text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}

      {pinjaman && showForm && (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-3 rounded-xl">
              <Calculator className="text-indigo-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Pinjaman</h2>
              <p className="text-slate-500 text-sm">Kelola pinjaman dan angsuran Anda</p>
            </div>
          </div>
          {!adaPinjamanBelumLunas && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors"
            >
              <Plus size={20} />
              Pinjaman Baru
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl p-4 sm:p-5 border border-indigo-200/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <Calendar size={16} className="text-indigo-600" />
              </div>
              <p className="text-indigo-600 text-xs sm:text-sm font-medium">Progress Pembayaran</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-indigo-700">{persenTerbayar.toFixed(1)}%</p>
          </div>
        </div>
      </div>
      )}

      {/* Form Pinjaman Baru */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Buat Pinjaman Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Jumlah Pinjaman
              </label>
              <input
                type="number"
                value={formData.jumlahPinjaman}
                onChange={(e) => setFormData({...formData, jumlahPinjaman: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="10000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bunga Tahunan (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.bungaTahunan}
                onChange={(e) => setFormData({...formData, bungaTahunan: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tenor (Bulan)
              </label>
              <input
                type="number"
                value={formData.tenorBulan}
                onChange={(e) => setFormData({...formData, tenorBulan: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="12"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCreatePinjaman}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Buat Pinjaman
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-slate-200 text-slate-700 px-6 py-2 rounded-xl hover:bg-slate-300 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Detail Pinjaman */}
      {pinjaman && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {/* <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Detail Pinjaman</h3>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>Bunga: {pinjaman.bungaTahunan}%/tahun</span>
              <span>Tenor: {pinjaman.tenorBulan} bulan</span>
              <span>Tanggal: {formatDate(pinjaman.tanggalPinjaman)}</span>
            </div>
          </div> */}

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Progress Pembayaran</span>
              <span>{persenTerbayar.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${persenTerbayar}%` }}
              />
            </div>
          </div>

          {/* Tabel Angsuran */}
          <div className="overflow-x-auto -mx-6 px-6">
            <div className="min-w-full">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">No</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Jatuh Tempo</th>
                    <th className="text-right py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden sm:table-cell">Pokok</th>
                    <th className="text-right py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden sm:table-cell">Bunga</th>
                    <th className="text-right py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Total</th>
                    <th className="text-right py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Sisa Pinjaman</th>
                    <th className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pinjaman.angsuran.map((angsuran) => (
                    <tr key={angsuran.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-900">{angsuran.bulan}</td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-900">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Calendar size={12} className="text-slate-400 hidden sm:block" />
                          <span className="text-xs sm:text-sm">{formatDate(angsuran.jatuhTempo)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-right text-slate-900 hidden sm:table-cell">{formatRupiah(angsuran.pokok)}</td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-right text-slate-900 hidden sm:table-cell">{formatRupiah(angsuran.bunga)}</td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-right font-semibold text-slate-900">{formatRupiah(angsuran.jumlah)}</td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-right text-slate-900 hidden lg:table-cell">{formatRupiah(angsuran.sisaPinjaman)}</td>
                      <td className="py-3 px-2 sm:px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          angsuran.status === 'terbayar' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {angsuran.status === 'terbayar' ? (
                            <><CheckCircle size={10} /> <span>Terbayar</span></>
                          ) : (
                            <><XCircle size={10} /> <span>Belum</span></>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-center">
                        <button
                          onClick={() => toggleStatusAngsuran(angsuran.id)}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                            angsuran.status === 'terbayar'
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {angsuran.status === 'terbayar' ? 'Batal' : 'Bayar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-semibold">
                    <td colSpan={4} className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-900">Total</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-right text-slate-900">
                      {formatRupiah(pinjaman.angsuran.reduce((sum, a) => sum + a.jumlah, 0))}
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pinjaman;
