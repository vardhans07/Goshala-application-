import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

export default function Dashboard() {
  const [data, setData] = useState({});
  const socket = io('http://localhost:5000');

  useEffect(() => {
    axios.get('http://localhost:5000/api/dashboard', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setData(res.data));

    socket.on('scanUpdate', () => {
      // refresh dashboard
      axios.get('http://localhost:5000/api/dashboard', { ... }).then(res => setData(res.data));
    });
  }, []);

  return (
    <div>
      <h1>Real-time Cow Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
        <div>Total Animals: {data.totalAnimals}</div>
        <div>Present Today: {data.presentToday}</div>
        <div>Missing: {data.missingToday}</div>
        <div>Sick: {data.sickAnimals}</div>
      </div>
      <h2>Not Scanned Alert: {data.alerts} animals</h2>
      {/* Chart for daily trends */}
      <Bar data={{ labels: ['Mon','Tue','Wed'], datasets: [{ label: 'Scans', data: [12, 19, 8] }] }} />
    </div>
  );
}
