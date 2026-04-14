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

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    fetchGoshalas("");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchGoshalas(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchGoshalas = async (q) => {
    try {
      const res = await axios.get("http://localhost:5000/api/goshalas", { params: { q } });
      setGoshalas(res.data || []);
    } catch (err) {
      console.error("Error fetching goshalas:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
        headers: { "Content-Type": "application/json" },
      });

      if (res.data.token && res.data.user) {
        onLogin(res.data.token, res.data.user);
      }

      setSuccess(res.data.message || "Login successful");

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handlers
  const sendForgotOtp = async () => {
    setForgotError("");
    setForgotLoading(true);
    try {
      await axios.post("http://localhost:5000/api/forgot-password/send-otp", { email: forgotEmail });
      setForgotStep(2);
      setForgotSuccess("OTP sent to your email");
    } catch (err) {
      setForgotError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const verifyForgotOtp = async () => {
    setForgotError("");
    setForgotLoading(true);
    try {
      await axios.post("http://localhost:5000/api/forgot-password/verify-otp", { email: forgotEmail, otp: forgotOtp });
      setForgotStep(3);
      setForgotSuccess("OTP verified. Set new password");
    } catch (err) {
      setForgotError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match");
      return;
    }
    setForgotLoading(true);
    try {
      await axios.post("http://localhost:5000/api/forgot-password/reset", { email: forgotEmail, newPassword });
      setForgotSuccess("Password reset successfully!");
      setTimeout(() => {
        setShowForgotModal(false);
        navigate("/login");
      }, 1500);
    } catch (err) {
      setForgotError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Login</h2>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

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
                    {goshalas.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}{g.location ? ` - ${g.location}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-link text-danger p-0"
                  onClick={() => setShowForgotModal(true)}
                >
                  Forgot Password?
                </button>
              </div>

              <p className="text-center mt-3 mb-0">
                New goshala owner? <Link to="/register">Register here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reset Password</h5>
                <button type="button" className="btn-close" onClick={() => setShowForgotModal(false)}></button>
              </div>
              <div className="modal-body">
                {forgotError && <div className="alert alert-danger">{forgotError}</div>}
                {forgotSuccess && <div className="alert alert-success">{forgotSuccess}</div>}

                {forgotStep === 1 && (
                  <div>
                    <label className="form-label">Registered Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                    <button className="btn btn-primary w-100 mt-3" onClick={sendForgotOtp} disabled={forgotLoading}>
                      {forgotLoading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                )}

                {forgotStep === 2 && (
                  <div>
                    <label className="form-label">Enter OTP</label>
                    <input
                      type="text"
                      className="form-control"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="6-digit OTP"
                    />
                    <button className="btn btn-success w-100 mt-3" onClick={verifyForgotOtp} disabled={forgotLoading}>
                      {forgotLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                )}

                {forgotStep === 3 && (
                  <form onSubmit={resetPassword}>
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-success w-100" disabled={forgotLoading}>
                      {forgotLoading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;