import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

export default function Scanner() {
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState('');
  const [tagCode, setTagCode] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const readerId = 'reader';

  useEffect(() => {
    html5QrCodeRef.current = new Html5Qrcode(readerId);

    return () => {
      stopScanner();
    };
  }, []);

  const submitScan = async (codeValue, method = 'QR') => {
    if (!codeValue || loading) return;

    setLoading(true);
    setStatus('');
    setMessage('');

    try {
      const res = await axios.post(
        'http://localhost:5000/api/scans',
        {
          tagCode: codeValue.trim(),
          scanMethod: method
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTagCode(codeValue.trim());
      setStatus(res.data.status);
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
      setMessage(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to scan tag'
      );
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    setPreview('');
    setTagCode('');
    setStatus('');
    setMessage('');

    try {
      const devices = await Html5Qrcode.getCameras();

      if (!devices || devices.length === 0) {
        setStatus('ERROR');
        setMessage('No camera found');
        return;
      }

      const backCamera =
        devices.find((device) => /back|rear|environment/gi.test(device.label)) ||
        devices[0];

      await html5QrCodeRef.current.start(
        backCamera.id,
        {
          fps: 10,
          qrbox: { width: 230, height: 230 },
          aspectRatio: 1.7778
        },
        async (decodedText) => {
          await stopScanner();
          await submitScan(decodedText, 'QR');
        },
        () => {}
      );

      setIsScanning(true);
    } catch (err) {
      console.error(err);
      setIsScanning(false);
      setStatus('ERROR');
      setMessage('Unable to access camera');
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current?.isScanning) {
        await html5QrCodeRef.current.stop();
      }
    } catch (err) {
      console.error('Stop scanner error:', err);
    }

    try {
      await html5QrCodeRef.current?.clear();
    } catch (err) {
      console.error('Clear scanner error:', err);
    }

    setIsScanning(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTagCode('');
    setStatus('');
    setMessage('');

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);

    try {
      if (html5QrCodeRef.current?.isScanning) {
        await stopScanner();
      }

      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      await submitScan(decodedText, 'QR_IMAGE');
    } catch (err) {
      console.error('File scan error:', err);
      setStatus('ERROR');
      setMessage(
        'QR not detected from image. Upload a closer crop of the QR or enter the printed tag number manually.'
      );
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    if (!tagCode.trim()) {
      setStatus('ERROR');
      setMessage('Please enter tag number');
      return;
    }

    await submitScan(tagCode, 'MANUAL');
  };

  return (
    <div className="app-page">
      <div className="app-container">
        <div className="app-card scanner-card p-6 md:p-8">
          <div className="page-header !text-left !mb-6">
            <h1 className="page-title !text-left !mb-2">QR / Tag Scanner</h1>
            <p className="page-subtitle !text-left">
              Scan by camera, upload an image, or type the printed tag number
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="scanner-reader soft-card p-3">
                <div id={readerId}></div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {!isScanning ? (
                  <button type="button" onClick={startScanner} className="btn-primary !w-auto !px-6">
                    Start Camera
                  </button>
                ) : (
                  <button type="button" onClick={stopScanner} className="btn-stop-camera">
                    Stop Camera
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-upload-image"
                >
                  Upload QR Image
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {preview && (
                <div className="soft-card mt-5 p-4">
                  <p className="mb-3 text-sm font-semibold text-gray-700">Uploaded Preview</p>
                  <img
                    src={preview}
                    alt="Uploaded QR preview"
                    className="mx-auto max-h-72 rounded-2xl border border-emerald-100 object-contain"
                  />
                </div>
              )}
            </div>

            <div>
              <div className="soft-card p-5">
                <h2 className="text-lg font-bold text-green-900">Manual Tag Entry</h2>
                <p className="mt-1 text-sm text-gray-600">
                  If the QR is too small or blurred, enter the visible tag number
                </p>

                <form onSubmit={handleManualSubmit} className="mt-4 space-y-4">
                  <input
                    type="text"
                    value={tagCode}
                    onChange={(e) => setTagCode(e.target.value)}
                    placeholder="Enter tag number"
                    className="input-field"
                  />

                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Submitting...' : 'Submit Tag'}
                  </button>
                </form>
              </div>

              {(tagCode || status || message) && (
                <div className="soft-card mt-5 p-5">
                  {tagCode && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Tag Code:</span> {tagCode}
                    </p>
                  )}

                  {status && (
                    <p className="mt-2 text-sm text-gray-700">
                      <span className="font-semibold">Status:</span> {status}
                    </p>
                  )}

                  {message && (
                    <p
                      className={`mt-3 text-sm font-semibold ${
                        status === 'VALID'
                          ? 'text-emerald-700'
                          : status === 'DUPLICATE'
                          ? 'text-amber-700'
                          : 'text-red-600'
                      }`}
                    >
                      {message}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Tiny ear-tag QR codes may fail from full photos because the code is small and reflective. Your sample tag image shows the printed number is easier to read than the QR, so manual tag entry is the correct fallback. [file:231]
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}