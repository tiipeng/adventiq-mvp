import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';

const statusStyles = {
  pending: 'badge-yellow',
  confirmed: 'badge-blue',
  completed: 'badge-green',
  rejected: 'badge-red',
  cancelled: 'badge-gray',
};

function fmtDate(str) {
  if (!str) return '-';
  return new Date(str).toLocaleDateString('en-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BookingCard({ booking, onStatusChange, showActions = false, actorRole }) {
  const providerType = booking.provider_type || 'service';
  const providerIcon = providerType === 'expert' ? 'E' : providerType === 'lab' ? 'L' : 'B';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 inline-flex items-center gap-2 text-xs capitalize text-[var(--text-muted)]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[10px] font-semibold text-[var(--text-primary)]">{providerIcon}</span>
              {providerType}
            </p>
            <p className="text-[15px] font-semibold text-[var(--text-primary)]">
              {booking.provider_name || booking.business_name || `Booking #${booking.id}`}
            </p>
          </div>
          <div className="text-right">
            <span className={statusStyles[booking.status] || 'badge-gray'}>{booking.status}</span>
            <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">EUR {booking.total_price}</p>
          </div>
        </div>

        <div className="mb-3 grid gap-2 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
          <div className="inline-flex items-center gap-1">Start: {fmtDate(booking.slot_start)}</div>
          <div className="inline-flex items-center gap-1">End: {fmtDate(booking.slot_end)}</div>
        </div>

        {booking.problem_description ? (
          <p className="mb-3 text-sm text-[var(--text-secondary)]">{booking.problem_description}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {actorRole === 'business' && booking.status === 'completed' ? (
            <Link to={`/reports/${booking.id}`} className="btn-secondary text-xs">View Report</Link>
          ) : null}

          {(actorRole === 'expert' || actorRole === 'lab') && (booking.status === 'confirmed' || booking.status === 'completed') ? (
            <Link to={`/reports/${booking.id}`} className="btn-secondary text-xs">
              {booking.status === 'completed' ? 'View Report' : 'Submit Report'}
            </Link>
          ) : null}

          {showActions && onStatusChange ? (
            <>
              {booking.status === 'pending' && (actorRole === 'expert' || actorRole === 'lab') ? (
                <>
                  <button onClick={() => onStatusChange(booking.id, 'confirmed')} className="btn-primary text-xs">Confirm</button>
                  <button onClick={() => onStatusChange(booking.id, 'rejected')} className="btn-danger text-xs">Reject</button>
                </>
              ) : null}
              {booking.status === 'confirmed' && (actorRole === 'expert' || actorRole === 'lab') ? (
                <button onClick={() => onStatusChange(booking.id, 'completed')} className="btn-primary text-xs">Mark Complete</button>
              ) : null}
              {booking.status === 'pending' && actorRole === 'business' ? (
                <button onClick={() => onStatusChange(booking.id, 'cancelled')} className="btn-danger text-xs">Cancel</button>
              ) : null}
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
