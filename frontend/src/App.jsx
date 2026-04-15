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
  const showNav = !token && publicPaths.includes(pathname);
  if (!showNav) return null;

  return (
    <nav className="navbar navbar-dark bg-success shadow-sm sticky-top">
      <div className="container d-flex justify-content-center">
        <div className="d-flex align-items-center gap-5">
          <Link className="nav-link text-white fw-bold" to="/about">About</Link>
          <Link className="nav-link text-white fw-bold" to="/contact">Contact Us</Link>
          {!token && (
            <>
              <Link className="btn btn-light btn-sm mx-2 px-3" to="/login">Login</Link>
              <Link className="btn btn-outline-light btn-sm mx-2 px-3" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Polished & Smaller Floating Home Button for Mobile
function FloatingHomeButton() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  const showButton = !['/dashboard', '/animals', '/scanner', '/reports'].includes(location.pathname);

  if (!showButton) return null;

  // Hide when scrolling down, show when near top
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else if (currentScrollY < 40) {
        setIsVisible(true);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <Link
      to="/"
      title="Go to Home"
      aria-label="Go to home page"
      style={{
        position: 'fixed',
        top: '110px',
        right: '16px',
        zIndex: 99999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        textDecoration: 'none',
        backgroundImage: 'linear-gradient(135deg, #ff7a18 0%, #ffb347 100%)',
        color: '#1f1f1f',
        fontWeight: 700,
        fontSize: '13px',           // Smaller text on mobile
        borderRadius: '999px',
        padding: '8px 16px',        // Smaller padding
        boxShadow: '0 8px 20px rgba(255, 122, 24, 0.35)',
        border: '1px solid rgba(255,255,255,0.5)',
        minWidth: '98px',           // More compact width
        transition: 'all 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(255, 122, 24, 0.45)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 122, 24, 0.35)';
      }}
    >
      <FaHome size={15} /> Home
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
    ['/login', '/register', '/forgot-password', '/about', '/contact'].includes(location.pathname);

  return (
    <>
      <AppLayout token={token} user={user} logout={logout} onLogin={onLogin} />
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
      <AppContent token={token} user={user} logout={logout} onLogin={onLogin} />
    </Router>
  );
}