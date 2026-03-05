import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { bookingsApi } from '../utils/api';
import BookingFlowSteps from '../components/BookingFlowSteps';

function formatCard(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function parseSlotStart(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const iso = `${dateStr}T${timeStr}:00`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addHours(date, hours) {
  const next = new Date(date);
  next.setHours(next.getHours() + hours);
  return next;
}

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const payload = location.state;

  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!payload) {
    navigate('/');
    return null;
  }

  const flow = payload.flow ?? 'booking';
  const provider = payload.provider ?? {};
  const total = useMemo(() => payload.totalPrice ?? payload.fee ?? 0, [payload]);

  function onInput(e) {
    const { name, value } = e.target;
    if (error) setError('');
    if (name === 'number') return setCard((c) => ({ ...c, number: formatCard(value) }));
    if (name === 'cvv') return setCard((c) => ({ ...c, cvv: value.replace(/\D/g, '').slice(0, 3) }));
    if (name === 'expiry') return setCard((c) => ({ ...c, expiry: value.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/') }));
    setCard((c) => ({ ...c, [name]: value }));
  }

  async function payNow(e) {
    e.preventDefault();
    if (processing) return;
    if (card.number.replace(/\s/g, '').length !== 16) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }
    if (card.name.trim().length < 2) {
      setError('Please enter the cardholder name.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
      setError('Please enter expiry as MM/YY.');
      return;
    }
    if (!/^\d{3}$/.test(card.cvv)) {
      setError('Please enter a valid 3-digit CVV.');
      return;
    }

    setProcessing(true);

    if (flow === 'fast-consult') {
      const consultId = `C${Date.now()}`;
      localStorage.setItem(`consult_${consultId}`, JSON.stringify({
        id: consultId,
        expert: provider,
        question: payload.question,
        urgency: payload.urgency,
        format: payload.format,
        fee: total,
        createdAt: new Date().toISOString(),
      }));
      navigate(`/consult/${consultId}`);
      return;
    }

    const slotStart = parseSlotStart(payload.selectedDate, payload.selectedSlot);
    const durationHours = payload.type === 'expert'
      ? Number(payload.sessionType?.durationHours || 1)
      : Number(payload.labDuration === 'half' ? 4 : payload.labDuration === 'multi' ? 24 : 8);
    const slotEnd = slotStart ? addHours(slotStart, durationHours) : null;

    let bookingId = `BK-${Date.now()}`;
    try {
      if (provider?.id && slotStart && slotEnd && payload.type) {
        const response = await bookingsApi.create({
          provider_id: provider.id,
          provider_type: payload.type,
          slot_start: slotStart.toISOString(),
          slot_end: slotEnd.toISOString(),
          problem_description: payload.problem || payload.labRequest || 'Consultation booking',
          total_price: total,
        });
        if (response?.data?.id != null) bookingId = String(response.data.id);
      }
    } catch {
      // Keep local confirmation flow if API is unavailable.
    }

    localStorage.setItem(`booking_${bookingId}`, JSON.stringify({
      id: bookingId,
      provider,
      type: payload.type,
      selectedDate: payload.selectedDate,
      selectedSlot: payload.selectedSlot,
      sessionType: payload.sessionType,
      selectedServices: payload.selectedServices,
      labRequest: payload.labRequest,
      labDuration: payload.labDuration,
      problem: payload.problem,
      total,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    }));
    navigate(`/booking-confirmation/${bookingId}`);
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar />
        <div className="container-app py-8">
          {flow === 'booking' ? <BookingFlowSteps current={2} /> : null}
          <h1 className="mb-2">Mock Payment</h1>
          <p className="text-[var(--text-muted)] mb-6">UI-only payment step for {flow === 'fast-consult' ? 'Fast Consult' : 'Booking'}.</p>

          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3>Card Details</h3>
                {flow === 'booking' ? <Link to={`/book/${payload.type}/${provider.id}`} className="btn-secondary text-xs">Back to details</Link> : null}
              </div>
              {error ? <p className="text-sm text-[var(--danger)] mb-3">{error}</p> : null}
              <form className="space-y-3" onSubmit={payNow}>
                <input name="name" className="input" placeholder="Cardholder name" value={card.name} onChange={onInput} required />
                <input name="number" className="input" placeholder="1234 5678 9012 3456" value={card.number} onChange={onInput} required />
                <div className="grid grid-cols-2 gap-3">
                  <input name="expiry" className="input" placeholder="MM/YY" value={card.expiry} onChange={onInput} required />
                  <input name="cvv" className="input" placeholder="CVV" value={card.cvv} onChange={onInput} required />
                </div>
                <button className="btn-primary w-full" type="submit" disabled={processing}>
                  {processing ? 'Processing payment...' : 'Pay Now'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 card p-5">
              <h3 className="mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Provider</span><span className="text-[var(--text-primary)]">{provider.name || '-'}</span></div>
                {payload.selectedDate ? <div className="flex justify-between"><span>Date</span><span>{payload.selectedDate}</span></div> : null}
                {payload.selectedSlot ? <div className="flex justify-between"><span>Time</span><span>{payload.selectedSlot}</span></div> : null}
                {payload.urgency ? <div className="flex justify-between"><span>Urgency</span><span>{payload.urgency}</span></div> : null}
                {payload.format ? <div className="flex justify-between"><span>Format</span><span>{payload.format}</span></div> : null}
                {payload.labRequest ? <div><span className="text-[var(--text-muted)]">Lab notes</span><p>{payload.labRequest}</p></div> : null}
                <div className="flex justify-between pt-2 border-t border-[var(--border)] text-[var(--text-primary)] font-semibold"><span>Total</span><span>€{total}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
