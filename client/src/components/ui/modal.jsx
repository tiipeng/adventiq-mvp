import React from 'react';
import { cx } from './cx';

export function Modal({ open, onClose, children, className }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={cx('modal-card w-full max-w-xl', className)} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ className, children }) {
  return <div className={cx('border-b border-[var(--border)] px-4 py-3', className)}>{children}</div>;
}

export function ModalBody({ className, children }) {
  return <div className={cx('px-4 py-4', className)}>{children}</div>;
}

export function ModalFooter({ className, children }) {
  return <div className={cx('border-t border-[var(--border)] px-4 py-3', className)}>{children}</div>;
}
