import { X } from 'lucide-react';
import { Button } from './index';

export const Modal = ({ open, onClose, title, children, footer, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} rounded-xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Confirm', message, loading, confirmLabel = 'Confirm', variant = 'danger' }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm" footer={
    <>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant={variant === 'primary' ? 'primary' : variant} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
    </>
  }>
    <p className="text-sm text-gray-600">{message}</p>
  </Modal>
);
