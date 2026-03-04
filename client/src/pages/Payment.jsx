import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { bookingsApi } from '../utils/api';

export default function Payment() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const [card, setCard]     = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  if (!state) {
    navigate('/');
    return null;
  }

  const { provider_id, provider_type, provider_name, slot_start, slot_end, problem_description, total_price, rate } = state;

  function formatDate(str) {
    return new Date(str).toLocaleString('en-DE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function handleCardInput(e) {
    let { name, value } = e.target;
    if (name === 'number') value = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    if (name === 'expiry') value = value.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/');
    if (name === 'cvv')    value = value.replace(/\D/g, '').slice(0, 3);
    setCard(c => ({ ...c, [name]: value }));
  }

  async function handlePay(e) {
    e.preventDefault();

    if (card.number.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock: create booking as "pending" (awaits expert/lab confirmation)
      const res = await bookingsApi.create({
        provider_id,
        provider_type,
        slot_start,
        slot_end,
        problem_description,
        total_price,
      });

      const bookingId = res?.data?.id;
      if (!bookingId) throw new Error('no_backend');
      navigate(`/booking-confirmation/${bookingId}`, { replace: true });
    } catch (err) {
      if (err.message === 'no_backend') {
        setError('Demo mode: no backend available. Booking cannot be created on Netlify. This feature works when the backend is running locally.');
      } else {
        setError(err.response?.data?.error || 'Payment failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const platformFee = Math.round(total_price * 0.05 * 100) / 100;
  const grandTotal  = Math.round((total_price + platformFee) * 100) / 100;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Complete your Booking</h1>
            <p className="text-gray-500 mt-1">Review the booking details and enter payment information.</p>
          </div>

          {/* Mock payment notice */}
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">ℹ️</span>
            <p className="text-sm text-amber-700">
              <strong>Mock Payment:</strong> This is a demo payment UI. No real card will be charged. Enter any 16-digit number to proceed.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Payment form */}
            <div className="lg:col-span-3">
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-5">Payment details</h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
                )}

                <form onSubmit={handlePay} className="space-y-5">
                  <div>
                    <label className="label">Cardholder name</label>
                    <input
                      name="name"
                      type="text"
                      className="input"
                      placeholder="Anna Schmidt"
                      value={card.name}
                      onChange={handleCardInput}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Card number</label>
                    <div className="relative">
                      <input
                        name="number"
                        type="text"
                        className="input pl-12"
                        placeholder="1234 5678 9012 3456"
                        value={card.number}
                        onChange={handleCardInput}
                        required
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-1">
                        <div className="w-5 h-3 bg-red-500 rounded-sm opacity-80" />
                        <div className="w-5 h-3 bg-yellow-400 rounded-sm opacity-80 -ml-2" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Expiry date</label>
                      <input
                        name="expiry"
                        type="text"
                        className="input"
                        placeholder="MM/YY"
                        value={card.expiry}
                        onChange={handleCardInput}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">CVV</label>
                      <input
                        name="cvv"
                        type="text"
                        className="input"
                        placeholder="123"
                        value={card.cvv}
                        onChange={handleCardInput}
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1 text-gray-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-xs">Secured payment</span>
                      </div>
                    </div>

                    <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
                      {loading ? 'Processing payment…' : `Pay €${grandTotal} →`}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-2">
              <div className="card p-6 sticky top-24">
                <h2 className="font-semibold text-gray-900 mb-4">Order summary</h2>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${provider_type === 'expert' ? 'bg-primary-100' : 'bg-green-100'}`}>
                    {provider_type === 'expert' ? '👤' : '🔬'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{provider_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{provider_type} · {provider_type === 'expert' ? `€${rate}/hr` : `€${rate}/day`}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>From</span><span>{formatDate(slot_start)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>To</span><span>{formatDate(slot_end)}</span>
                  </div>
                </div>

                {problem_description && (
                  <div className="p-3 bg-gray-50 rounded-lg mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">Your problem</p>
                    <p className="text-xs text-gray-600 line-clamp-3">{problem_description}</p>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span><span>€{total_price}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Platform fee (5%)</span><span>€{platformFee}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                    <span>Total</span><span>€{grandTotal}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-4 text-center">
                  Booking is pending until the {provider_type} confirms availability.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
