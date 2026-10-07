import React from 'react';
import { useTripStore } from '../store/tripStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useTripStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-slate-900 border-slate-700 text-slate-100';
        let Icon = Info;
        let iconColor = 'text-indigo-400';

        if (toast.type === 'success') {
          bg = 'bg-emerald-950/90 border-emerald-700/60 text-emerald-100';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-950/90 border-amber-700/60 text-amber-100';
          Icon = AlertCircle;
          iconColor = 'text-amber-400';
        } else if (toast.type === 'error') {
          bg = 'bg-rose-950/90 border-rose-700/60 text-rose-100';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${bg}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-xs leading-relaxed font-medium">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
