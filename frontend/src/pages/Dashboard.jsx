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
    <div className="app-page">
      <div className="app-container">
        <div className="page-header">
          <h1 className="page-title">Goshala Dashboard</h1>
          <p className="page-subtitle">Real-time animal attendance overview</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="label-muted">Total Animals</p>
                <p className="value-strong mt-3 text-green-900">{data.totalAnimals}</p>
              </div>
              <div className="text-5xl">🐄</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="label-muted">Present Today</p>
                <p className="value-strong mt-3 text-blue-600">{data.presentToday}</p>
              </div>
              <div className="text-5xl">✅</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="label-muted">Missing Today</p>
                <p className="value-strong mt-3 text-red-600">{data.missingToday}</p>
              </div>
              <div className="text-5xl">⚠️</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="label-muted">Attendance Rate</p>
                <p className="value-strong mt-3 text-teal-600">{data.attendancePercent}%</p>
              </div>
              <div className="text-5xl">📈</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}