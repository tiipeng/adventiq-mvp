import React from 'react';
import { cx } from './cx';

const toneClass = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  fast: 'btn-fast',
};

const sizeClass = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
};

export default function Button({
  as: Comp = 'button',
  tone = 'secondary',
  size = 'md',
  className,
  type,
  ...props
}) {
  return (
    <Comp
      type={Comp === 'button' ? type || 'button' : undefined}
      className={cx('btn-base', toneClass[tone] || toneClass.secondary, sizeClass[size] || sizeClass.md, className)}
      {...props}
    />
  );
}
