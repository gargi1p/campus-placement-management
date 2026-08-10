import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from './index';

export const EmptyState = ({ title = 'No data found', description, action, onAction, actionLabel = 'Refresh' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 rounded-full bg-gray-100 p-4"><Inbox className="h-8 w-8 text-gray-400" /></div>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {description && <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>}
    {(action || onAction) && <Button variant="secondary" className="mt-4" onClick={onAction}>{action || actionLabel}</Button>}
  </div>
);

export const ErrorState = ({ message = 'Something went wrong', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 rounded-full bg-red-50 p-4"><AlertCircle className="h-8 w-8 text-red-500" /></div>
    <h3 className="text-lg font-semibold text-gray-900">Error</h3>
    <p className="mt-2 max-w-sm text-sm text-gray-500">{message}</p>
    {onRetry && <Button variant="secondary" className="mt-4" onClick={onRetry}><RefreshCw size={16} /> Retry</Button>}
  </div>
);
