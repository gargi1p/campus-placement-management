import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { GraduationCap, X } from 'lucide-react';
import { getNavForRole } from '../../config/navigation';

export const Sidebar = ({ role, open, onClose }) => {
  const location = useLocation();
  const nav = getNavForRole(role);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-6">
          <Link to={`/${role}`} className="flex items-center gap-2">
            <div className="rounded-lg bg-primary-600 p-1.5"><GraduationCap className="h-5 w-5 text-white" /></div>
            <span className="font-bold text-gray-900">PlaceHub</span>
          </Link>
          <button onClick={onClose} className="rounded-lg p-1 lg:hidden"><X size={20} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {nav.map((item) => {
              const active = location.pathname === item.path || (item.path !== `/${role}` && location.pathname.startsWith(item.path));
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={clsx('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-gray-100 p-4">
          <p className="text-xs text-gray-400 capitalize">{role} Portal</p>
        </div>
      </aside>
    </>
  );
};
