import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { getNavForRole } from '../../config/navigation';

export const Breadcrumbs = ({ role }) => {
  const location = useLocation();
  const nav = getNavForRole(role);
  const segments = location.pathname.split('/').filter(Boolean);

  const crumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const navItem = nav.find((n) => n.path === path);
    return { label: navItem?.label || seg.charAt(0).toUpperCase() + seg.slice(1), path };
  });

  return (
    <nav className="hidden items-center gap-1 text-sm md:flex">
      <Link to={`/${role}`} className="text-gray-400 hover:text-gray-600"><Home size={16} /></Link>
      {crumbs.slice(1).map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1">
          <ChevronRight size={14} className="text-gray-300" />
          {i === crumbs.length - 2 ? (
            <span className="font-medium text-gray-900">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="text-gray-500 hover:text-gray-700">{crumb.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
};
