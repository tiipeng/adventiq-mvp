import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BookingCalendar from '../components/BookingCalendar';
import { expertsApi, labsApi } from '../utils/api';
import { MOCK_EXPERTS, MOCK_LABS } from '../utils/mockData';

const SESSION_TYPES = [
  { id: 'fast', label: 'Fast Consultation (60min)', durationHours: 1, multiplier: 1 },
  { id: 'deep', label: 'Deep Dive (3h)', durationHours: 3, multiplier: 3 },
  { id: 'async', label: 'Async Q&A', durationHours: 0, multiplier: 0.7 },
];

const LAB_DURATIONS = [
  { id: 'half', label: 'Half Day', factor: 0.5 },
  { id: 'full', label: 'Full Day', factor: 1 },
  { id: 'multi', label: 'Multi Day', factor: 2.5 },
];

function titleCase(v) {
  return v.charAt(0).toUpperCase() + v.slice(1);
}

export default function BookingFlowPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();

  const isExpert = type === 'expert';
  const [provider, setProvider] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(true);

  const [problem, setProblem] = useState('');
  const [sessionType, setSessionType] = useState(SESSION_TYPES[0].id);

  const [selectedServices, setSelectedServices] = useState([]);
  const [labDuration, setLabDuration] = useState(LAB_DURATIONS[0].id);

  useEffect(() => {
    const load = async () => {
      try {
        const response = isExpert ? await expertsApi.get(id) : await labsApi.get(id);
        const source = response?.data ?? (isExpert ? MOCK_EXPERTS : MOCK_LABS);
        const item = Array.isArray(source) ? source.find((x) => Number(x.id) === Number(id)) : source;
        setProvider(item ?? (isExpert ? MOCK_EXPERTS.find((x) => Number(x.id) === Number(id)) : MOCK_LABS.find((x) => Number(x.id) === Number(id))));
      } catch {
        setProvider(isExpert ? MOCK_EXPERTS.find((x) => Number(x.id) === Number(id)) : MOCK_LABS.find((x) => Number(x.id) === Number(id)));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isExpert]);

  const availableDates = useMemo(() => Object.keys(provider?.availability_json ?? {}), [provider]);

  const totalPrice = useMemo(() => {
    if (!provider) return 0;

    if (isExpert) {
      const selected = SESSION_TYPES.find((s) => s.id === sessionType) ?? SESSION_TYPES[0];
      return Math.round((provider.hourly_rate ?? 0) * selected.multiplier);
    }

    const selected = LAB_DURATIONS.find((d) => d.id === labDuration) ?? LAB_DURATIONS[0];
    const base = provider.price_per_day ?? 0;
    return Math.round(base * selected.factor);
  }, [provider, isExpert, sessionType, labDuration]);

  function toggleService(value) {
    setSelectedServices((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function canContinue() {
    if (!selectedDate || !selectedSlot) return false;
    if (isExpert) return problem.trim().length >= 50;
    return selectedServices.length > 0;
  }

  function handleContinue() {
    if (!provider || !canContinue()) return;

    const selectedSession = SESSION_TYPES.find((s) => s.id === sessionType) ?? SESSION_TYPES[0];

    navigate('/payment', {
      state: {
        flow: 'booking',
        type,
        provider,
        selectedDate,
        selectedSlot,
        problem,
        sessionType: selectedSession,
        selectedServices,
        labDuration,
        totalPrice,
      },
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[var(--bg-base)]">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <div className="container-app py-10">Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex min-h-screen bg-[var(--bg-base)]">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <div className="container-app py-10">Provider not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar />
        <div className="container-app py-8">
          <h1 className="mb-2">{isExpert ? 'Expert Booking' : 'Lab Booking'}</h1>
          <p className="text-[var(--text-muted)] mb-6">Complete your {titleCase(type)} booking with date, time, and payment.</p>

          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-[12px] bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center font-semibold text-xl">
                    {provider.name?.charAt(0) || (isExpert ? 'E' : 'L')}
                  </div>
                  <div className="flex-1">
                    <p className="text-[16px] font-semibold text-[var(--text-primary)]">{provider.name}</p>
                    <p className="text-[13px] text-[var(--text-muted)]">{provider.location || 'University partner'}</p>
                    <p className="text-sm mt-1">⭐ {provider.rating ?? 4.8}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[var(--accent)] font-semibold">€{isExpert ? provider.hourly_rate : provider.price_per_day}</p>
                    <p className="text-[13px] text-[var(--text-muted)]">{isExpert ? '/hour' : '/day'}</p>
                  </div>
                </div>
              </div>

              {isExpert ? (
                <div className="card p-5 space-y-4">
                  <div>
                    <label className="label">Problem description (required, min 50 chars)</label>
                    <textarea
                      className="input"
                      minLength={50}
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      placeholder="Describe the research or technical challenge in detail..."
                    />
                    <small>{problem.length}/50 minimum</small>
                  </div>

                  <div>
                    <label className="label">Session type</label>
                    <div className="grid sm:grid-cols-3 gap-2">
                      {SESSION_TYPES.map((session) => (
                        <button
                          key={session.id}
                          type="button"
                          onClick={() => setSessionType(session.id)}
                          className={`h-10 rounded-[10px] border text-sm ${sessionType === session.id ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}
                        >
                          {session.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card p-5 space-y-4">
                  <div>
                    <label className="label">Equipment / services</label>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {(provider.equipment_json ?? provider.services_json ?? []).map((item) => (
                        <label key={item} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] border border-[var(--border)] rounded-[10px] px-3 py-2">
                          <input type="checkbox" checked={selectedServices.includes(item)} onChange={() => toggleService(item)} />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Duration</label>
                    <div className="grid sm:grid-cols-3 gap-2">
                      {LAB_DURATIONS.map((duration) => (
                        <button
                          key={duration.id}
                          type="button"
                          onClick={() => setLabDuration(duration.id)}
                          className={`h-10 rounded-[10px] border text-sm ${labDuration === duration.id ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}
                        >
                          {duration.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <BookingCalendar
                availableDates={availableDates}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onDateSelect={setSelectedDate}
                onSlotSelect={setSelectedSlot}
              />
            </div>

            <div className="lg:col-span-4">
              <div className="card p-5 sticky top-24">
                <h3 className="mb-3">Booking Summary</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between"><span>Provider</span><span className="text-[var(--text-primary)]">{provider.name}</span></div>
                  <div className="flex justify-between"><span>Date</span><span className="text-[var(--text-primary)]">{selectedDate || '-'}</span></div>
                  <div className="flex justify-between"><span>Time</span><span className="text-[var(--text-primary)]">{selectedSlot || '-'}</span></div>
                  <div className="flex justify-between"><span>Type</span><span className="text-[var(--text-primary)]">{isExpert ? (SESSION_TYPES.find((s) => s.id === sessionType)?.label || '-') : (LAB_DURATIONS.find((d) => d.id === labDuration)?.label || '-')}</span></div>
                  <div className="flex justify-between"><span>Price</span><span className="text-[var(--accent)] font-semibold">€{totalPrice}</span></div>
                </div>
                <button disabled={!canContinue()} onClick={handleContinue} className="btn-primary w-full">Confirm Booking</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
