import { Link } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';   // ← Fixed icon name

export default function Navbar({ logout }) {
  return (
    <nav className="bg-green-700 text-white px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3 text-2xl font-bold">
          🐄 Goshala QR System
        </div>
        <div className="flex gap-8 text-lg">
          <Link to="/dashboard" className="hover:text-green-200 transition">Dashboard</Link>
          <Link to="/animals" className="hover:text-green-200 transition">Animals</Link>
          <Link to="/scanner" className="hover:text-green-200 transition">Scan QR</Link>
          <Link to="/reports" className="hover:text-green-200 transition">Reports</Link>
          
          <button 
            onClick={logout}
            className="flex items-center gap-2 hover:text-red-300 transition font-medium"
          >
            <FaSignOutAlt size={20} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}