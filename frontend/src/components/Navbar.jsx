import { NavLink } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

export default function Navbar({ logout, user }) {
  const navLinkClass = ({ isActive }) =>
    `custom-nav-link ${isActive ? 'active' : ''}`;

  return (
    <>
      <nav className="navbar navbar-dark sticky-top shadow-sm goshala-navbar">
        <div className="container-fluid px-3 px-lg-4">
          <div className="navbar-inner w-100">
            <NavLink
              to="/dashboard"
              className="navbar-brand d-flex align-items-center gap-2 mb-0 text-decoration-none"
            >
              <div
                className="logo-wrap overflow-hidden rounded-circle"
                style={{ width: '42px', height: '42px', flexShrink: 0 }}
              >
                <img
                  src="/cowimg.jpg"
                  alt="Goshala Logo"
                  className="img-fluid w-100 h-100 object-fit-cover"
                />
              </div>

              <div className="lh-sm">
                <div className="fw-bold text-white brand-title">
                  Goshala QR
                </div>
                <small className="brand-subtitle">ATTENDANCE SYSTEM</small>
              </div>
            </NavLink>

            <ul className="navbar-links">
              <li>
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/animals" className={navLinkClass}>
                  Animals
                </NavLink>
              </li>
              <li>
                <NavLink to="/scanner" className={navLinkClass}>
                  Scan
                </NavLink>
              </li>
              <li>
                <NavLink to="/reports" className={navLinkClass}>
                  Reports
                </NavLink>
              </li>
            </ul>

            <div className="navbar-user-area">
              {user && (
                <div className="user-pill">
                  <div className="user-avatar">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>

                  <div className="lh-sm">
                    <div className="fw-semibold text-white user-name">
                      {user.name || 'User'}
                    </div>
                    <small className="user-role">
                      {user.role || 'STAFF'}
                    </small>
                  </div>
                </div>
              )}

              <button
                onClick={logout}
                className="logout-btn"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <style>{`
        .goshala-navbar {
          z-index: 1030;
          background: linear-gradient(135deg, #111111 0%, #1b1b1b 55%, #202a22 100%);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(10px);
        }

        .navbar-inner {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 18px;
          min-height: 72px;
        }

        .brand-title {
          font-size: 1.08rem;
          letter-spacing: 0.3px;
        }

        .brand-subtitle {
          color: #57d68d;
          letter-spacing: 1.2px;
          font-size: 11px;
          font-weight: 700;
        }

        .logo-wrap {
          border: 2px solid rgba(255,255,255,0.15);
          box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        }

        .navbar-links {
          list-style: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0;
          margin: 0;
        }

        .custom-nav-link {
          color: rgba(255,255,255,0.84);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          padding: 9px 15px;
          border-radius: 12px;
          transition: all 0.25s ease;
          display: inline-flex;
          align-items: center;
          position: relative;
        }

        .custom-nav-link:hover {
          color: #fff;
          background: rgba(255,255,255,0.08);
          transform: translateY(-1px);
        }

        .custom-nav-link.active {
          color: #fff;
          background: linear-gradient(135deg, #198754 0%, #20c997 100%);
          box-shadow: 0 8px 20px rgba(25, 135, 84, 0.28);
        }

        .navbar-user-area {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .user-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 999px;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, #1faa67 0%, #157347 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(25, 135, 84, 0.28);
        }

        .user-name {
          font-size: 13px;
        }

        .user-role {
          color: rgba(255,255,255,0.72);
          font-size: 11px;
          letter-spacing: 0.5px;
        }

        .logout-btn {
          border: none;
          outline: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.25s ease;
        }

        .logout-btn:hover {
          background: #dc3545;
          border-color: #dc3545;
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(220, 53, 69, 0.25);
        }

        @media (max-width: 991.98px) {
          .navbar-inner {
            grid-template-columns: 1fr;
            gap: 14px;
            padding-top: 10px;
            padding-bottom: 10px;
          }

          .navbar-links {
            flex-wrap: wrap;
          }

          .navbar-user-area {
            justify-content: center;
          }

          .user-pill {
            width: 100%;
            justify-content: center;
          }

          .logout-btn {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}