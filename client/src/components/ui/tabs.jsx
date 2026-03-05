import React from 'react';
import { cx } from './cx';

export function Tabs({ className, children, ...props }) {
  return (
    <div className={cx('tabs-underline', className)} {...props}>
      {children}
    </div>
  );
}

export function Tab({ active, className, children, ...props }) {
  return (
    <button className={cx('tab-item', active && 'active', className)} {...props}>
      {children}
    </button>
  );
}
