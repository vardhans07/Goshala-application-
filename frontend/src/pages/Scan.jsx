import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

export default function Scan() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 });
    scanner.render(async (decodedText) => {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/scans', {
        tagCode: decodedText,
        latitude: 28.6139,
        longitude: 77.2090
      }, { headers: { Authorization: `Bearer ${token}` } });
      setResult(res.data);
    });
  }, []);

  return (
    <div>
      <h1>Scan Cow Tag (QR / RFID note)</h1>
      <div id="reader" style={{ width: '100%' }}></div>
      {result && <h2 style={{ color: result.status === 'VALID' ? 'green' : 'red' }}>{result.message}</h2>}
    </div>
  );
}
