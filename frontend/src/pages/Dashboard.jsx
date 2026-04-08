import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [data, setData] = useState({
    totalAnimals: 0,
    presentToday: 0,
    missingToday: 0,
    attendancePercent: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setData(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 bg-white shadow-2xl px-10 py-6 rounded-3xl mb-6">
            <span className="text-6xl">🐄</span>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-green-800 to-emerald-700 bg-clip-text text-transparent">Goshala Dashboard</h1>
          </div>
          <p className="text-2xl text-emerald-700">Real-time Animal Attendance Overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-3xl shadow-2xl p-10 hover:-translate-y-3 transition-all duration-300 border border-emerald-100 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-600 text-sm font-medium tracking-widest">TOTAL ANIMALS</p>
                <p className="text-7xl font-bold text-green-900 mt-6 group-hover:scale-110 transition-transform">{data.totalAnimals}</p>
              </div>
              <div className="text-7xl opacity-70 group-hover:scale-110 transition-transform">🐄</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-10 hover:-translate-y-3 transition-all duration-300 border border-emerald-100 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-600 text-sm font-medium tracking-widest">PRESENT TODAY</p>
                <p className="text-7xl font-bold text-blue-600 mt-6 group-hover:scale-110 transition-transform">{data.presentToday}</p>
              </div>
              <div className="text-7xl opacity-70 group-hover:scale-110 transition-transform">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-10 hover:-translate-y-3 transition-all duration-300 border border-emerald-100 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-red-600 text-sm font-medium tracking-widest">MISSING TODAY</p>
                <p className="text-7xl font-bold text-red-600 mt-6 group-hover:scale-110 transition-transform">{data.missingToday}</p>
              </div>
              <div className="text-7xl opacity-70 group-hover:scale-110 transition-transform">⚠️</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-10 hover:-translate-y-3 transition-all duration-300 border border-emerald-100 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-teal-600 text-sm font-medium tracking-widest">ATTENDANCE RATE</p>
                <p className="text-7xl font-bold text-teal-600 mt-6 group-hover:scale-110 transition-transform">{data.attendancePercent}%</p>
              </div>
              <div className="text-7xl opacity-70 group-hover:scale-110 transition-transform">📈</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}