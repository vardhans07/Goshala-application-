import { Link, useLocation } from 'react-router-dom';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { FaSignOutAlt } from 'react-icons/fa';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Animals', href: '/animals' },
  { name: 'Scan', href: '/scanner' },
  { name: 'Reports', href: '/reports' },
];

export default function Navbar({ logout, user }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <Disclosure as="nav" className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-emerald-700 focus:outline-2 focus:outline-emerald-600">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>

          {/* Logo */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <Link to="/dashboard" className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl">
                🐄
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tighter text-gray-900">Goshala QR</h1>
                <p className="text-xs text-emerald-600 -mt-1 tracking-widest">ATTENDANCE SYSTEM</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-10 sm:flex sm:items-center sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 text-lg font-medium rounded-xl transition-all ${
                    isActive(item.href)
                      ? 'text-emerald-700 font-semibold bg-emerald-50'
                      : 'text-gray-700 hover:text-emerald-700 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - User & Logout */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {user && (
              <Menu as="div" className="relative ml-3">
                <MenuButton className="flex items-center gap-3 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-3xl transition-all focus:outline-2 focus:outline-emerald-600">
                  <div className="w-8 h-8 bg-emerald-600 rounded-2xl flex items-center justify-center font-bold text-white text-sm">
                    {user.name?.[0] || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-emerald-600 -mt-0.5">{user.role}</p>
                  </div>
                </MenuButton>

                <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-2xl bg-white py-2 shadow-xl border border-gray-100 transition focus:outline-none">
                  <MenuItem>
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      <FaSignOutAlt size={18} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-4 pt-2 pb-4 bg-white border-t">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as={Link}
              to={item.href}
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-700'
              }`}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
