import { Link, useLocation } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

export default function Navbar({ logout, user }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center text-4xl">
            🐄
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter text-gray-900">Goshala QR</h1>
            <p className="text-xs text-emerald-600 -mt-1 tracking-widest">ATTENDANCE SYSTEM</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-10 text-lg font-medium">
          <Link 
            to="/dashboard" 
            className={`transition-colors ${isActive('/dashboard') ? 'text-emerald-700 font-semibold' : 'text-gray-700 hover:text-emerald-700'}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/animals" 
            className={`transition-colors ${isActive('/animals') ? 'text-emerald-700 font-semibold' : 'text-gray-700 hover:text-emerald-700'}`}
          >
            Animals
          </Link>
          <Link 
            to="/scanner" 
            className={`transition-colors ${isActive('/scanner') ? 'text-emerald-700 font-semibold' : 'text-gray-700 hover:text-emerald-700'}`}
          >
            Scan
          </Link>
          <Link 
            to="/reports" 
            className={`transition-colors ${isActive('/reports') ? 'text-emerald-700 font-semibold' : 'text-gray-700 hover:text-emerald-700'}`}
          >
            Reports
          </Link>
        </div>

        {/* User & Logout */}
        <div className="flex items-center gap-6">
          {user && (
            <div className="flex items-center gap-3 bg-emerald-50 px-5 py-2 rounded-3xl">
              <div className="w-8 h-8 bg-emerald-600 rounded-2xl flex items-center justify-center font-bold text-white text-sm">
                {user.name?.[0] || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-emerald-600 -mt-0.5">{user.role}</p>
              </div>
            </div>
          )}
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-6 py-3 rounded-3xl text-red-600 hover:bg-red-50 transition-all"
          >
            <FaSignOutAlt size={18} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}