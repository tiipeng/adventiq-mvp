import React from 'react';
import { Link } from 'react-router-dom';

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
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm text-[var(--text-muted)] capitalize mb-1">{booking.provider_type}</p>
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">
            {booking.provider_name || booking.business_name || `Booking #${booking.id}`}
          </p>
        </div>
        <div className="text-right">
          <span className={statusStyles[booking.status] || 'badge-gray'}>{booking.status}</span>
          <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">€{booking.total_price}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2 mb-3 text-sm text-[var(--text-secondary)]">
        <div>Start: {fmtDate(booking.slot_start)}</div>
        <div>End: {fmtDate(booking.slot_end)}</div>
      </div>

      {booking.problem_description && (
        <p className="text-sm text-[var(--text-secondary)] mb-3">{booking.problem_description}</p>
      )}

      <div className="flex gap-2 flex-wrap">
        {actorRole === 'business' && booking.status === 'completed' && (
          <Link to={`/reports/${booking.id}`} className="btn-secondary text-xs">View Report</Link>
        )}

        {(actorRole === 'expert' || actorRole === 'lab') && (booking.status === 'confirmed' || booking.status === 'completed') && (
          <Link to={`/reports/${booking.id}`} className="btn-secondary text-xs">
            {booking.status === 'completed' ? 'View Report' : 'Submit Report'}
          </Link>
        )}

        {showActions && onStatusChange && (
          <>
            {booking.status === 'pending' && (actorRole === 'expert' || actorRole === 'lab') && (
              <>
                <button onClick={() => onStatusChange(booking.id, 'confirmed')} className="btn-primary text-xs">Confirm</button>
                <button onClick={() => onStatusChange(booking.id, 'rejected')} className="btn-danger text-xs">Reject</button>
              </>
            )}
            {booking.status === 'confirmed' && (actorRole === 'expert' || actorRole === 'lab') && (
              <button onClick={() => onStatusChange(booking.id, 'completed')} className="btn-primary text-xs">Mark Complete</button>
            )}
            {booking.status === 'pending' && actorRole === 'business' && (
              <button onClick={() => onStatusChange(booking.id, 'cancelled')} className="btn-danger text-xs">Cancel</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
