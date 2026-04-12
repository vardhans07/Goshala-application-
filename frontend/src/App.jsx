import { FaHome } from 'react-icons/fa';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  Link,
} from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import Dashboard from './pages/Dashboard';
import Animals from './pages/Animals';
import Scanner from './pages/Scanner';
import Reports from './pages/Reports';

function ProtectedRoute({ token }) {
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute({ token, children }) {
  return token ? <Navigate to="/dashboard" replace /> : children;
}

function PublicNavbar({ token }) {
  const publicPaths = ['/', '/about', '/contact'];
  const { pathname } = useLocation();

  // Show navbar only if:
  // - not logged in, or
  // - on public routes and not logged in
  // => When logged in, never show About / Contact in navbar
  const showNav = !token && publicPaths.includes(pathname);

  if (!showNav) return null;

  return (
    <nav className="navbar navbar-dark bg-success shadow-sm sticky-top">
      <div className="container d-flex justify-content-center">
        <div className="d-flex align-items-center gap-5">
          <Link className="nav-link text-white fw-bold" to="/about">
            About
          </Link>

          <Link className="nav-link text-white fw-bold" to="/contact">
            Contact Us
          </Link>

          {!token && (
            <>
              <Link className="btn btn-light btn-sm mx-2 px-3" to="/login">
                Login
              </Link>
              <Link className="btn btn-outline-light btn-sm mx-2 px-3" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function FloatingHomeButton() {
  const isMobile = window.innerWidth <= 768;

  const buttonStyle = {
    position: 'fixed',
    // Push it down a bit
    top: isMobile ? '80px' : '100px',  // was ~14px / 18px; now 80/100px
    right: isMobile ? '12px' : '20px',
    zIndex: 99999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textDecoration: 'none',
    backgroundImage: 'linear-gradient(135deg, #ff7a18 0%, #ffb347 100%)',
    color: '#1f1f1f',
    fontWeight: 700,
    fontSize: isMobile ? '13px' : '14px',
    borderRadius: '999px',
    padding: isMobile ? '9px 13px' : '11px 17px',
    boxShadow: '0 10px 24px rgba(255, 122, 24, 0.28)',
    border: '1px solid rgba(255,255,255,0.45)',
    transition: 'all 0.25s ease',
  };

  return (
    <Link
      to="/"
      title="Go to Home"
      aria-label="Go to home page"
      style={buttonStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 14px 28px rgba(255, 122, 24, 0.36)';
        e.currentTarget.style.backgroundImage =
          'linear-gradient(135deg, #ff8c32 0%, #ffd27a 100%)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 10px 24px rgba(255, 122, 24, 0.28)';
        e.currentTarget.style.backgroundImage =
          'linear-gradient(135deg, #ff7a18 0%, #ffb347 100%)';
      }}
    >
      <FaHome size={14} />
      Home
    </Link>
  );
}

function AppLayout({ token, user, logout, onLogin }) {
  const location = useLocation();

  const protectedPaths = ['/dashboard', '/animals', '/scanner', '/reports'];
  const showProtectedNavbar = token && protectedPaths.includes(location.pathname);

  return (
    <div className="min-vh-100 bg-light text-dark">
      <PublicNavbar token={token} />
      {showProtectedNavbar && <Navbar logout={logout} user={user} />}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route
            path="/login"
            element={
              <PublicRoute token={token}>
                <Login onLogin={onLogin} />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute token={token}>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PublicRoute token={token}>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          <Route element={<ProtectedRoute token={token} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/animals" element={<Animals user={user} />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AppContent({ token, user, logout, onLogin }) {
  const location = useLocation();

 const showFloatingHomeButton =
  !token &&
  ([
    '/login',
    '/register',
    '/forgot-password',
    '/about',
    '/contact',
  ].includes(location.pathname));

  return (
    <>
      <AppLayout
        token={token}
        user={user}
        logout={logout}
        onLogin={onLogin}
      />
      {showFloatingHomeButton && <FloatingHomeButton />}
    </>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const syncAuth = () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      setToken(savedToken);
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  const onLogin = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <Router>
      <AppContent
        token={token}
        user={user}
        logout={logout}
        onLogin={onLogin}
      />
    </Router>
  );
}