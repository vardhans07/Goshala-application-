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
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed. Make sure backend is running.');
    }
  };

  return (
    <div className="app-page">
      <div className="app-container">
        <div className="page-header">
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Professional attendance reports for your Goshala</p>
        </div>

        <div className="app-card period-selector p-8">
          {/* Period Selector */}
          <div className="mx-auto mb-12 flex w-full max-w-3xl flex-wrap justify-center gap-3 rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
            {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`min-w-[110px] rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-200 md:text-base ${
                  period === p
                    ? 'bg-green-700 text-black shadow-md'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Excel Card */}
            <div className="Excel-card group rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-600 to-green-700 p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="Excel-card-header mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-5xl text-white">
                📊
              </div>
              <h3 className="text-3xl font-bold text-white">Excel Report</h3>
              <p className="mt-3 text-emerald-100 text-lg">
                Download detailed {period} attendance in spreadsheet format
              </p>
              <div className="mt-8 flex items-center justify-between">
                <span className="rounded-full bg-white/20 px-5 py-2 text-sm font-medium text-black">
                  .xlsx 
                </span>
                <button
                  onClick={() => download('excel')}
                  className="rounded-2xl bg-white px-8 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50 hover:shadow"
                >
                  Download Excel
                </button>
              </div>
            </div>

            {/* PDF Card */}
            <div className="pdf-card group rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-600 to-red-700 p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="pdf-card-header mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-5xl text-white">
                📄
              </div>
              <h3 className="text-3xl font-bold text-white">PDF Report</h3>
              <p className="mt-3 text-rose-100 text-lg">
                Clean printable {period} report with Goshala branding
              </p>
              <div className="mt-8 flex items-center justify-between">
                <span className="rounded-full bg-white/20 px-5 py-2 text-sm font-medium text-black">
                  .pdf 
                </span>
                <button
                  onClick={() => download('pdf')}
                  className="rounded-2xl bg-white px-8 py-3 font-semibold text-rose-700 transition hover:bg-rose-50 hover:shadow"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center text-sm text-gray-500">
            Reports include Goshala name, date range, attendance summary, and detailed scan logs.
          </div>
        </div>
      </div>
    </div>
  );
}