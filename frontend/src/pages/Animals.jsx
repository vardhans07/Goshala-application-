import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Animals() {
  const [animals, setAnimals] = useState([]);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [form, setForm] = useState({ tagCode: '', name: '', breed: '', age: '', healthNotes: '', photoUrl: '' });
  const [preview, setPreview] = useState(null);
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

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setForm({ ...form, photoUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAnimal) {
        await axios.put(`http://localhost:5000/api/animals/${editingAnimal.id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('✅ Animal updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/animals', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('✅ Animal registered with QR Code!');
      }
      fetchAnimals();
      setEditingAnimal(null);
      setForm({ tagCode: '', name: '', breed: '', age: '', healthNotes: '', photoUrl: '' });
      setPreview(null);
    } catch (err) {
      setMessage(err.response?.data?.error || '❌ Error. Check if Tag Code is unique.');
    }
  };

  const startEdit = (animal) => {
    setEditingAnimal(animal);
    setForm({
      tagCode: animal.tagCode,
      name: animal.name || '',
      breed: animal.breed || '',
      age: animal.age || '',
      healthNotes: animal.healthNotes || '',
      photoUrl: animal.photoUrl || ''
    });
    setPreview(animal.photoUrl || null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-green-900">🐄 Animal Management</h1>
          <p className="text-emerald-600 mt-3 text-xl">Register • Edit • Track Cows with QR & RFID</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-10">
            <h2 className="text-3xl font-semibold mb-8 text-green-800">
              {editingAnimal ? 'Edit Animal Details' : 'Register New Animal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <input type="text" placeholder="Tag Code / RFID *" value={form.tagCode} onChange={e => setForm({...form, tagCode: e.target.value})} className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-green-600 text-lg" required />
              <input type="text" placeholder="Animal Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-green-600 text-lg" />
              <input type="text" placeholder="Breed *" value={form.breed} onChange={e => setForm({...form, breed: e.target.value})} className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-green-600 text-lg" required />
              <div className="grid grid-cols-2 gap-6">
                <input type="number" placeholder="Age" value={form.age} onChange={e => setForm({...form, age: e.target.value})} className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-green-600 text-lg" />
                <select value={form.status || 'ACTIVE'} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-green-600 text-lg">
                  <option value="ACTIVE">Active</option>
                  <option value="SICK">Sick</option>
                  <option value="MISSING">Missing</option>
                </select>
              </div>
              <textarea placeholder="Health Notes" value={form.healthNotes} onChange={e => setForm({...form, healthNotes: e.target.value})} className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:border-green-600 h-28" />
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={handlePhoto} className="w-full" />
                {preview && <img src={preview} className="mt-4 w-40 h-40 object-cover rounded-3xl mx-auto border-4 border-green-200" />}
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-5 rounded-3xl text-xl font-bold hover:from-green-700 hover:to-teal-700 transition">
                {editingAnimal ? 'Update Animal' : 'Register Animal & Generate QR'}
              </button>
            </form>
            {message && <p className="mt-6 text-center text-lg font-medium text-green-600">{message}</p>}
          </div>

          {/* List */}
          <div>
            <h2 className="text-3xl font-semibold mb-8 text-green-800">Registered Animals ({animals.length})</h2>
            <div className="space-y-8">
              {animals.map(animal => (
                <div key={animal.id} className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all border border-green-100">
                  <div className="flex gap-6">
                    {animal.photoUrl && <img src={animal.photoUrl} className="w-28 h-28 object-cover rounded-3xl" />}
                    <div className="flex-1">
                      <p className="font-mono text-3xl font-bold text-green-700">{animal.tagCode}</p>
                      <h3 className="text-2xl font-semibold mt-1">{animal.name || 'Unnamed Cow'}</h3>
                      <p className="text-emerald-600">Breed: {animal.breed} • Age: {animal.age || 'N/A'}</p>
                      <button onClick={() => startEdit(animal)} className="mt-6 text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2">
                        ✏️ Edit Animal Details
                      </button>
                    </div>
                    {animal.qrCodeUrl && <img src={animal.qrCodeUrl} className="w-32 h-32 border p-2 rounded-2xl" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}