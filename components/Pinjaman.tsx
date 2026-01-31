import React, { useState, useEffect } from 'react';
import { Calculator, Calendar, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import type { Angsuran, Pinjaman } from '../types';

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

  const toggleStatusAngsuran = (angsuranId: string) => {
    if (!pinjaman) return;

    setPinjaman({
      ...pinjaman,
      angsuran: pinjaman.angsuran.map(a =>
        a.id === angsuranId
          ? { ...a, status: a.status === 'terbayar' ? 'belum_terbayar' : 'terbayar' }
          : a
      )
    });
  };

  const formatRupiah = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
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

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            Pinjaman Baru
          </button>
        </div>

        {pinjaman && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-500 text-sm mb-1">Total Pinjaman</p>
              <p className="text-xl font-bold text-slate-900">{formatRupiah(pinjaman.jumlahPinjaman)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-green-600 text-sm mb-1">Terbayar</p>
              <p className="text-xl font-bold text-green-700">{formatRupiah(totalTerbayar)}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-orange-600 text-sm mb-1">Belum Terbayar</p>
              <p className="text-xl font-bold text-orange-700">{formatRupiah(totalBelumTerbayar)}</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-indigo-600 text-sm mb-1">Progress</p>
              <p className="text-xl font-bold text-indigo-700">{persenTerbayar.toFixed(1)}%</p>
            </div>
          </div>
        )}
      </div>

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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Detail Pinjaman</h3>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>Bunga: {pinjaman.bungaTahunan}%/tahun</span>
              <span>Tenor: {pinjaman.tenorBulan} bulan</span>
              <span>Tanggal: {formatDate(pinjaman.tanggalPinjaman)}</span>
            </div>
          </div>

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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">No</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Jatuh Tempo</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Pokok</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Bunga</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Total</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Sisa Pinjaman</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pinjaman.angsuran.map((angsuran) => (
                  <tr key={angsuran.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-900">{angsuran.bulan}</td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        {formatDate(angsuran.jatuhTempo)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-slate-900">{formatRupiah(angsuran.pokok)}</td>
                    <td className="py-3 px-4 text-sm text-right text-slate-900">{formatRupiah(angsuran.bunga)}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-slate-900">{formatRupiah(angsuran.jumlah)}</td>
                    <td className="py-3 px-4 text-sm text-right text-slate-900">{formatRupiah(angsuran.sisaPinjaman)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        angsuran.status === 'terbayar' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {angsuran.status === 'terbayar' ? (
                          <><CheckCircle size={12} /> Terbayar</>
                        ) : (
                          <><XCircle size={12} /> Belum Terbayar</>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleStatusAngsuran(angsuran.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          angsuran.status === 'terbayar'
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {angsuran.status === 'terbayar' ? 'Tandai Belum' : 'Tandai Bayar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-semibold">
                  <td colSpan={4} className="py-3 px-4 text-sm text-slate-900">Total</td>
                  <td className="py-3 px-4 text-sm text-right text-slate-900">
                    {formatRupiah(pinjaman.angsuran.reduce((sum, a) => sum + a.jumlah, 0))}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pinjaman;
