import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Animals() {
  const [animals, setAnimals] = useState([]);
  const [form, setForm] = useState({ tagCode: '', name: '', breed: '', age: '', healthNotes: '' });
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/animals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnimals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/animals', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Animal registered successfully with QR Code!');
      setForm({ tagCode: '', name: '', breed: '', age: '', healthNotes: '' });
      fetchAnimals();
    } catch (err) {
      setMessage('Error registering animal');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-green-700 mb-8">Animal Registration</h1>

      {/* Registration Form */}
      <div className="bg-white p-8 rounded-2xl shadow mb-10">
        <h2 className="text-2xl font-semibold mb-6">Register New Animal</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Tag Code (Unique ID)"
            value={form.tagCode}
            onChange={(e) => setForm({ ...form, tagCode: e.target.value })}
            className="border p-3 rounded-xl"
            required
          />
          <input
            type="text"
            placeholder="Animal Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-3 rounded-xl"
          />
          <input
            type="text"
            placeholder="Breed"
            value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })}
            className="border p-3 rounded-xl"
            required
          />
          <input
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) })}
            className="border p-3 rounded-xl"
          />
          <textarea
            placeholder="Health Notes"
            value={form.healthNotes}
            onChange={(e) => setForm({ ...form, healthNotes: e.target.value })}
            className="border p-3 rounded-xl md:col-span-2"
            rows="3"
          />
          <button
            type="submit"
            className="bg-green-700 text-white py-3 rounded-xl font-semibold md:col-span-2 hover:bg-green-800"
          >
            Register Animal & Generate QR
          </button>
        </form>
        {message && <p className="mt-4 text-center font-medium text-green-600">{message}</p>}
      </div>

      {/* Animals List */}
      <h2 className="text-2xl font-semibold mb-4">Registered Animals ({animals.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animals.map((animal) => (
          <div key={animal.id} className="bg-white p-6 rounded-2xl shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-mono text-lg font-bold text-green-700">{animal.tagCode}</p>
                <h3 className="text-xl font-semibold mt-1">{animal.name || 'Unnamed'}</h3>
                <p className="text-gray-600">Breed: {animal.breed}</p>
                {animal.age && <p>Age: {animal.age} years</p>}
              </div>
              {animal.qrCodeUrl && (
                <img src={animal.qrCodeUrl} alt="QR Code" className="w-24 h-24 border p-1 rounded" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}