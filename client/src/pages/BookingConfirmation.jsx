import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BookingFlowSteps from '../components/BookingFlowSteps';

export default function BookingConfirmation() {
  const { id } = useParams();
  const booking = JSON.parse(localStorage.getItem(`booking_${id}`) ?? 'null');

  if (!booking) {
    return (
      <div className="flex min-h-screen bg-[var(--bg-base)]">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Navbar />
          <div className="container-app py-10">Booking not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar />
        <div className="container-app py-8 max-w-3xl">
          <BookingFlowSteps current={3} />
          <h1 className="mb-2">Booking Confirmed</h1>
          <p className="text-[var(--text-muted)] mb-6">Reference: <strong>{booking.id}</strong></p>

          <div className="card p-5 mb-4 bg-[var(--accent-light)] border-[var(--accent)]">
            <p className="text-[var(--accent)] font-semibold mb-1">Payment successful</p>
            <p className="text-sm text-[var(--text-secondary)]">Your request has been submitted and is visible in your dashboard bookings.</p>
          </div>

          <div className="card p-5 mb-4">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-[var(--text-muted)]">Expert/Lab</span><p className="text-[var(--text-primary)] font-medium">{booking.provider?.name}</p></div>
              <div><span className="text-[var(--text-muted)]">Date</span><p className="text-[var(--text-primary)] font-medium">{booking.selectedDate}</p></div>
              <div><span className="text-[var(--text-muted)]">Time</span><p className="text-[var(--text-primary)] font-medium">{booking.selectedSlot}</p></div>
              <div><span className="text-[var(--text-muted)]">Total</span><p className="text-[var(--accent)] font-semibold">€{booking.total}</p></div>
            </div>
          </div>

          <div className="card p-5 mb-4">
            <p className="text-sm text-[var(--text-primary)] font-medium mb-2">Email Preview</p>
            <p className="text-sm">Subject: Your AdventIQ booking is confirmed</p>
            <p className="text-sm text-[var(--text-muted)]">Hi, your booking with {booking.provider?.name} on {booking.selectedDate} at {booking.selectedSlot} is confirmed. Reference {booking.id}.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-2">
            <Link to="/booking" className="btn-secondary justify-center">New Booking</Link>
            <Link to="/reports" className="btn-secondary justify-center">View Reports</Link>
            <Link to="/dashboard/business" className="btn-primary justify-center">Go to Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
