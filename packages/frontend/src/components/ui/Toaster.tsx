import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastComponent({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const backgrounds = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div
      className={clsx(
        'flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-md w-full transition-all duration-300 transform',
        backgrounds[toast.type],
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium text-gray-900">
        {toast.message}
      </p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

let toastId = 0;
const toasts: Toast[] = [];
const listeners: (() => void)[] = [];

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function showToast(
  message: string,
  type: Toast['type'] = 'info',
  duration?: number
) {
  const id = `toast-${++toastId}`;
  const toast: Toast = { id, message, type, duration };

  toasts.push(toast);
  notifyListeners();

  return () => {
    const index = toasts.findIndex(t => t.id === id);
    if (index >= 0) {
      toasts.splice(index, 1);
      notifyListeners();
    }
  };
}

export function Toaster() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const updateToasts = () => {
      setCurrentToasts([...toasts]);
    };

    listeners.push(updateToasts);
    updateToasts();

    return () => {
      const index = listeners.indexOf(updateToasts);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const removeToast = (id: string) => {
    const index = toasts.findIndex(t => t.id === id);
    if (index >= 0) {
      toasts.splice(index, 1);
      notifyListeners();
    }
  };

  if (currentToasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {currentToasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
