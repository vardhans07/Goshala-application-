import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero-section text-white">
        <div className="container py-5">
          <div className="row align-items-center min-vh-50">
            <div className="col-lg-7">
              <span className="badge bg-light text-success px-3 py-2 mb-3">
                Smart Goshala Management
              </span>
              <h1 className="display-4 fw-bold mb-3">
                Welcome to Goshala Attendance & Animal Tracking System
              </h1>
              <p className="lead mb-4">
                Manage animals, scan QR codes, track attendance, and generate reports
                from one simple dashboard.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <Link to="/login" className="btn btn-light btn-lg px-4">
                  Login
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-lg px-4">
                  Register
                </Link>
              </div>
            </div>

            <div className="col-lg-5 mt-4 mt-lg-0">
              <div className="hero-card shadow-lg">
                <img
                  src="/cowimg.jpg"
                  alt="Goshala"
                  className="img-fluid rounded-4 w-100 hero-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-success">Main Features</h2>
            <p className="text-muted">Everything you need to manage your goshala smoothly.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card h-100">
                <h4 className="fw-bold text-success">Animal Management</h4>
                <p className="text-muted mb-0">
                  Add, update, and organize animal records with photo, breed, age, and health details.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-card h-100">
                <h4 className="fw-bold text-success">QR Scanner</h4>
                <p className="text-muted mb-0">
                  Scan animal QR codes quickly for attendance and identification.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-card h-100">
                <h4 className="fw-bold text-success">Smart Reports</h4>
                <p className="text-muted mb-0">
                  View animal activity, attendance, and operational summaries in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .hero-section {
          background: linear-gradient(135deg, #198754 0%, #157347 100%);
        }

        .min-vh-50 {
          min-height: 70vh;
        }

        .hero-card {
          background: rgba(255,255,255,0.12);
          border-radius: 24px;
          padding: 14px;
          backdrop-filter: blur(8px);
        }

        .hero-image {
          object-fit: cover;
          max-height: 420px;
        }

        .feature-card {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 14px 30px rgba(0,0,0,0.12);
        }
      `}</style>
    </div>
  );
}