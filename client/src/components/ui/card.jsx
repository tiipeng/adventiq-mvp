import React from 'react';
import { cx } from './cx';

export function Card({ className, children, ...props }) {
  return (
    <div className={cx('card', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cx('p-5 pb-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cx('text-[var(--text-primary)]', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cx('p-5', className)} {...props}>
      {children}
    </div>
  );
}
