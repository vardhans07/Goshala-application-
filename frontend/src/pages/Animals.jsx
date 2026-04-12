import { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';

export default function Animals({ user }) {
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    tagCode: '',
    name: '',
    breed: '',
    age: '',
    healthNotes: '',
    photoUrl: '',
    status: 'ACTIVE',
  });

  const [preview, setPreview] = useState(null);
  const token = localStorage.getItem('token');

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAnimals(animals);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = animals.filter(
      (animal) =>
        animal.tagCode?.toLowerCase().includes(term) ||
        animal.name?.toLowerCase().includes(term) ||
        animal.breed?.toLowerCase().includes(term)
    );
    setFilteredAnimals(filtered);
  }, [animals, searchTerm]);

  const showAccessDenied = () => {
    window.alert("You don't have access to edit or delete animals. Only admin can perform this action.");
  };

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/animals`, authHeader);
      const data = Array.isArray(res.data) ? res.data : [];
      setAnimals(data);
      setFilteredAnimals(data);
    } catch (err) {
      console.error('fetchAnimals error:', err);
      setMessage(err.response?.data?.error || 'Failed to load animals');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingAnimal(null);
    setPreview(null);
    setForm({
      tagCode: '',
      name: '',
      breed: '',
      age: '',
      healthNotes: '',
      photoUrl: '',
      status: 'ACTIVE',
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setForm((prev) => ({ ...prev, photoUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const payload = {
      ...form,
      age: form.age === '' || form.age == null ? null : Number(form.age),
    };

    try {
      if (editingAnimal) {
        if (user?.role !== 'ADMIN') {
          showAccessDenied();
          return;
        }

        const res = await axios.put(
          `${API}/api/animals/${editingAnimal.id}`,
          payload,
          authHeader
        );

        setAnimals((prev) =>
          prev.map((item) =>
            item.id === editingAnimal.id ? res.data : item
          )
        );
        setMessage('Animal updated successfully');
      } else {
        const res = await axios.post(
          `${API}/api/animals`,
          payload,
          authHeader
        );
        setAnimals((prev) => [res.data, ...prev]);
        setMessage('Animal registered successfully');
      }

      resetForm();
    } catch (err) {
      console.error('handleSubmit error:', err);

      if (err.response?.status === 403) {
        showAccessDenied();
        return;
      }

      setMessage(err.response?.data?.error || 'Failed to save animal');
    }
  };

  const startEdit = (animal) => {
    if (user?.role !== 'ADMIN') {
      showAccessDenied();
      return;
    }

    setEditingAnimal(animal);
    setPreview(animal.photoUrl || null);
    setForm({
      tagCode: animal.tagCode || '',
      name: animal.name || '',
      breed: animal.breed || '',
      age: animal.age ?? '',
      healthNotes: animal.healthNotes || '',
      photoUrl: animal.photoUrl || '',
      status: animal.status || 'ACTIVE',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (user?.role !== 'ADMIN') {
      showAccessDenied();
      return;
    }

    const ok = window.confirm('Are you sure you want to delete this animal?');
    if (!ok) return;

    try {
      await axios.delete(`${API}/api/animals/${id}`, authHeader);
      setAnimals((prev) => prev.filter((item) => item.id !== id));
      setMessage('Animal deleted successfully');

      if (editingAnimal?.id === id) resetForm();
    } catch (err) {
      console.error('handleDelete error:', err);

      if (err.response?.status === 403) {
        showAccessDenied();
        return;
      }

      setMessage(err.response?.data?.error || 'Failed to delete animal');
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row g-4">
        <div className="col-12 col-xl-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body p-4">
              <h3 className="fw-bold mb-3 text-success">
                {editingAnimal ? 'Edit Animal' : 'Register Animal'}
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Tag Code / RFID *</label>
                  <input
                    type="text"
                    name="tagCode"
                    value={form.tagCode}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Animal Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Breed *</label>
                  <input
                    type="text"
                    name="breed"
                    value={form.breed}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Years"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="SICK">SICK</option>
                      <option value="MISSING">MISSING</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Health Notes</label>
                  <textarea
                    rows="3"
                    name="healthNotes"
                    value={form.healthNotes}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Optional notes"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                    className="form-control"
                  />
                </div>

                {preview && (
                  <div className="mb-3 text-center">
                    <img
                      src={preview}
                      alt="Preview"
                      className="rounded border object-fit-cover"
                      style={{ width: '80px', height: '80px' }}
                    />
                  </div>
                )}

                <div className="d-flex gap-2 flex-wrap">
                  <button type="submit" className="btn btn-success">
                    {editingAnimal ? 'Update Animal' : 'Register Animal'}
                  </button>

                  {editingAnimal && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {message && (
                  <div
                    className={`alert mt-3 mb-0 ${
                      message.toLowerCase().includes('failed') ||
                      message.toLowerCase().includes('error')
                        ? 'alert-danger'
                        : 'alert-success'
                    }`}
                  >
                    {message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-0">
            <div className="p-4 border-bottom bg-white">
              <div className="row align-items-center g-3">
                <div className="col-md-6">
                  <h4 className="fw-bold text-success mb-0">
                    Registered Animals
                  </h4>
                  <div className="text-muted small">
                    Total entries: {animals.length}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search by Tag Code / Name / Breed..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ maxWidth: '320px' }}
                    />
                    <span
                      className="badge rounded-pill text-bg-success px-3 py-2"
                      style={{ fontSize: '12px', width: '48px' }}
                    >
                      {filteredAnimals.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="animals-table-wrapper">
              <table className="table table-hover mb-0 align-middle animals-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>No.</th>
                    <th style={{ width: '200px' }}>Animal</th>
                    <th style={{ width: '130px' }}>Breed</th>
                    <th style={{ width: '60px' }}>Age</th>
                    <th style={{ width: '85px' }}>Status</th>
                    <th style={{ width: '80px' }}>QR</th>
                    <th style={{ width: '160px' }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        Loading animals...
                      </td>
                    </tr>
                  ) : filteredAnimals.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        {searchTerm
                          ? 'No animals found matching your search.'
                          : 'No animals registered yet.'}
                      </td>
                    </tr>
                  ) : (
                    filteredAnimals.map((animal, index) => (
                      <tr key={animal.id}>
                        <td className="text-muted fw-semibold">
                          {index + 1}
                        </td>

                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle overflow-hidden border bg-light flex-shrink-0 d-flex align-items-center justify-content-center"
                              style={{
                                width: '30px',
                                height: '30px',
                                fontSize: '12px',
                              }}
                            >
                              {animal.photoUrl ? (
                                <img
                                  src={animal.photoUrl}
                                  alt={animal.name || 'Animal'}
                                  className="w-100 h-100 object-fit-cover rounded-circle"
                                />
                              ) : (
                                '🐄'
                              )}
                            </div>

                            <div className="min-w-0">
                              <div
                                className="fw-semibold text-truncate animal-name-cell"
                                title={animal.name || 'Unnamed'}
                              >
                                {animal.name || 'Unnamed'}
                              </div>
                              <div
                                className="text-muted font-monospace text-truncate animal-tag-cell"
                                title={animal.tagCode}
                              >
                                {animal.tagCode}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="small">{animal.breed || '-'}</td>
                        <td className="small text-center">
                          {animal.age ?? '-'}
                        </td>

                        <td>
                          <span
                            className={`badge rounded-pill fw-semibold px-2 py-1 ${
                              animal.status === 'ACTIVE'
                                ? 'text-bg-success'
                                : animal.status === 'SICK'
                                ? 'text-bg-warning'
                                : 'text-bg-danger'
                            }`}
                            style={{ fontSize: '10px' }}
                          >
                            {animal.status || 'ACTIVE'}
                          </span>
                        </td>

                        <td>
                          {animal.qrCodeUrl ? (
                            <img
                              src={animal.qrCodeUrl}
                              alt="QR Code"
                              className="rounded border bg-white p-1 qr-thumb"
                              title={`Scan: ${animal.tagCode}`}
                            />
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>

                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            <button
                              className="btn btn-outline-success btn-sm action-btn"
                              onClick={() => startEdit(animal)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-outline-danger btn-sm action-btn"
                              onClick={() => handleDelete(animal.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animals-table-wrapper {
          max-height: 520px;
          overflow-y: auto;
          overflow-x: auto;
          border-top: 1px solid #dee2e6;
          position: relative;
        }

        .animals-table {
          width: 100%;
          min-width: 800px;
          margin-bottom: 0;
        }

        .animals-table thead th {
          position: sticky;
          top: 0;
          z-index: 5;
          background: #f8f9fa !important;
          border-bottom: 2px solid #dee2e6 !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          white-space: nowrap;
          padding: 10px 8px !important;
          text-align: left;
        }

        .animals-table tbody td {
          padding: 8px !important;
          height: 48px;
          background: #fff;
          border-color: #f0f0f0;
        }

        .animals-table tbody tr:hover {
          background-color: rgba(25, 135, 84, 0.06) !important;
        }

        .animal-name-cell {
          font-size: 13px;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .animal-tag-cell {
          font-size: 11px;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .action-btn {
          min-width: 60px;
          font-size: 11px !important;
          font-weight: 600;
          padding: 4px 10px !important;
        }

        .qr-thumb {
          width: 36px;
          height: 36px;
          object-fit: contain;
          cursor: pointer;
        }

        .animals-table-wrapper::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .animals-table-wrapper::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .animals-table-wrapper::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        .animals-table-wrapper::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        @media (max-width: 768px) {
          .animals-table-wrapper {
            max-height: 420px;
          }

          .animals-table {
            min-width: 720px;
          }

          .animals-table thead th {
            font-size: 10px !important;
            padding: 8px 6px !important;
          }

          .animals-table tbody td {
            padding: 7px 6px !important;
            height: 46px;
          }

          .action-btn {
            min-width: 56px;
            font-size: 10px !important;
            padding: 4px 8px !important;
          }

          .animal-name-cell {
            font-size: 12px;
            max-width: 100px;
          }

          .animal-tag-cell {
            font-size: 10px;
            max-width: 100px;
          }

          .qr-thumb {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </div>
  );
}