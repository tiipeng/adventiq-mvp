import React from 'react';

const STEPS = ['Details', 'Payment', 'Confirmed'];

export default function BookingFlowSteps({ current = 1 }) {
  return (
    <div className="card p-4 mb-6">
      <div className="flex items-center gap-2">
        {STEPS.map((label, index) => {
          const step = index + 1;
          const completed = step < current;
          const active = step === current;
          return (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-7 h-7 rounded-full text-xs font-semibold inline-flex items-center justify-center ${completed ? 'bg-[var(--success)] text-white' : active ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'}`}
                >
                  {completed ? '✓' : step}
                </span>
                <span className={`text-sm ${active ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-muted)]'}`}>{label}</span>
              </div>
              {step < STEPS.length ? (
                <div className={`flex-1 h-[2px] rounded ${completed ? 'bg-[var(--success)]' : 'bg-[var(--border)]'}`} />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
