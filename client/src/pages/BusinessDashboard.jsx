import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BookingCard from '../components/BookingCard';
import { bookingsApi, asyncApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon, label, value, sub, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

function AsyncQCard({ q }) {
  const [expanded, setExpanded] = useState(false);
  const statusColors = {
    pending:  'bg-yellow-100 text-yellow-700',
    answered: 'bg-green-100 text-green-700',
    archived: 'bg-gray-100 text-gray-500',
  };
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-medium text-gray-900 text-sm">{q.expert_name}</p>
          <p className="text-xs text-gray-400">{new Date(q.created_at).toLocaleDateString('en-DE')} · {q.sla_hours}h SLA</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[q.status]}`}>
          {q.status === 'pending' ? '⏳ Pending' : q.status === 'answered' ? '✅ Answered' : '📁 Archived'}
        </span>
      </div>
      <p className="text-xs text-gray-600 line-clamp-2 mb-1">{q.question}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-primary-600">€{q.price} paid</span>
        {q.status === 'answered' && q.answer && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary-600 hover:underline">
            {expanded ? '▲ Hide answer' : '▼ Read answer'}
          </button>
        )}
      </div>
      {expanded && q.answer && (
        <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-100 text-xs text-gray-700 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
          {q.answer}
        </div>
      )}
    </div>
  );
}

const TABS = ['Overview', 'Expert Bookings', 'Lab Bookings', "Async Q's", 'Follow-Ups'];

export default function BusinessDashboard() {
  const { user } = useAuth();
  const [tab, setTab]           = useState('Overview');
  const [bookings, setBookings] = useState([]);
  const [asyncQs, setAsyncQs]   = useState([]);
  const [loadingB, setLoadingB] = useState(true);
  const [loadingA, setLoadingA] = useState(true);
  const [toast, setToast]       = useState('');

  // Mock follow-up suggestions (seeded data drives this in production)
  const followUps = [
    {
      id: 1, type: 'expert', name: 'Dr. Wei Chen', location: 'Berlin, Germany',
      score: 87, reason: 'Your ML pipeline work often benefits from sustainable infrastructure design — Dr. Chen specializes in green tech systems.',
      bookUrl: '/book/expert/3', viewUrl: '/experts/3',
    },
    {
      id: 2, type: 'lab', name: 'TUM Cleanroom Facility', location: 'Munich, Germany',
      score: 73, reason: 'Hardware prototyping is the next natural step after your ML architecture review — TUM Cleanroom offers semiconductor prototyping.',
      bookUrl: '/book/lab/1', viewUrl: '/labs/1',
    },
  ];

  useEffect(() => {
    bookingsApi.list()
      .then(r => setBookings(r.data))
      .catch(console.error)
      .finally(() => setLoadingB(false));
    asyncApi.list()
      .then(r => setAsyncQs(r.data))
      .catch(console.error)
      .finally(() => setLoadingA(false));
  }, []);

  async function handleStatusChange(bookingId, status) {
    try {
      await bookingsApi.updateStatus(bookingId, status);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to update booking');
    }
  }

  const expertBookings = bookings.filter(b => b.provider_type === 'expert');
  const labBookings    = bookings.filter(b => b.provider_type === 'lab');
  const pending   = bookings.filter(b => b.status === 'pending').length;
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const totalSpend = bookings.filter(b => ['confirmed','completed'].includes(b.status))
    .reduce((s,b) => s + (b.total_price || 0), 0);

  const answeredAsync = asyncQs.filter(q => q.status === 'answered').length;

  function tabBadge(t) {
    if (t === "Async Q's" && answeredAsync > 0) return answeredAsync;
    if (t === 'Follow-Ups') return followUps.length;
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        {toast && (
          <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
            ✅ {toast}
          </div>
        )}

        <main className="flex-1 p-6 max-w-5xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-gray-500 mt-1">Here's an overview of your AdventIQ activity.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon="📋" label="Total bookings"  value={bookings.length} color="blue" />
            <StatCard icon="⏳" label="Pending"         value={pending}         color="yellow" />
            <StatCard icon="✅" label="Confirmed"       value={confirmed}       color="green" />
            <StatCard icon="💶" label="Total spend"     value={`€${totalSpend}`} sub={`${completed} completed`} color="purple" />
          </div>

          {/* Quick actions */}
          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            <Link to="/problem-form" className="card p-4 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-xl group-hover:bg-primary-600 group-hover:text-white transition-colors">🔍</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Find Expert or Lab</p>
                  <p className="text-xs text-gray-500">Describe your problem</p>
                </div>
              </div>
            </Link>
            <Link to="/ai-recommend" className="card p-4 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">🤖</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">AI Matching</p>
                  <p className="text-xs text-gray-500">Smart scored results</p>
                </div>
              </div>
            </Link>
            <Link to="/labs" className="card p-4 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl group-hover:bg-green-600 group-hover:text-white transition-colors">🔬</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Browse Labs</p>
                  <p className="text-xs text-gray-500">Map & list view</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mb-6 border-b border-gray-200 overflow-x-auto">
            {TABS.map(t => {
              const badge = tabBadge(t);
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                    tab === t
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t}
                  {badge ? (
                    <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">{badge}</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* ── Overview ── */}
          {tab === 'Overview' && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">All Bookings</h2>
              {loadingB ? (
                <div className="text-center py-12 text-gray-400">Loading bookings…</div>
              ) : bookings.length === 0 ? (
                <div className="card p-12 text-center">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-gray-500 mb-4">No bookings yet.</p>
                  <Link to="/problem-form" className="btn-primary">Find your first expert →</Link>
                </div>
              ) : (
                bookings.map(b => (
                  <BookingCard key={b.id} booking={b} actorRole="business" showActions onStatusChange={handleStatusChange} />
                ))
              )}
            </div>
          )}

          {/* ── Expert Bookings ── */}
          {tab === 'Expert Bookings' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">Expert Consultations ({expertBookings.length})</h2>
                <Link to="/experts" className="btn-secondary text-sm">Browse experts</Link>
              </div>
              {expertBookings.length === 0 ? (
                <div className="card p-10 text-center">
                  <p className="text-3xl mb-2">👤</p>
                  <p className="text-gray-500 mb-4">No expert bookings yet.</p>
                  <Link to="/experts" className="btn-primary">Browse experts</Link>
                </div>
              ) : (
                expertBookings.map(b => (
                  <BookingCard key={b.id} booking={b} actorRole="business" showActions onStatusChange={handleStatusChange} />
                ))
              )}
            </div>
          )}

          {/* ── Lab Bookings ── */}
          {tab === 'Lab Bookings' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Lab Rentals ({labBookings.length})</h2>
                <Link to="/labs" className="btn-secondary text-sm">Browse labs →</Link>
              </div>
              {labBookings.length === 0 ? (
                <div className="card p-10 text-center">
                  <p className="text-3xl mb-2">🔬</p>
                  <p className="text-gray-500 mb-4">No lab bookings yet.</p>
                  <Link to="/labs" className="btn-primary">Explore lab facilities →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {labBookings.map(b => {
                    const statusColors = {
                      pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
                      confirmed: 'bg-green-100 text-green-700 border-green-200',
                      completed: 'bg-blue-100 text-blue-700 border-blue-200',
                      rejected:  'bg-red-100 text-red-700 border-red-200',
                      cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
                    };
                    return (
                      <div key={b.id} className="card p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">🔬</div>
                            <div>
                              <p className="font-semibold text-gray-900">{b.provider_name || `Lab #${b.provider_id}`}</p>
                              <p className="text-xs text-gray-500">{b.provider_location || '–'}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${statusColors[b.status] || 'bg-gray-100'}`}>
                            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs text-gray-600 mb-2">
                          <div><p className="text-gray-400 mb-0.5">Start</p><p className="font-medium">{new Date(b.slot_start).toLocaleDateString('en-DE')}</p></div>
                          <div><p className="text-gray-400 mb-0.5">End</p><p className="font-medium">{new Date(b.slot_end).toLocaleDateString('en-DE')}</p></div>
                          <div><p className="text-gray-400 mb-0.5">Total paid</p><p className="font-bold text-green-600">€{b.total_price}</p></div>
                        </div>
                        {b.problem_description && (
                          <p className="text-xs text-gray-500 line-clamp-2">{b.problem_description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Async Q's ── */}
          {tab === "Async Q's" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Async Questions ({asyncQs.length})</h2>
                <Link to="/experts" className="btn-primary text-sm">Ask new question</Link>
              </div>
              {loadingA ? (
                <div className="text-center py-8 text-gray-400">Loading…</div>
              ) : asyncQs.length === 0 ? (
                <div className="card p-10 text-center">
                  <p className="text-3xl mb-2">✉</p>
                  <p className="text-gray-500 mb-4">No async questions yet. Click "Ask Async" on any expert's profile to get started.</p>
                  <Link to="/experts" className="btn-primary">Browse experts</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {asyncQs.map(q => <AsyncQCard key={q.id} q={q} />)}
                </div>
              )}
            </div>
          )}

          {/* ── Follow-Ups ── */}
          {tab === 'Follow-Ups' && (
            <div>
              <div className="flex items-start gap-3 mb-5 p-4 bg-primary-50 border border-primary-100 rounded-xl">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="font-semibold text-gray-900">Smart Follow-Up Suggestions</p>
                  <p className="text-sm text-gray-600 mt-0.5">Based on your completed projects, our AI engine suggests the most relevant next steps.</p>
                </div>
              </div>

              <div className="space-y-3">
                {followUps.map(s => (
                  <div key={s.id} className="card p-4 border-l-4 border-primary-400 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${s.type === 'expert' ? 'bg-primary-100' : 'bg-green-100'}`}>
                        {s.type === 'expert' ? '👤' : '🔬'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                            s.score >= 85 ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                          }`}>🎯 {s.score}% match</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{s.location}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{s.reason}</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <Link to={s.viewUrl} className="btn-secondary text-xs py-1.5 px-3">View</Link>
                        <Link to={s.bookUrl} className="btn-primary text-xs py-1.5 px-3">Book</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 text-center mt-6">
                AI suggestions are based on expertise overlap with your past bookings. Confidence scores reflect semantic similarity.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
