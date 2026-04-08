import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

export default function Scanner() {
  const [message, setMessage] = useState('');
  const [manualTag, setManualTag] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 280 });
    scanner.render(async (decodedText) => {
      scanner.clear();
      const token = localStorage.getItem('token');
      try {
        const res = await axios.post('http://localhost:5000/api/scans', { tagCode: decodedText, scanMethod: 'QR' }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage(res.data.message);
      } catch (err) {
        setMessage('Scan failed');
      }
    });
    return () => scanner.clear();
  }, []);

  const handleManualRFID = async () => {
    if (!manualTag) return;
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('http://localhost:5000/api/scans', { tagCode: manualTag, scanMethod: 'RFID' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(res.data.message);
      setManualTag('');
    } catch (err) {
      setMessage('Invalid RFID');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-5xl font-bold text-green-900 text-center mb-8">📱 Scan QR or RFID</h1>

        <div id="reader" className="rounded-3xl overflow-hidden shadow-2xl mb-12"></div>

        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <h3 className="text-2xl font-semibold mb-6 text-center">Manual RFID / Ear Tag Entry</h3>
          <input
            type="text"
            value={manualTag}
            onChange={e => setManualTag(e.target.value)}
            placeholder="Enter RFID / Tag Number"
            className="w-full text-center text-3xl font-mono py-8 border-4 border-emerald-300 rounded-3xl focus:outline-none focus:border-green-600"
          />
          <button onClick={handleManualRFID} className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-6 rounded-3xl text-2xl font-bold">
            Mark Attendance (Manual RFID)
          </button>
        </div>

        {message && (
          <div className="mt-10 text-center text-3xl font-bold text-emerald-600 bg-white rounded-3xl p-8 shadow-xl">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}