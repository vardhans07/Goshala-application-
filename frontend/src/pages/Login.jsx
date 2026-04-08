import { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Attempting login with:', username); // Debugging

    try {
      const res = await axios.post('http://localhost:5000/api/login', { username, password });
      console.log('Login response:', res.data); // Debugging

      if (res.data.token) {
        onLogin(res.data.token);
      } else {
        setError('No token received');
      }
    } catch (err) {
      console.error('Login failed:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-6xl mb-6 shadow-inner">
            🐄
          </div>
          <h1 className="text-4xl font-bold text-green-900">Goshala QR System</h1>
          <p className="text-emerald-600 mt-2">Daily Attendance & Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-emerald-600 text-lg"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-emerald-600 text-lg"
            required
          />

          {error && <p className="text-red-600 text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold py-5 rounded-3xl text-xl disabled:bg-gray-400 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          First time? Register using Postman on <span className="font-mono">/api/register</span>
        </p>
      </div>
    </div>
  );
}