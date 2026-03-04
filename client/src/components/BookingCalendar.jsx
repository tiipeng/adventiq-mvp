import React, { useMemo, useState } from 'react';

const SLOT_OPTIONS = ['09:00', '10:30', '13:00', '14:30', '16:00'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function toKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function BookingCalendar({ availableDates = [], selectedDate, selectedSlot, onDateSelect, onSlotSelect }) {
  const [monthDate, setMonthDate] = useState(new Date());
  const now = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const first = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <button className="btn-ghost px-2" onClick={() => setMonthDate(new Date(y, m - 1, 1))}>‹</button>
        <p className="font-medium text-[var(--text-primary)]">
          {monthDate.toLocaleString('default', { month: 'long' })} {y}
        </p>
        <button className="btn-ghost px-2" onClick={() => setMonthDate(new Date(y, m + 1, 1))}>›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs text-[var(--text-muted)] mb-1">
        {DAY_NAMES.map((d) => <div key={d} className="text-center py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: first }).map((_, idx) => <div key={`e-${idx}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const date = new Date(y, m, day);
          const key = toKey(date);
          const isPast = date < now;
          const isAvailable = availableSet.size === 0 ? !isPast : availableSet.has(key);
          const isSelected = selectedDate === key;

          return (
            <button
              key={key}
              type="button"
              disabled={isPast || !isAvailable}
              onClick={() => onDateSelect(key)}
              className={`h-9 rounded-[10px] text-sm ${
                isSelected
                  ? 'bg-[var(--accent)] text-white'
                  : isAvailable
                    ? 'bg-[var(--accent-light)] text-[var(--accent)]'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4">
          <p className="text-sm text-[var(--text-primary)] font-medium mb-2">Available slots</p>
          <div className="flex flex-wrap gap-2">
            {SLOT_OPTIONS.map((slot) => (
              <button
                key={slot}
                onClick={() => onSlotSelect(slot)}
                type="button"
                className={`px-3 h-9 rounded-[10px] text-sm border ${selectedSlot === slot ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-white border-[var(--border)] text-[var(--text-secondary)]'}`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
