import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export function Modal({ open, onClose, title, children, width = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-2xl ${width} w-full mx-4 max-h-[85vh] flex flex-col animate-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
          <Button variant="icon" size="icon-sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
