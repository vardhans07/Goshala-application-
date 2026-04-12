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
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "email") {
      setOtpSent(false);
      setOtpVerified(false);
    }
  };

  const sendOtp = async () => {
    setError("");
    setSuccess("");

    if (!form.email.trim()) {
      setError("Please enter email for OTP");
      return;
    }

    setOtpLoading(true);

    try {
      const payload = {
        email: form.email.trim(),
        mobile: form.mobile.trim(),
      };

      const res = await axios.post(
        "http://localhost:5000/api/register-owner/send-otp",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setOtpSent(true);
      setSuccess(res.data.message || "OTP sent successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    setSuccess("");

    if (!form.email.trim() || !form.otp.trim()) {
      setError("Email and OTP are required");
      return;
    }

    setVerifyLoading(true);

    try {
      const payload = {
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        otp: form.otp.trim(),
      };

      const res = await axios.post(
        "http://localhost:5000/api/register-owner/verify-otp",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setOtpVerified(true);
      setSuccess(res.data.message || "OTP verified");
    } catch (err) {
      setError(err.response?.data?.error || "OTP verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otpVerified) {
      setError("Please verify OTP first");
      return;
    }

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

      const res = await axios.post(
        "http://localhost:5000/api/register-owner",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setSuccess(res.data.message || "Owner registered successfully");

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
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
                  <label className="form-label">Email (required for OTP)</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Mobile (optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile"
                  />
                </div>

                <div className="d-grid mb-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={sendOtp}
                    disabled={!form.email.trim() || otpVerified || otpLoading}
                  >
                    {otpLoading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </div>

                {otpSent && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Enter OTP</label>
                      <input
                        type="text"
                        className="form-control"
                        name="otp"
                        value={form.otp}
                        onChange={handleChange}
                        placeholder="Enter 6-digit OTP"
                      />
                    </div>

                    <div className="d-grid mb-3">
                      <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={verifyOtp}
                        disabled={!form.otp.trim() || otpVerified || verifyLoading}
                      >
                        {otpVerified
                          ? "OTP Verified"
                          : verifyLoading
                          ? "Verifying..."
                          : "Verify OTP"}
                      </button>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={loading || !otpVerified}
                >
                  {loading ? "Registering..." : "Register Owner"}
                </button>
              </form>

              <p className="text-center mt-3 mb-0">
                Already have an account? <Link to="/">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterOwner;