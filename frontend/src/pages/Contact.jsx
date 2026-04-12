export default function Contact() {
  return (
    <div className="contact-page py-5 bg-light min-vh-100">
      <div className="container">
        <div className="contact-card mx-auto">
          <div className="text-center mb-4">
            <h1 className="fw-bold text-success">Contact Us</h1>
            <p className="text-muted mb-0">
              Reach out for support, suggestions, or system help.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-5">
              <div className="contact-info-box">
                <h4 className="fw-bold text-success mb-3">Get in Touch</h4>
                <p className="mb-2"><strong>Email:</strong> support@goshala.com</p>
                <p className="mb-2"><strong>Phone:</strong> +91 9876543210</p>
                <p className="mb-0"><strong>Location:</strong> Mumbai, India</p>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="contact-form-box">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control" placeholder="Enter your name" />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="Enter your email" />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea
                      rows="5"
                      className="form-control"
                      placeholder="Write your message"
                    ></textarea>
                  </div>

                  <button type="button" className="btn btn-success px-4">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .contact-card {
          max-width: 1100px;
          background: #fff;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }

        .contact-info-box,
        .contact-form-box {
          background: #f8f9fa;
          border-radius: 18px;
          padding: 24px;
          height: 100%;
        }

        .form-control {
          border-radius: 12px;
          padding: 12px 14px;
        }

        @media (max-width: 768px) {
          .contact-card {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}