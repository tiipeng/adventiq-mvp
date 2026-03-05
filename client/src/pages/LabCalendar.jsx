import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { labsApi } from '../utils/api';
import { MOCK_LABS } from '../utils/mockData';

const CITIES = ['All', 'Munich', 'Warsaw', 'Dresden', 'Kraków'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toLabelDate(dateStr) {
  const dt = new Date(`${dateStr}T00:00:00`);
  return dt.toLocaleDateString('en-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getTier(count, maxDensity) {
  if (count <= 0) return 'none';
  const ratio = count / Math.max(maxDensity, 1);
  if (ratio >= 0.75) return 'high';
  if (ratio >= 0.45) return 'medium';
  return 'light';
}

const TIER_STYLE = {
  light: 'bg-[rgba(80,124,255,0.14)] text-[#bdd0ff] border-[#4566b5]',
  medium: 'bg-[rgba(60,192,255,0.2)] text-[#c6f3ff] border-[#2a7ea8]',
  high: 'bg-[rgba(35,213,168,0.22)] text-[#adf5df] border-[#2e9b7e]',
};

function matchesAvailabilityFilter(filter, count, maxDensity) {
  if (filter === 'all') return true;
  const tier = getTier(count, maxDensity);
  return tier === filter;
}

export default function LabCalendar() {
  const navigate = useNavigate();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('monthly');
  const [city, setCity] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  const [today] = useState(new Date());
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(toDateStr(today));

  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    const params = city !== 'All' ? { location: city } : {};
    setLoading(true);

    labsApi.list(params)
      .then((response) => {
        const list = response?.data ?? MOCK_LABS;
        setLabs(Array.isArray(list) ? list : MOCK_LABS);
      })
      .catch(() => setLabs(MOCK_LABS))
      .finally(() => setLoading(false));
  }, [city]);

  const availMap = useMemo(() => {
    const map = {};
    labs.forEach((lab) => {
      Object.keys(lab.availability_json || {}).forEach((date) => {
        if (!map[date]) map[date] = [];
        map[date].push(lab);
      });
    });
    return map;
  }, [labs]);

  const maxDensity = useMemo(() => Math.max(1, ...Object.values(availMap).map((arr) => arr.length)), [availMap]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  }), [weekStart]);

  const selectedLabs = availMap[selectedDate] || [];

  const weeklyLabs = useMemo(() => {
    if (availabilityFilter === 'all') return labs;
    return labs.filter((lab) => {
      const availableInWeek = weekDays.reduce((sum, date) => {
        const key = toDateStr(date);
        return sum + ((lab.availability_json || {})[key] ? 1 : 0);
      }, 0);
      return matchesAvailabilityFilter(availabilityFilter, availableInWeek, 7);
    });
  }, [labs, weekDays, availabilityFilter]);

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function prevWeek() {
    setWeekStart((d) => {
      const n = new Date(d);
      n.setDate(n.getDate() - 7);
      return n;
    });
  }

  function nextWeek() {
    setWeekStart((d) => {
      const n = new Date(d);
      n.setDate(n.getDate() + 7);
      return n;
    });
  }

  function handleDayAction(dateStr, labsOnDay) {
    if (labsOnDay.length === 0) return;
    if (labsOnDay.length === 1) {
      navigate(`/book/lab/${labsOnDay[0].id}`);
      return;
    }
    navigate(`/labs?date=${dateStr}`);
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar />

      <main className="container-app py-8">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker mb-2">Lab booking workspace</p>
            <h1 className="mb-2">Lab Availability Calendar</h1>
            <p className="max-w-2xl text-[var(--text-muted)]">Track open lab capacity in a contextual calendar and jump straight into booking from the selected date panel.</p>
          </div>
          <Link to="/labs" className="btn-secondary w-fit">Map View</Link>
        </header>

        <section className="glass-panel mb-5 p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_auto] lg:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">City</p>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="input">
                {CITIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Availability</p>
              <div className="flex flex-wrap gap-2">
                {[{ id: 'all', label: 'All' }, { id: 'light', label: 'Light' }, { id: 'medium', label: 'Medium' }, { id: 'high', label: 'High' }].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAvailabilityFilter(item.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${availabilityFilter === item.id ? 'border-[var(--border-strong)] bg-[var(--accent-light)] text-[var(--text-primary)]' : 'border-[var(--border)] bg-[rgba(20,30,47,0.7)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">View</p>
              <div className="inline-flex rounded-xl border border-[var(--border)] bg-[rgba(14,23,38,0.78)] p-1">
                {[
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'weekly', label: 'Weekly' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setView(item.id)}
                    className={`rounded-lg px-3 py-1.5 text-sm transition ${view === item.id ? 'bg-[rgba(90,123,247,0.28)] text-[var(--text-primary)] shadow-[var(--shadow-1)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel p-4 lg:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
            <div className="rounded-2xl border border-[var(--border)] bg-[rgba(13,22,36,0.78)] p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[rgba(17,30,50,0.82)] p-2.5">
                <button type="button" onClick={view === 'monthly' ? prevMonth : prevWeek} className="btn-ghost h-9 px-3">Previous</button>
                <h2 className="text-base sm:text-lg">
                  {view === 'monthly'
                    ? `${MONTH_NAMES[month]} ${year}`
                    : `${weekDays[0].toLocaleDateString('en-DE', { day: '2-digit', month: 'short' })} - ${weekDays[6].toLocaleDateString('en-DE', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                </h2>
                <button type="button" onClick={view === 'monthly' ? nextMonth : nextWeek} className="btn-ghost h-9 px-3">Next</button>
              </div>

              {view === 'monthly' ? (
                <div key={`${year}-${month}`} style={{ animation: 'fade-in 190ms ease' }}>
                  <div className="mb-2 grid grid-cols-7 gap-2">
                    {DAY_NAMES.map((day) => (
                      <div key={day} className="py-1 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="min-h-[108px] rounded-xl border border-transparent bg-[rgba(12,20,34,0.35)]" />
                    ))}

                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const labsOnDay = availMap[dateStr] || [];
                      const isToday = dateStr === toDateStr(today);
                      const isSelected = dateStr === selectedDate;
                      const isWeekend = ((firstDay + day - 1) % 7) >= 5;
                      const tier = getTier(labsOnDay.length, maxDensity);
                      const showBadge = labsOnDay.length > 0 && matchesAvailabilityFilter(availabilityFilter, labsOnDay.length, maxDensity);

                      return (
                        <div
                          key={day}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedDate(dateStr)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setSelectedDate(dateStr);
                          }}
                          className={`group min-h-[108px] rounded-xl border p-2.5 transition-all duration-150 ${
                            isSelected
                              ? 'border-[var(--border-strong)] bg-[rgba(33,53,82,0.88)] shadow-[var(--shadow-2)]'
                              : 'border-[var(--border)] bg-[rgba(16,27,44,0.74)] hover:border-[var(--border-strong)] hover:bg-[rgba(24,39,62,0.86)]'
                          } ${isWeekend ? 'opacity-85' : ''}`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold ${isToday ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)]'}`}>
                              {day}
                            </span>
                            {isSelected ? <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--accent-alt)]">Selected</span> : null}
                          </div>

                          {showBadge ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDayAction(dateStr, labsOnDay);
                              }}
                              className={`w-full rounded-lg border px-2 py-1 text-left text-[11px] font-medium transition group-hover:translate-y-[-1px] ${TIER_STYLE[tier]}`}
                            >
                              {labsOnDay.length} labs available
                            </button>
                          ) : (
                            <p className="text-[11px] text-[var(--text-muted)]">No availability</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div key={toDateStr(weekDays[0])} style={{ animation: 'fade-in 190ms ease' }}>
                  <div className="mb-3 grid grid-cols-7 gap-2">
                    {weekDays.map((day, i) => {
                      const isToday = toDateStr(day) === toDateStr(today);
                      return (
                        <div key={DAY_NAMES[i]} className={`rounded-xl border p-2 text-center ${isToday ? 'border-[var(--border-strong)] bg-[rgba(84,120,240,0.24)] text-white' : 'border-[var(--border)] bg-[rgba(16,27,44,0.72)] text-[var(--text-secondary)]'}`}>
                          <p className="text-[10px] uppercase tracking-[0.1em]">{DAY_NAMES[i]}</p>
                          <p className="text-sm font-semibold">{day.getDate()}</p>
                        </div>
                      );
                    })}
                  </div>

                  {loading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => <div key={i} className="h-16 skeleton" />)}
                    </div>
                  ) : weeklyLabs.length === 0 ? (
                    <div className="rounded-xl border border-[var(--border)] bg-[rgba(15,24,38,0.72)] p-8 text-center text-sm text-[var(--text-muted)]">
                      No labs match this availability filter.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {weeklyLabs.map((lab) => (
                        <div key={lab.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-[var(--border)] bg-[rgba(16,28,45,0.8)] p-3 transition hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-1)]">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{lab.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{lab.city || lab.location?.split(',')[0]}</p>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {weekDays.map((day) => {
                              const dateStr = toDateStr(day);
                              const available = (lab.availability_json || {})[dateStr];
                              return (
                                <button
                                  key={`${lab.id}-${dateStr}`}
                                  type="button"
                                  onClick={() => {
                                    if (!available) return;
                                    setSelectedDate(dateStr);
                                    navigate(`/book/lab/${lab.id}`);
                                  }}
                                  className={`h-8 min-w-8 rounded-lg border px-2 text-xs font-medium transition ${available ? 'border-[#2e9b7e] bg-[rgba(35,213,168,0.22)] text-[#b5f8e3] hover:translate-y-[-1px]' : 'cursor-default border-[var(--border)] bg-[rgba(11,19,31,0.7)] text-[var(--text-muted)]'}`}
                                >
                                  {available ? 'Open' : '-'}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <aside className="rounded-2xl border border-[var(--border)] bg-[rgba(14,24,40,0.85)] p-4">
              <div className="mb-4 rounded-xl border border-[var(--border)] bg-[rgba(19,31,50,0.86)] p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">Selected Date</p>
                <h3 className="mt-1 text-lg">{toLabelDate(selectedDate)}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {selectedLabs.length > 0
                    ? `${selectedLabs.length} labs available to book now.`
                    : 'No labs available on this date.'}
                </p>

                {selectedLabs.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => handleDayAction(selectedDate, selectedLabs)}
                    className="btn-primary mt-3 w-full justify-center"
                  >
                    {selectedLabs.length === 1 ? 'Book selected lab' : 'View labs for this date'}
                  </button>
                ) : null}
              </div>

              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">Labs ({labs.length})</p>
                <Link to="/labs" className="text-xs text-[var(--accent-alt)] hover:text-[var(--text-primary)]">All labs</Link>
              </div>

              <div className="max-h-[480px] space-y-2 overflow-auto pr-1">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 skeleton" />)}
                  </div>
                ) : labs.length === 0 ? (
                  <p className="rounded-xl border border-[var(--border)] bg-[rgba(12,19,31,0.7)] py-6 text-center text-sm text-[var(--text-muted)]">No labs found in this city.</p>
                ) : (
                  labs.map((lab) => {
                    const availableToday = Boolean((lab.availability_json || {})[selectedDate]);
                    const availableCount = Object.keys(lab.availability_json || {}).length;

                    return (
                      <Link
                        key={lab.id}
                        to={`/labs/${lab.id}`}
                        className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[rgba(18,30,49,0.78)] p-3 transition hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-1)]"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[rgba(79,125,255,0.15)] text-sm text-[var(--text-primary)]">
                          LB
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{lab.name}</p>
                          <p className="truncate text-xs text-[var(--text-muted)]">{lab.city || lab.location?.split(',')[0]}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${availableToday ? 'border-[#2e9b7e] bg-[rgba(35,213,168,0.2)] text-[#b5f8e3]' : 'border-[var(--border)] bg-[rgba(11,19,31,0.72)] text-[var(--text-muted)]'}`}>
                            {availableToday ? 'Open' : 'Busy'}
                          </span>
                          <p className="mt-1 text-[10px] text-[var(--text-muted)]">{availableCount} days</p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
