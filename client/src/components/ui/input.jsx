import React from 'react';
import { cx } from './cx';

export function Input({ className, ...props }) {
  return <input className={cx('input', className)} {...props} />;
}

export function Textarea({ className, ...props }) {
  return <textarea className={cx('input', className)} {...props} />;
}

export function FieldLabel({ className, ...props }) {
  return <label className={cx('label', className)} {...props} />;
}
