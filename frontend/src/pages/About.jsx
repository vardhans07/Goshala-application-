export default function About() {
  return (
    <div className="about-page py-5 bg-light min-vh-100">
      <div className="container">
        <div className="about-card mx-auto">
          <div className="text-center mb-4">
            <h1 className="fw-bold text-success">About Us</h1>
            <p className="text-muted mb-0">
              A smart and simple platform for modern goshala management.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="info-box h-100">
                <h4 className="fw-bold text-success">Our Mission</h4>
                <p className="mb-0 text-muted">
                  We aim to make animal management easier with digital tools for registration,
                  tracking, scanning, and reporting.
                </p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="info-box h-100">
                <h4 className="fw-bold text-success">Why This System</h4>
                <p className="mb-0 text-muted">
                  This system reduces manual work and helps staff and admins manage daily
                  activities faster and more accurately.
                </p>
              </div>
            </div>

            <div className="col-12">
              <div className="info-box">
                <h4 className="fw-bold text-success">What We Provide</h4>
                <ul className="mb-0 text-muted">
                  <li>Animal registration and profile management.</li>
                  <li>QR code-based identification and scanning.</li>
                  <li>Attendance tracking and reporting.</li>
                  <li>Role-based access for admin and staff users.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .about-card {
          max-width: 1000px;
          background: #fff;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }

        .info-box {
          background: #f8f9fa;
          border-left: 5px solid #198754;
          border-radius: 16px;
          padding: 22px;
        }

        @media (max-width: 768px) {
          .about-card {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}