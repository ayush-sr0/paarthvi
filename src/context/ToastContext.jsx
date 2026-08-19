import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showSuccess = (msg) => addToast(msg, 'success');
  const showError = (msg) => addToast(msg, 'error');
  const showInfo = (msg) => addToast(msg, 'info');

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, addToast, removeToast }}>
      {children}
      {/* Toast Render Portal Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl border text-xs font-body transition-all duration-300 animate-in slide-in-from-bottom-2 ${
              toast.type === 'success' ? 'bg-surface border-gold-leaf text-primary' :
              toast.type === 'error' ? 'bg-surface border-error text-error' :
              'bg-surface border-primary text-primary'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <CheckCircle size={16} className="text-gold-leaf shrink-0" />}
              {toast.type === 'error' && <AlertCircle size={16} className="text-error shrink-0" />}
              {toast.type === 'info' && <Info size={16} className="text-primary shrink-0" />}
              <span className="font-semibold">{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="p-1 hover:bg-outline/10 rounded-full shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
