import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Animals from './pages/Animals.jsx';
import Scanner from './pages/Scanner.jsx';
import Reports from './pages/Reports.jsx';
import Navbar from './components/Navbar.jsx';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) setToken(savedToken);
  }, []);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      {token && <Navbar logout={logout} />}
      
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route 
            path="/" 
            element={token ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/dashboard" 
            element={token ? <Dashboard /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/animals" 
            element={token ? <Animals /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/scanner" 
            element={token ? <Scanner /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/reports" 
            element={token ? <Reports /> : <Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;