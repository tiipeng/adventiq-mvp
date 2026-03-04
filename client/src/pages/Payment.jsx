import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function formatCard(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const payload = location.state;

  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [error, setError] = useState('');

  if (!payload) {
    navigate('/');
    return null;
  }

  const flow = payload.flow ?? 'booking';
  const provider = payload.provider ?? {};
  const total = useMemo(() => payload.totalPrice ?? payload.fee ?? 0, [payload]);

  function onInput(e) {
    const { name, value } = e.target;
    if (name === 'number') return setCard((c) => ({ ...c, number: formatCard(value) }));
    if (name === 'cvv') return setCard((c) => ({ ...c, cvv: value.replace(/\D/g, '').slice(0, 3) }));
    if (name === 'expiry') return setCard((c) => ({ ...c, expiry: value.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/') }));
    setCard((c) => ({ ...c, [name]: value }));
  }

  function payNow(e) {
    e.preventDefault();
    if (card.number.replace(/\s/g, '').length !== 16) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }

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

    const bookingId = `BK-${Date.now()}`;
    localStorage.setItem(`booking_${bookingId}`, JSON.stringify({
      id: bookingId,
      provider,
      type: payload.type,
      selectedDate: payload.selectedDate,
      selectedSlot: payload.selectedSlot,
      sessionType: payload.sessionType,
      selectedServices: payload.selectedServices,
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
          <h1 className="mb-2">Mock Payment</h1>
          <p className="text-[var(--text-muted)] mb-6">UI-only payment step for {flow === 'fast-consult' ? 'Fast Consult' : 'Booking'}.</p>

          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 card p-5">
              <h3 className="mb-4">Card Details</h3>
              {error ? <p className="text-sm text-[var(--danger)] mb-3">{error}</p> : null}
              <form className="space-y-3" onSubmit={payNow}>
                <input name="name" className="input" placeholder="Cardholder name" value={card.name} onChange={onInput} required />
                <input name="number" className="input" placeholder="1234 5678 9012 3456" value={card.number} onChange={onInput} required />
                <div className="grid grid-cols-2 gap-3">
                  <input name="expiry" className="input" placeholder="MM/YY" value={card.expiry} onChange={onInput} required />
                  <input name="cvv" className="input" placeholder="CVV" value={card.cvv} onChange={onInput} required />
                </div>
                <button className="btn-primary w-full" type="submit">Pay Now</button>
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
                <div className="flex justify-between pt-2 border-t border-[var(--border)] text-[var(--text-primary)] font-semibold"><span>Total</span><span>€{total}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
