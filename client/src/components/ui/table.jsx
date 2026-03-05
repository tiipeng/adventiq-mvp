import React from 'react';
import { cx } from './cx';

export function Table({ className, children, ...props }) {
  return (
    <div className={cx('card overflow-hidden', className)}>
      <table className="w-full text-sm" {...props}>
        {children}
      </table>
    </div>
  );
}

export function Thead({ children }) {
  return <thead className="bg-[var(--bg-subtle)] text-[var(--text-muted)] uppercase text-xs">{children}</thead>;
}

export function Tr({ className, children }) {
  return <tr className={cx('border-b border-[var(--border)] last:border-none', className)}>{children}</tr>;
}

export function Th({ className, children }) {
  return <th className={cx('px-4 py-3 text-left font-semibold', className)}>{children}</th>;
}

export function Td({ className, children }) {
  return <td className={cx('px-4 py-3 text-[var(--text-secondary)]', className)}>{children}</td>;
}
