// ── Badge ─────────────────────────────────────────────
const STATUS_CLASS = {
  Active:       'badge-green',
  Done:         'badge-green',
  Upcoming:     'badge-blue',
  Scheduled:    'badge-blue',
  Sent:         'badge-blue',
  Completed:    'badge-green',
  'In progress':'badge-amber',
  'Follow-up':  'badge-amber',
  Overdue:      'badge-red',
  'No-show':    'badge-red',
  Cancelled:    'badge-gray',
  Inactive:     'badge-gray',
};

export function Badge({ value }) {
  const cls = STATUS_CLASS[value] ?? 'badge-gray';
  return <span className={cls}>{value}</span>;
}

// ── Spinner ───────────────────────────────────────────
export function Spinner({ className = 'h-8 w-8' }) {
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-brand-500 ${className}`} />
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner />
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${width} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// ── ConfirmDialog ─────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-2">
        <button onClick={onClose}   className="btn-secondary">Cancel</button>
        <button onClick={onConfirm} className="btn-danger" disabled={loading}>
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}

// ── EmptyState ────────────────────────────────────────
export function EmptyState({ message = 'No records found.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <span className="text-gray-400 text-xl">&#9711;</span>
      </div>
      <p className="text-sm text-gray-500 mb-4">{message}</p>
      {action}
    </div>
  );
}

// ── FormField ─────────────────────────────────────────
export function FormField({ label, error, children }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Alert ─────────────────────────────────────────────
export function Alert({ type = 'error', message }) {
  if (!message) return null;
  const styles = {
    error:   'bg-red-50 text-red-700 border border-red-200',
    success: 'bg-green-50 text-green-700 border border-green-200',
    info:    'bg-blue-50 text-blue-700 border border-blue-200',
  };
  return (
    <div className={`rounded-lg px-4 py-3 text-sm ${styles[type]}`}>{message}</div>
  );
}
