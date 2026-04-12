import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // here you can call /api/forgot-password (your backend)
    setSent(true);
  };

  return (
    <div className="auth-wrapper py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="card border-0 shadow-lg auth-card">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Reset Password</h2>
                  <p className="text-muted">
                    Enter your email and we’ll send password reset instructions.
                  </p>
                </div>

                {!sent ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-success w-100 py-2">
                      Send Reset Link
                    </button>
                  </form>
                ) : (
                  <div className="text-center">
                    <div className="alert alert-success py-2">
                      Reset link sent to <strong>{email}</strong>.
                    </div>
                    <Link to="/login" className="btn btn-outline-dark btn-sm">
                      Back to Login
                    </Link>
                  </div>
                )}

                <div className="text-center mt-4">
                  <Link to="/login" className="text-muted small">
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}