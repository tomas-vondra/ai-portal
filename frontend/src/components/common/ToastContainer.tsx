import { useToastStore } from '../../store/toastStore';
import { X, CheckCircle, XCircle, Info } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const bgColors = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  info: 'bg-blue-50 border-blue-200',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg animate-in slide-in-from-right ${bgColors[toast.type]}`}
        >
          {icons[toast.type]}
          <p className="text-sm text-surface-800 flex-1">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="text-surface-400 hover:text-surface-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
