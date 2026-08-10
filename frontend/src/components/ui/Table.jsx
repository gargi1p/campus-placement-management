import clsx from 'clsx';
import { Search } from 'lucide-react';

export const SearchBar = ({ value, onChange, placeholder = 'Search...', className }) => (
  <div className={clsx('relative', className)}>
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
    />
  </div>
);

export const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
      <p className="text-sm text-gray-500">
        Page {meta.page} of {meta.totalPages} ({meta.total} total)
      </p>
      <div className="flex gap-2">
        <button disabled={!meta.hasPrevPage} onClick={() => onPageChange(meta.page - 1)} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50">Previous</button>
        <button disabled={!meta.hasNextPage} onClick={() => onPageChange(meta.page + 1)} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
      </div>
    </div>
  );
};

export const Tabs = ({ tabs, active, onChange }) => (
  <div className="border-b border-gray-200">
    <nav className="-mb-px flex gap-6 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx('whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors', active === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700')}
        >
          {tab.label}
          {tab.count != null && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{tab.count}</span>}
        </button>
      ))}
    </nav>
  </div>
);

export const DataTable = ({ columns, data = [], onRowClick, emptyMessage }) => {
  if (!data.length) return <p className="py-8 text-center text-sm text-gray-500">{emptyMessage || 'No records found'}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium text-gray-600">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row._id || i} onClick={() => onRowClick?.(row)} className={clsx('border-b border-gray-50 transition-colors', onRowClick && 'cursor-pointer hover:bg-gray-50')}>
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-gray-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
