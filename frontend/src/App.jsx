import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RegisterAnimal from './pages/RegisterAnimal';
import Scan from './pages/Scan';
import Reports from './pages/Reports';
import Finance from './pages/Finance';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/register-animal" element={<RegisterAnimal />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/finance" element={<Finance />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;
