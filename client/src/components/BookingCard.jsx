import React from 'react';
import { Link } from 'react-router-dom';

const statusStyles = {
  pending:   'badge-yellow',
  confirmed: 'badge-blue',
  completed: 'badge-green',
  rejected:  'badge-red',
  cancelled: 'badge-gray',
};

function fmtDate(str) {
  if (!str) return '–';
  return new Date(str).toLocaleDateString('en-DE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function BookingCard({ booking, onStatusChange, showActions = false, actorRole }) {
  return (
    <div className="card p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`${booking.provider_type === 'expert' ? 'text-primary-600' : 'text-green-600'} text-sm font-medium capitalize`}>
              {booking.provider_type === 'expert' ? '👤' : '🔬'} {booking.provider_type}
            </span>
            <span className={statusStyles[booking.status] || 'badge-gray'}>{booking.status}</span>
          </div>
          <p className="font-semibold text-gray-900">
            {booking.provider_name || booking.business_name || `Booking #${booking.id}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">€{booking.total_price}</p>
          <p className="text-xs text-gray-400">#{booking.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-500">
        <div>
          <span className="font-medium text-gray-600">Start:</span> {fmtDate(booking.slot_start)}
        </div>
        <div>
          <span className="font-medium text-gray-600">End:</span> {fmtDate(booking.slot_end)}
        </div>
      </div>

      {booking.problem_description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 bg-gray-50 rounded p-2">
          {booking.problem_description}
        </p>
      )}

      <div className="flex gap-2 flex-wrap">
        {/* Business: view report if completed */}
        {actorRole === 'business' && booking.status === 'completed' && (
          <Link to={`/reports/${booking.id}`} className="btn-secondary text-xs">
            📄 View Report
          </Link>
        )}
        {/* Expert/Lab: view and submit report if confirmed */}
        {(actorRole === 'expert' || actorRole === 'lab') && (booking.status === 'confirmed' || booking.status === 'completed') && (
          <Link to={`/reports/${booking.id}`} className="btn-secondary text-xs">
            📝 {booking.status === 'completed' ? 'View Report' : 'Submit Report'}
          </Link>
        )}

        {showActions && onStatusChange && (
          <>
            {booking.status === 'pending' && (actorRole === 'expert' || actorRole === 'lab') && (
              <>
                <button onClick={() => onStatusChange(booking.id, 'confirmed')} className="btn-primary text-xs">✓ Confirm</button>
                <button onClick={() => onStatusChange(booking.id, 'rejected')}  className="btn-danger text-xs">✗ Reject</button>
              </>
            )}
            {booking.status === 'confirmed' && (actorRole === 'expert' || actorRole === 'lab') && (
              <button onClick={() => onStatusChange(booking.id, 'completed')} className="btn-primary text-xs">✓ Mark Complete</button>
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
