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
      link.download = `Goshala_${period}_report.${format}`;  // Clean filename
      link.click();
    } catch (err) {
      alert('Download failed. Make sure backend is running.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white py-16">
      <div className="max-w-5xl mx-auto px-8">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-green-900">📊 Reports & Analytics</h1>
          <p className="text-emerald-600 text-2xl mt-4">Professional attendance reports</p>
        </div>

        <div className="flex flex-wrap gap-6 justify-center mb-20">
          {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-12 py-5 rounded-3xl font-semibold text-xl transition-all duration-300 ${period === p 
                ? 'bg-gradient-to-r from-green-700 to-emerald-700 text-white shadow-2xl scale-105' 
                : 'bg-white shadow-xl hover:bg-emerald-50 hover:shadow-2xl'}`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl mx-auto">
          <button 
            onClick={() => download('excel')}
            className="py-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 text-white text-4xl font-bold hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-6"
          >
            📊 Excel Report
          </button>
          <button 
            onClick={() => download('pdf')}
            className="py-20 rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 text-white text-4xl font-bold hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-6"
          >
            📄 PDF Report
          </button>
        </div>
      </div>
    </div>
  );
}