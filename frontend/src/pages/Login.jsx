import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
    goshalaId: "",
  });

  const [search, setSearch] = useState("");
  const [goshalas, setGoshalas] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGoshalas("");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGoshalas(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchGoshalas = async (q) => {
    try {
      const res = await axios.get("http://localhost:5000/api/goshalas", {
        params: { q },
      });
      setGoshalas(res.data || []);
    } catch (err) {
      console.error("Error fetching goshalas:", err);
    }
  };

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
        identifier: form.identifier.trim(),
        password: form.password.trim(),
        goshalaId: Number(form.goshalaId),
      };

      const res = await axios.post("http://localhost:5000/api/login", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.data.token && res.data.user) {
        onLogin(res.data.token, res.data.user);
      }

      setSuccess(res.data.message || "Login successful");

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Login</h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email / Mobile / Username</label>
                  <input
                    type="text"
                    className="form-control"
                    name="identifier"
                    placeholder="Enter email, mobile or username"
                    value={form.identifier}
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
                    placeholder="Enter password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Search Goshala Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search goshala name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Goshala</label>
                  <select
                    className="form-select"
                    name="goshalaId"
                    value={form.goshalaId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select goshala</option>
                    {goshalas.map((goshala) => (
                      <option key={goshala.id} value={goshala.id}>
                        {goshala.name}{goshala.location ? ` - ${goshala.location}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="text-center mt-3 mb-0">
                New goshala owner? <Link to="/register">Register here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;