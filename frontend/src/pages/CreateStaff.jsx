import React, { useState } from "react";
import axios from "axios";

const CreateStaff = () => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    mobile: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

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

    try {
      const res = await axios.post(
        "http://localhost:5000/api/staff",
        {
          name: form.name.trim(),
          username: form.username.trim(),
          password: form.password.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess(res.data.message || "Staff created successfully");
      setForm({
        name: "",
        username: "",
        password: "",
        email: "",
        mobile: "",
      });
    } catch (err) {
      console.error("Create staff error:", err);
      setError(err.response?.data?.error || "Failed to create staff");
    }
  };

  return (
    <div className="card shadow border-0 rounded-4 mt-4">
      <div className="card-body p-4">
        <h4 className="mb-3">Create Staff</h4>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
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

            <div className="col-md-6 mb-3">
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

            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Mobile</label>
              <input
                type="text"
                className="form-control"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Create Staff
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateStaff;