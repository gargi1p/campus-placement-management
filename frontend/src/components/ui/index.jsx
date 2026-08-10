import clsx from 'clsx';

export const Button = ({ children, variant = 'primary', size = 'md', loading, disabled, className, ...props }) => {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-600 hover:bg-gray-100',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button
      className={clsx('inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
};

export const Input = ({ label, error, className, ...props }) => (
  <div className={className}>
    {label && <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}
    <input className={clsx('w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20', error ? 'border-red-400' : 'border-gray-300')} {...props} />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export const Textarea = ({ label, error, className, ...props }) => (
  <div className={className}>
    {label && <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}
    <textarea className={clsx('w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20', error ? 'border-red-400' : 'border-gray-300')} rows={4} {...props} />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export const Select = ({ label, error, options = [], className, ...props }) => (
  <div className={className}>
    {label && <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}
    <select className={clsx('w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20', error ? 'border-red-400' : 'border-gray-300')} {...props}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export const Badge = ({ children, className }) => (
  <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', className)}>{children}</span>
);

export const Card = ({ title, subtitle, action, children, className }) => (
  <div className={clsx('rounded-xl border border-gray-200 bg-white shadow-sm', className)}>
    {(title || action) && (
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

export const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => {
  const colors = { primary: 'bg-primary-50 text-primary-600', green: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', red: 'bg-red-50 text-red-600', purple: 'bg-purple-50 text-purple-600' };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value ?? '—'}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
        </div>
        {Icon && <div className={clsx('rounded-lg p-3', colors[color])}><Icon size={20} /></div>}
      </div>
    </div>
  );
};
