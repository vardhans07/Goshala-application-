import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setData(res.data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-green-700 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg text-gray-600">Total Animals</h3>
          <p className="text-5xl font-bold text-green-700 mt-2">{data.totalAnimals || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg text-gray-600">Present Today</h3>
          <p className="text-5xl font-bold text-blue-600 mt-2">{data.presentToday || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg text-gray-600">Missing Today</h3>
          <p className="text-5xl font-bold text-red-600 mt-2">{data.missingToday || 0}</p>
        </div>
      </div>
    </div>
  );
}