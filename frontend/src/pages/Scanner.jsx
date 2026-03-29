import { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import axios from 'axios';

export default function Scanner() {
  const [result, setResult] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    scanner.render(
      async (decodedText) => {
        setResult(decodedText);
        scanner.clear();

        const token = localStorage.getItem('token');
        try {
          const res = await axios.post('http://localhost:5000/api/scans', 
            { tagCode: decodedText, scanMethod: 'QR' },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setMessage(res.data.message);
        } catch (err) {
          setMessage('Scan failed');
        }
      },
      (error) => console.warn(error)
    );

    return () => scanner.clear();
  }, []);

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">QR Scanner</h1>
      <div id="reader" className="border-2 border-green-600 rounded-xl overflow-hidden"></div>
      {result && <p className="mt-4 text-center">Scanned: {result}</p>}
      {message && <p className="mt-4 text-center font-semibold text-green-600">{message}</p>}
    </div>
  );
}