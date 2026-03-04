import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { expertsApi, labsApi } from '../utils/api';
import { MOCK_EXPERTS, MOCK_LABS } from '../utils/mockData';

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function pad(n) { return String(n).padStart(2, '0'); }

export default function BookingCalendar() {
  const { type, id } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [calDate, setCalDate]         = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [problem, setProblem]         = useState('');

  const year  = calDate.getFullYear();
  const month = calDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

  useEffect(() => {
    const api = type === 'expert' ? expertsApi.get(id) : labsApi.get(id);
    const MOCK = type === 'expert' ? MOCK_EXPERTS : MOCK_LABS;
    api
      .then(r => setProvider(r?.data && !Array.isArray(r.data) ? r.data : MOCK.find(x => x.id === Number(id)) ?? null))
      .catch(() => setProvider(MOCK.find(x => x.id === Number(id)) ?? null))
      .finally(() => setLoading(false));
  }, [type, id]);

  const availability = provider?.availability_json || {};

  function dateKey(day) {
    return `${year}-${pad(month + 1)}-${pad(day)}`;
  }

  function isAvailable(day) {
    const key = dateKey(day);
    const slots = availability[key];
    if (!slots) return false;
    if (Array.isArray(slots)) return slots.length > 0;
    return slots === true;
  }

  function getSlotsForDate(date) {
    const slots = availability[date];
    if (!slots) return [];
    if (Array.isArray(slots)) return slots;
    if (slots === true) {
      // Lab: return full-day marker
      return ['Full day'];
    }
    return [];
  }

  function handleDayClick(day) {
    const today = new Date();
    const clickedDate = new Date(year, month, day);
    if (clickedDate < today) return;
    if (!isAvailable(day)) return;
    setSelectedDate(dateKey(day));
    setSelectedSlot(null);
  }

  function handleProceed() {
    if (!selectedDate || !selectedSlot) return;

    const [slotHour] = selectedSlot.split(':');
    const startTime = selectedSlot === 'Full day'
      ? `${selectedDate} 08:00:00`
      : `${selectedDate} ${selectedSlot}:00`;
    const endTime = selectedSlot === 'Full day'
      ? `${selectedDate} 18:00:00`
      : `${selectedDate} ${pad(parseInt(slotHour) + 1)}:00:00`;

    const rate = type === 'expert' ? provider.hourly_rate : provider.price_per_day;
    const hours = selectedSlot === 'Full day' ? 1 : 1;
    const total = rate * hours;

    navigate('/payment', {
      state: {
        provider_id: provider.id,
        provider_type: type,
        provider_name: provider.name,
        slot_start: startTime,
        slot_end: endTime,
        problem_description: problem,
        total_price: total,
        rate,
      },
    });
  }

  const today = new Date();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div>
        </div>
      </div>
    );
  }

  const slots = selectedDate ? getSlotsForDate(selectedDate) : [];
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayLabels  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 max-w-5xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Select a Time Slot</h1>
            <p className="text-gray-500 mt-1">
              Booking: <strong>{provider?.name}</strong> · {type === 'expert' ? `€${provider?.hourly_rate}/hr` : `€${provider?.price_per_day}/day`}
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-3 card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{monthNames[month]} {year}</h2>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCalDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                  >←</button>
                  <button
                    onClick={() => setCalDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                  >→</button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {dayLabels.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for first week offset */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const dateStr = dateKey(day);
                  const isPast = new Date(year, month, day) < today;
                  const avail  = isAvailable(day);
                  const isSelected = selectedDate === dateStr;

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      disabled={isPast || !avail}
                      className={`
                        aspect-square rounded-lg text-sm font-medium transition-all
                        ${isSelected ? 'bg-primary-600 text-white shadow-md' : ''}
                        ${!isSelected && avail && !isPast ? 'bg-primary-50 text-primary-700 hover:bg-primary-100 cursor-pointer' : ''}
                        ${!avail || isPast ? 'text-gray-300 cursor-default' : ''}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-primary-100 rounded" />Available</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-primary-600 rounded" />Selected</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-100 rounded" />Unavailable</span>
              </div>
            </div>

            {/* Right panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* Time slots */}
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {selectedDate
                    ? `Available on ${new Date(selectedDate + 'T12:00').toLocaleDateString('en-DE', { day: '2-digit', month: 'long' })}`
                    : 'Select a date'}
                </h3>
                {selectedDate && slots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 px-3 rounded-lg text-sm font-medium border-2 transition-all ${
                          selectedSlot === slot
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    {selectedDate ? 'No slots on this date.' : 'Click a highlighted date to see available slots.'}
                  </p>
                )}
              </div>

              {/* Problem description */}
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Problem description</h3>
                <textarea
                  className="input text-sm"
                  rows={4}
                  placeholder="Briefly describe what you need help with…"
                  value={problem}
                  onChange={e => setProblem(e.target.value)}
                />
              </div>

              {/* Summary */}
              {selectedSlot && (
                <div className="card p-5 bg-primary-50 border-primary-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Provider</span>
                      <span className="font-medium">{provider?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span className="font-medium">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time</span>
                      <span className="font-medium">{selectedSlot}</span>
                    </div>
                    <div className="flex justify-between border-t border-primary-200 pt-2 font-semibold">
                      <span>Total</span>
                      <span className="text-primary-700">€{type === 'expert' ? provider?.hourly_rate : provider?.price_per_day}</span>
                    </div>
                  </div>
                  <button onClick={handleProceed} className="btn-primary w-full">
                    Continue to payment →
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
