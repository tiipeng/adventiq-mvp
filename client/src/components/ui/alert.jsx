import React from 'react';
import { cx } from './cx';

const toneMap = {
  info: 'bg-[#eef4ff] border-[#ceddff] text-[#27437f]',
  success: 'bg-[#ebfcf5] border-[#b8f0db] text-[#0f7a5d]',
  warning: 'bg-[#fff7e8] border-[#ffd699] text-[#8a5300]',
  danger: 'bg-[#ffedf0] border-[#ffc8cf] text-[#8f1c2a]',
};

export default function Alert({ tone = 'info', className, children, ...props }) {
  return (
    <div className={cx('rounded-[12px] border px-3 py-2 text-sm', toneMap[tone] || toneMap.info, className)} {...props}>
      {children}
    </div>
  );
}
