import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const RegisterOwner = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    goshalaName: "",
    location: "",
    ownerName: "",
    username: "",
    password: "",
    email: "",
    mobile: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        goshalaName: form.goshalaName.trim(),
        location: form.location.trim(),
        ownerName: form.ownerName.trim(),
        username: form.username.trim(),
        password: form.password.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
      };

      const res = await axios.post("http://localhost:5000/api/register-owner", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setSuccess(res.data.message || "Owner registered successfully");

     setTimeout(() => {
  navigate("/login");
}, 1200);
    } catch (err) {
      console.error("Register owner error:", err);
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Register Goshala Owner</h2>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Goshala Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="goshalaName"
                    value={form.goshalaName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Owner Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="ownerName"
                    value={form.ownerName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email or leave blank if using mobile"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Mobile</label>
                  <input
                    type="text"
                    className="form-control"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile or leave blank if using email"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register Owner"}
                </button>
              </form>

             <p className="text-center mt-3 mb-0">
  Already have an account? <Link to="/login">Login here</Link>
</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterOwner;