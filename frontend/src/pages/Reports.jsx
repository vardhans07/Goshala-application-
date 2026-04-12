import { useState } from 'react';
import axios from 'axios';

export default function Reports() {
  const [period, setPeriod] = useState('daily');
  const token = localStorage.getItem('token');

  const download = async (format) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reports/${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      link.download = `Goshala_${period}_report.${extension}`;
      link.click();
    } catch (err) {
      alert('Download failed. Make sure backend is running.');
    }
  };

  return (
    <div className="app-page">
      <div className="app-container">
        <div className="page-header">
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Download professional attendance reports</p>
        </div>

        <div className="app-card p-6 md:p-8">
          <div className="mx-auto mb-10 flex w-full max-w-3xl flex-wrap justify-center gap-3 rounded-3xl border border-emerald-100 bg-emerald-50 p-3">
            {['daily', 'weekly', 'monthly', 'yearly'].map((p) => {
              const active = period === p;

              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={
                    active
                      ? '!bg-green-700 !text-white !border-green-700 min-w-[120px] rounded-2xl border px-5 py-3 text-sm font-semibold shadow-md transition-all duration-200 md:text-base'
                      : 'min-w-[120px] rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 md:text-base'
                  }
                >
                  {p.toUpperCase()}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-6 mx-auto max-w-4xl md:grid-cols-2">
            <div className="rounded-[24px] border border-emerald-100 bg-gradient-to-br from-green-500 to-emerald-600 p-8 md:p-10 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl text-white">
                📊
              </div>
              <h3 className="text-2xl font-bold text-white">Excel Report</h3>
              <p className="mt-2 text-green-50">Download {period} attendance spreadsheet</p>

              <div className="mt-6 flex items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white">
                  Export as .xlsx
                </span>
                <button
                  onClick={() => download('excel')}
                  className="rounded-xl bg-white px-5 py-2.5 font-semibold text-green-700 transition hover:bg-green-50"
                >
                  Download
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-rose-100 bg-gradient-to-br from-rose-500 to-red-600 p-8 md:p-10 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl text-white">
                📄
              </div>
              <h3 className="text-2xl font-bold text-white">PDF Report</h3>
              <p className="mt-2 text-rose-50">Download {period} printable report</p>

              <div className="mt-6 flex items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white">
                  Export as .pdf
                </span>
                <button
                  onClick={() => download('pdf')}
                  className="rounded-xl bg-white px-5 py-2.5 font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}