import React from 'react';
import { cx } from './cx';

const toneClass = {
  blue: 'badge-blue',
  green: 'badge-green',
  yellow: 'badge-yellow',
  red: 'badge-red',
  gray: 'badge-gray',
};

export default function Badge({ tone = 'gray', className, children, ...props }) {
  return (
    <span className={cx('badge', toneClass[tone] || toneClass.gray, className)} {...props}>
      {children}
    </span>
  );
}
