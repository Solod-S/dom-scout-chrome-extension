import React from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  return (
    <div className={`ds-toast ds-toast-${type}`} role="status">
      {type === 'success' && <Check size={14} className="ds-toast-icon" />}
      {type === 'error' && <AlertCircle size={14} className="ds-toast-icon" />}
      {type === 'info' && <Info size={14} className="ds-toast-icon" />}
      <span className="ds-toast-text">{message}</span>
    </div>
  );
}
