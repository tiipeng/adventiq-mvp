import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { bookingsApi } from '../utils/api';

function fmtDate(str) {
  if (!str) return '–';
  return new Date(str).toLocaleString('en-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const statusMeta = {
  pending:   { icon: '⏳', color: 'yellow', label: 'Pending confirmation', desc: 'Your booking request has been sent. The provider will confirm shortly.' },
  confirmed: { icon: '✅', color: 'green',  label: 'Confirmed!',           desc: 'Your booking is confirmed. Check the details below.' },
  completed: { icon: '🎯', color: 'blue',   label: 'Completed',            desc: 'This engagement has been completed. View the report below.' },
  rejected:  { icon: '❌', color: 'red',    label: 'Rejected',             desc: 'The provider was unable to accept this booking. Please try another time.' },
  cancelled: { icon: '🚫', color: 'gray',   label: 'Cancelled',            desc: 'This booking has been cancelled.' },
};

function EmailPreview({ booking }) {
  const [showPreview, setShowPreview] = useState(false);
  const ref = `BK-${booking.id?.toString().padStart(4, '0')}`;
  if (!showPreview) {
    return (
      <button onClick={() => setShowPreview(true)} className="btn-secondary text-sm w-full justify-center">
        📧 Preview Confirmation Email
      </button>
    );
  }
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-100 px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">📧 Email Preview (mock)</span>
        <button onClick={() => setShowPreview(false)} className="text-xs text-gray-500 hover:text-gray-700">Close</button>
      </div>
      <div className="p-4 bg-white text-sm space-y-2">
        <p><span className="text-gray-500">To:</span> <span className="font-medium">your@email.com</span></p>
        <p><span className="text-gray-500">Subject:</span> <span className="font-medium">Booking confirmed — {booking.provider_name || booking.provider_type}</span></p>
        <div className="border-t border-gray-100 pt-3 text-gray-700 space-y-2 text-xs">
          <p>Hi there,</p>
          <p>Your booking has been received and is awaiting confirmation from the provider.</p>
          <p><strong>Provider:</strong> {booking.provider_name || `${booking.provider_type} #${booking.provider_id}`}</p>
          <p><strong>Start:</strong> {fmtDate(booking.slot_start)}</p>
          <p><strong>End:</strong> {fmtDate(booking.slot_end)}</p>
          <p><strong>Total:</strong> €{booking.total_price}</p>
          <p><strong>Reference:</strong> {ref}</p>
          <p className="text-gray-500 mt-3">You'll be notified by email once the provider confirms. You can also track your booking in your dashboard.</p>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-2 flex justify-end">
        <button className="text-xs text-primary-600 hover:underline">Resend Email (mock)</button>
      </div>
    </div>
  );
}

export default function BookingConfirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    bookingsApi.get(id)
      .then(r => {
        const b = r?.data && typeof r.data === 'object' && !Array.isArray(r.data) ? r.data : null;
        setBooking(b);
        if (b) { setToast('Booking confirmed! Check your email.'); setTimeout(() => setToast(''), 4000); }
      })
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center text-gray-400">Loading booking…</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Booking not found.</p>
              <Link to="/dashboard/business" className="btn-primary">Back to dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const meta = statusMeta[booking.status] || statusMeta.pending;
  const colorMap = { yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800', green: 'bg-green-50 border-green-200 text-green-800', blue: 'bg-blue-50 border-blue-200 text-blue-800', red: 'bg-red-50 border-red-200 text-red-800', gray: 'bg-gray-50 border-gray-200 text-gray-700' };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-fade-in">
          <span>✅</span> {toast}
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 max-w-2xl">
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{meta.icon}</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{meta.label}</h1>
            <p className="text-gray-500">{meta.desc}</p>
          </div>

          {/* Status banner */}
          <div className={`p-4 rounded-xl border mb-6 ${colorMap[meta.color]}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">Booking #{booking.id}</span>
              <span className="capitalize font-semibold">{booking.status}</span>
            </div>
          </div>

          {/* Details */}
          <div className="card p-6 space-y-4 mb-6">
            <h2 className="font-semibold text-gray-900">Booking Details</h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Provider</p>
                <p className="font-medium text-gray-900">{booking.provider_name || `#${booking.provider_id}`}</p>
                <p className="text-gray-500 capitalize">{booking.provider_type}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Location</p>
                <p className="font-medium text-gray-900">{booking.provider_location || '–'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Start</p>
                <p className="font-medium text-gray-900">{fmtDate(booking.slot_start)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">End</p>
                <p className="font-medium text-gray-900">{fmtDate(booking.slot_end)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Total paid</p>
                <p className="font-bold text-primary-600 text-lg">€{booking.total_price}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Reference</p>
                <p className="font-mono font-medium text-gray-900">BK-{booking.id?.toString().padStart(4,'0')}</p>
              </div>
            </div>

            {booking.problem_description && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Your request</p>
                <p className="text-sm text-gray-700">{booking.problem_description}</p>
              </div>
            )}
          </div>

          {/* Email preview */}
          <div className="card p-5 mb-6">
            <EmailPreview booking={booking} />
          </div>

          {/* Report button if completed */}
          {booking.status === 'completed' && (
            <div className="card p-5 bg-green-50 border-green-200 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Report available</p>
                  <p className="text-sm text-gray-500">Your consultation report is ready to view and download.</p>
                </div>
                <Link to={`/reports/${booking.id}`} className="btn-primary text-sm">View report →</Link>
              </div>
            </div>
          )}

          {/* What's next */}
          {booking.status === 'pending' && (
            <div className="card p-5 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-primary-600 font-bold">1.</span> The {booking.provider_type} reviews your booking request</li>
                <li className="flex gap-2"><span className="text-primary-600 font-bold">2.</span> You'll be notified once they confirm or suggest an alternative</li>
                <li className="flex gap-2"><span className="text-primary-600 font-bold">3.</span> After the session, you'll receive a detailed report</li>
              </ol>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link to="/dashboard/business" className="btn-secondary flex-1 justify-center">← Back to dashboard</Link>
            <Link to="/experts" className="btn-primary flex-1 justify-center">Browse more experts</Link>
          </div>
        </main>
      </div>
    </div>
  );
}
