import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function Settings({ user, logout }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: '', // You can fetch this if needed
    role: user?.role || 'STAFF',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert('Settings saved successfully! (Backend integration pending)');
    // TODO: Call API to update user
  };

  return (
    <>
      <Navbar user={user} logout={logout} />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={formData.role}
                disabled
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-2xl text-gray-500"
              />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-emerald-600 text-white font-medium rounded-2xl hover:bg-emerald-700 transition"
            >
              Save Changes
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-8 py-3 border border-gray-300 font-medium rounded-2xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
