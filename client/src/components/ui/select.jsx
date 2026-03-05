import React from 'react';
import { cx } from './cx';

export default function Select({ className, children, ...props }) {
  return (
    <select className={cx('input', className)} {...props}>
      {children}
    </select>
  );
}
