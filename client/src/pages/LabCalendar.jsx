import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { labsApi } from '../utils/api';

const CITIES = ['All', 'Munich', 'Warsaw', 'Dresden', 'Kraków'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  // Monday-based: 0=Mon…6=Sun
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function LabCalendar() {
  const navigate = useNavigate();
  const [labs, setLabs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]     = useState('monthly');   // 'monthly' | 'weekly'
  const [city, setCity]     = useState('All');
  const [today]             = useState(new Date());
  const [year, setYear]     = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [weekStart, setWeekStart] = useState(() => {
    // start of current week (Monday)
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0,0,0,0);
    return d;
  });

  useEffect(() => {
    const params = city !== 'All' ? { location: city } : {};
    setLoading(true);
    labsApi.list(params).then(r => setLabs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [city]);

  // Build a set of available dates per lab
  function buildAvailMap(labs) {
    const map = {}; // date string → array of lab objects
    labs.forEach(lab => {
      Object.keys(lab.availability_json || {}).forEach(date => {
        if (!map[date]) map[date] = [];
        map[date].push(lab);
      });
    });
    return map;
  }

  const availMap = buildAvailMap(labs);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }
  function prevWeek() {
    setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
  }
  function nextWeek() {
    setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });
  }

  function toDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getDensityColor(count, max) {
    if (count === 0) return '';
    const ratio = count / Math.max(max, 1);
    if (ratio >= 0.75) return 'bg-green-600 text-white';
    if (ratio >= 0.5)  return 'bg-green-400 text-white';
    if (ratio >= 0.25) return 'bg-green-200 text-green-800';
    return 'bg-green-100 text-green-700';
  }

  const maxDensity = Math.max(1, ...Object.values(availMap).map(arr => arr.length));

  function handleDayClick(dateStr, labsOnDay) {
    if (labsOnDay.length === 0) return;
    if (labsOnDay.length === 1) {
      navigate(`/book/lab/${labsOnDay[0].id}`);
    } else {
      navigate(`/labs?date=${dateStr}`);
    }
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfWeek(year, month);

  // Weekly view days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Lab Availability Calendar</h1>
            <p className="text-gray-500">Browse when labs are available — click a slot to book.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/labs" className="btn-secondary text-sm">🗺 Map View</Link>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setView('monthly')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'monthly' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >Monthly</button>
              <button
                onClick={() => setView('weekly')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'weekly' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >Weekly</button>
            </div>
          </div>
        </div>

        {/* Filters + Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">City:</span>
            {CITIES.map(c => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${city === c ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 ml-auto">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 rounded" /> 1 lab</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-300 rounded" /> 2 labs</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded" /> 3+ labs</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="card overflow-hidden">
              {/* Navigation */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <button
                  onClick={view === 'monthly' ? prevMonth : prevWeek}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ←
                </button>
                <h2 className="font-semibold text-gray-900">
                  {view === 'monthly'
                    ? `${MONTH_NAMES[month]} ${year}`
                    : `${weekDays[0].toLocaleDateString('en-DE', { day: '2-digit', month: 'short' })} – ${weekDays[6].toLocaleDateString('en-DE', { day: '2-digit', month: 'short', year: 'numeric' })}`
                  }
                </h2>
                <button
                  onClick={view === 'monthly' ? nextMonth : nextWeek}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  →
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {DAY_NAMES.map(d => (
                  <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {d}
                  </div>
                ))}
              </div>

              {/* Monthly grid */}
              {view === 'monthly' && (
                <div className="grid grid-cols-7">
                  {/* Empty cells for first week offset */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-gray-100 bg-gray-50" />
                  ))}

                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                    const labsOnDay = availMap[dateStr] || [];
                    const isToday = dateStr === toDateStr(today);
                    const density = getDensityColor(labsOnDay.length, maxDensity);
                    const isWeekend = ((firstDay + day - 1) % 7) >= 5; // Sat or Sun

                    return (
                      <div
                        key={day}
                        onClick={() => handleDayClick(dateStr, labsOnDay)}
                        className={`min-h-[80px] border-b border-r border-gray-100 p-2 transition-all
                          ${labsOnDay.length > 0 ? 'cursor-pointer hover:ring-2 hover:ring-primary-300' : ''}
                          ${isWeekend ? 'bg-gray-50' : 'bg-white'}
                        `}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mb-1 ${isToday ? 'bg-primary-600 text-white' : 'text-gray-700'}`}>
                          {day}
                        </div>
                        {labsOnDay.length > 0 && (
                          <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${density}`}>
                            {labsOnDay.length} lab{labsOnDay.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Weekly grid */}
              {view === 'weekly' && (
                <div>
                  {/* Labs list as rows */}
                  {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading labs…</div>
                  ) : labs.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No labs found</div>
                  ) : (
                    <div>
                      {/* Column headers = day dates */}
                      <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                        <div className="py-2 px-3 text-xs font-semibold text-gray-500">Lab</div>
                        {weekDays.map((d, i) => {
                          const isToday = toDateStr(d) === toDateStr(today);
                          return (
                            <div key={i} className={`py-2 text-center text-xs font-semibold ${isToday ? 'text-primary-600' : 'text-gray-500'}`}>
                              <span className="uppercase tracking-wide">{DAY_NAMES[i]}</span>
                              <br />
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mt-0.5 ${isToday ? 'bg-primary-600 text-white' : 'text-gray-700'}`}>
                                {d.getDate()}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {labs.map(lab => (
                        <div key={lab.id} className="grid grid-cols-8 border-b border-gray-100 hover:bg-gray-50">
                          <div className="py-3 px-3">
                            <Link to={`/labs/${lab.id}`} className="text-xs font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                              {lab.name}
                            </Link>
                            <p className="text-xs text-gray-400">{lab.city || lab.location?.split(',')[0]}</p>
                          </div>
                          {weekDays.map((d, i) => {
                            const dateStr = toDateStr(d);
                            const avail   = (lab.availability_json || {})[dateStr];
                            return (
                              <div
                                key={i}
                                className={`py-3 flex items-center justify-center ${avail ? 'cursor-pointer' : ''}`}
                                onClick={() => avail && navigate(`/book/lab/${lab.id}`)}
                              >
                                {avail ? (
                                  <span className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-xs font-bold hover:bg-green-600 transition-colors">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">—</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Lab list */}
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Labs ({labs.length})</h3>
              {loading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {labs.map(lab => (
                    <Link key={lab.id} to={`/labs/${lab.id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🔬</div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{lab.name}</p>
                        <p className="text-xs text-gray-400">{lab.city || lab.location?.split(',')[0]}</p>
                      </div>
                    </Link>
                  ))}
                  {labs.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No labs in this city</p>
                  )}
                </div>
              )}
              <Link to="/labs" className="btn-secondary w-full text-xs mt-3 justify-center">
                Browse all labs
              </Link>
            </div>

            <div className="card p-4 bg-green-50 border-green-200">
              <h4 className="text-sm font-semibold text-green-800 mb-2">Quick tip</h4>
              <p className="text-xs text-green-700">Click any highlighted day in the monthly view to go directly to lab booking. In weekly view, click the ✓ for a specific lab.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
