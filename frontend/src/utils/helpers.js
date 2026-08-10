import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (date, fmt = 'MMM dd, yyyy') => {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, fmt) : '—';
};

export const formatDateTime = (date) => formatDate(date, 'MMM dd, yyyy hh:mm a');

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount == null) return '—';
  if (currency === 'INR') {
    const lpa = amount / 100000;
    return lpa >= 1 ? `₹${lpa.toFixed(1)} LPA` : `₹${amount.toLocaleString('en-IN')}`;
  }
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
};

export const formatPackage = (pkg) => {
  if (!pkg) return '—';
  const { minCtc, maxCtc } = pkg;
  if (minCtc && maxCtc) return `${formatCurrency(minCtc)} – ${formatCurrency(maxCtc)}`;
  if (minCtc) return formatCurrency(minCtc);
  if (maxCtc) return formatCurrency(maxCtc);
  return '—';
};

export const getStatusColor = (status) => {
  const map = {
    applied: 'bg-blue-100 text-blue-700',
    shortlisted: 'bg-indigo-100 text-indigo-700',
    rejected: 'bg-red-100 text-red-700',
    selected: 'bg-green-100 text-green-700',
    placed: 'bg-emerald-100 text-emerald-700',
    offer_extended: 'bg-purple-100 text-purple-700',
    interview_scheduled: 'bg-amber-100 text-amber-700',
    assessment_pending: 'bg-orange-100 text-orange-700',
    assessment_completed: 'bg-teal-100 text-teal-700',
    published: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-600',
    extended: 'bg-purple-100 text-purple-700',
    accepted: 'bg-green-100 text-green-700',
    not_placed: 'bg-gray-100 text-gray-600',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
};

export const capitalize = (s) => (s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '');

export const extractData = (res) => res.data?.data ?? res.data;

export const extractMeta = (res) => res.data?.meta;
