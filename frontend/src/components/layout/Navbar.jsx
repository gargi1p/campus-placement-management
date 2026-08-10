import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../api/common';
import { Breadcrumbs } from './Breadcrumbs';

export const Navbar = ({ onMenuClick, role }) => {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    notificationApi.getUnreadCount().then((r) => setUnread(r.data?.data?.count || 0)).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"><Menu size={20} /></button>
          <Breadcrumbs role={role} />
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/${role}/notifications`} className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100">
            <Bell size={20} />
            {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}
          </Link>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-gray-700 md:block">{user?.name}</span>
              <ChevronDown size={16} className="hidden text-gray-400 md:block" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <div className="border-b px-4 py-2">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link to={`/${role}/settings`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowMenu(false)}>Settings</Link>
                  <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
