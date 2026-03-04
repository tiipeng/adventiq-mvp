import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import BookingCard from '../components/BookingCard';
import { bookingsApi, expertsApi, asyncApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { key: 'overview',     icon: '📊', label: 'Overview' },
  { key: 'bookings',     icon: '📅', label: 'Bookings' },
  { key: 'async',        icon: '✉',  label: "Async Q's" },
  { key: 'profile',      icon: '👤', label: 'Profile' },
  { key: 'availability', icon: '🗓',  label: 'Availability' },
  { key: 'labs',         icon: '🔬', label: 'Labs' },
  { key: 'earnings',     icon: '💶', label: 'Earnings' },
];

const MOCK_PAYOUTS = [
  { id: 'po_001', date: '2026-02-28', amount: 237.50, type: 'Consultation', client: 'TechCorp DE', status: 'paid' },
  { id: 'po_002', date: '2026-02-15', amount: 171.00, type: 'Consultation', client: 'TechCorp DE', status: 'paid' },
  { id: 'po_003', date: '2026-01-30', amount: 118.75, type: 'Async Q',      client: 'Innovate PL', status: 'paid' },
  { id: 'po_004', date: '2026-01-15', amount: 237.50, type: 'Consultation', client: 'FinTech GmbH', status: 'paid' },
];

const MONTHLY_EARNINGS = [
  { month: 'Oct', amount: 310 },
  { month: 'Nov', amount: 420 },
  { month: 'Dec', amount: 285 },
  { month: 'Jan', amount: 356 },
  { month: 'Feb', amount: 409 },
  { month: 'Mar', amount: 120 },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const HOURS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

function SlaCountdown({ createdAt, slaHours, status }) {
  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + slaHours);
  const msLeft = deadline - new Date();
  if (status === 'answered') return <span className="text-xs text-green-600 font-medium">✅ Answered</span>;
  if (msLeft <= 0) return <span className="text-xs text-red-600 font-medium">⚠️ SLA expired</span>;
  const hoursLeft = Math.floor(msLeft / 3600000);
  const minsLeft  = Math.floor((msLeft % 3600000) / 60000);
  return (
    <span className={`text-xs font-medium ${hoursLeft < 4 ? 'text-red-600' : 'text-yellow-700'}`}>
      ⏳ {hoursLeft}h {minsLeft}m left
    </span>
  );
}

function AIDraftEditor({ q, onSubmit }) {
  const [answer, setAnswer]       = useState(q.ai_draft || '');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      await asyncApi.answer(q.id, answer);
      onSubmit(q.id);
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-700">Your answer</span>
        <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full">🤖 AI draft pre-loaded</span>
      </div>
      <textarea
        className="input text-xs leading-relaxed"
        rows={10}
        value={answer}
        onChange={e => setAnswer(e.target.value)}
      />
      <div className="flex gap-2">
        <button onClick={() => setAnswer(q.ai_draft || '')} className="btn-secondary text-xs">↺ Reset to AI draft</button>
        <button onClick={() => setAnswer('')} className="btn-secondary text-xs">🗑 Clear</button>
        <button onClick={handleSubmit} disabled={submitting || !answer.trim()} className="btn-primary text-xs flex-1">
          {submitting ? '⏳ Submitting…' : '✅ Submit Answer'}
        </button>
      </div>
    </div>
  );
}

export default function ExpertDashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const [section, setSection]    = useState('overview');
  const [bookings, setBookings]  = useState([]);
  const [asyncQs, setAsyncQs]    = useState([]);
  const [loadingB, setLoadingB]  = useState(true);
  const [loadingA, setLoadingA]  = useState(true);
  const [editMode, setEditMode]  = useState(false);
  const [saving, setSaving]      = useState(false);
  const [form, setForm]          = useState({ bio: '', location: '', hourly_rate: '', expertise_tags: '' });
  const [expandedQ, setExpandedQ] = useState(null);
  const [avail, setAvail]        = useState(() => {
    const init = {};
    DAYS.forEach(d => HOURS.forEach(h => { init[`${d}-${h}`] = false; }));
    ['Mon-09:00','Mon-10:00','Tue-09:00','Tue-13:00','Wed-10:00','Thu-09:00','Thu-14:00','Fri-10:00'].forEach(k => { init[k] = true; });
    return init;
  });

  const loadBookings = useCallback(() => {
    bookingsApi.list().then(r => setBookings(r.data)).catch(console.error).finally(() => setLoadingB(false));
  }, []);

  const loadAsync = useCallback(() => {
    asyncApi.list().then(r => setAsyncQs(r.data)).catch(console.error).finally(() => setLoadingA(false));
  }, []);

  useEffect(() => { loadBookings(); loadAsync(); }, [loadBookings, loadAsync]);

  useEffect(() => {
    if (profile) {
      setForm({
        bio: profile.bio || '',
        location: profile.location || '',
        hourly_rate: profile.hourly_rate || '',
        expertise_tags: (profile.expertise_tags || []).join(', '),
      });
    }
  }, [profile]);

  async function handleStatusChange(bookingId, status) {
    try {
      await bookingsApi.updateStatus(bookingId, status);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    } catch (e) { alert(e.response?.data?.error || 'Failed'); }
  }

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    try {
      await expertsApi.update(profile.id, {
        bio: form.bio, location: form.location,
        hourly_rate: parseFloat(form.hourly_rate) || 0,
        expertise_tags: form.expertise_tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      await refreshProfile();
      setEditMode(false);
    } catch (e) { alert(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  }

  function onAsyncAnswered(id) {
    setAsyncQs(prev => prev.map(q => q.id === id ? { ...q, status: 'answered' } : q));
    setExpandedQ(null);
  }

  const pending      = bookings.filter(b => b.status === 'pending').length;
  const confirmed    = bookings.filter(b => b.status === 'confirmed').length;
  const completed    = bookings.filter(b => b.status === 'completed').length;
  const earnings     = bookings.filter(b => ['confirmed','completed'].includes(b.status)).reduce((s,b) => s + (b.total_price || 0), 0);
  const pendingAsync = asyncQs.filter(q => q.status === 'pending').length;
  const mockTotal    = MOCK_PAYOUTS.reduce((s,p) => s + p.amount, 0);
  const maxBar       = Math.max(...MONTHLY_EARNINGS.map(m => m.amount));

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Internal sidebar ── */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 sticky top-0 h-screen z-10">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AQ</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">AdventIQ</span>
              <p className="text-xs text-gray-400">Expert Dashboard</p>
            </div>
          </div>
        </div>

        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">{user?.name?.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400">⭐ {profile?.rating || '–'} · €{profile?.hourly_rate}/hr</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const badge = item.key === 'async' ? pendingAsync : null;
            return (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  section === item.key
                    ? 'bg-primary-50 text-primary-700 border border-primary-100'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {badge > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {user?.status === 'pending' && (
          <div className="p-3 m-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 font-medium">⏳ Pending approval</p>
            <p className="text-xs text-yellow-700 mt-0.5">An admin will review your profile shortly.</p>
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">

          {/* ── OVERVIEW ── */}
          {section === 'overview' && (
            <div className="max-w-4xl">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Overview</h1>
              <p className="text-gray-500 mb-6">Welcome back, {user?.name?.split(' ')[0]}. Here's your activity at a glance.</p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Avg response', value: profile?.avg_response_time || '–', icon: '⚡', c: 'text-green-600' },
                  { label: 'Success rate', value: profile?.success_rate > 0 ? `${profile.success_rate}%` : '–', icon: '✅', c: 'text-green-600' },
                  { label: 'Pending async', value: pendingAsync, icon: '✉', c: 'text-yellow-600' },
                  { label: 'Earnings', value: `€${earnings}`, icon: '💶', c: 'text-primary-600' },
                ].map(s => (
                  <div key={s.label} className="card p-4 flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <p className={`text-xl font-bold ${s.c}`}>{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                {/* Upcoming */}
                <div className="card p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Upcoming Consultations</h3>
                  {bookings.filter(b => b.status === 'confirmed').length === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center">No confirmed bookings</p>
                  ) : (
                    <div className="space-y-2">
                      {bookings.filter(b => b.status === 'confirmed').slice(0, 3).map(b => (
                        <div key={b.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">📅</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{b.business_name || 'Client'}</p>
                            <p className="text-xs text-gray-500">{new Date(b.slot_start).toLocaleDateString('en-DE', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <span className="text-xs font-semibold text-green-600">€{b.total_price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pending async */}
                <div className="card p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Pending Async Q's ({pendingAsync})</h3>
                  {asyncQs.filter(q => q.status === 'pending').length === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center">No pending questions</p>
                  ) : (
                    <div className="space-y-2">
                      {asyncQs.filter(q => q.status === 'pending').slice(0, 3).map(q => (
                        <div key={q.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium text-gray-900">{q.business_name || 'Client'}</p>
                            <SlaCountdown createdAt={q.created_at} slaHours={q.sla_hours} status={q.status} />
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{q.question}</p>
                          <button
                            onClick={() => { setSection('async'); setExpandedQ(q.id); }}
                            className="text-xs text-primary-600 hover:underline mt-1"
                          >
                            Answer now →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="card p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Performance</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'New requests', value: pending, icon: '📬' },
                      { label: 'Confirmed', value: confirmed, icon: '✅' },
                      { label: 'Completed', value: completed, icon: '🎯' },
                      { label: 'Session earnings', value: `€${earnings}`, icon: '💶' },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-2"><span>{s.icon}</span>{s.label}</span>
                        <span className="font-semibold text-gray-900">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent payouts */}
                <div className="card p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Earnings</h3>
                  <div className="space-y-2.5">
                    {MOCK_PAYOUTS.slice(0, 3).map(p => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-gray-800">{p.type}</p>
                          <p className="text-xs text-gray-400">{p.date} · {p.client}</p>
                        </div>
                        <span className="font-semibold text-green-600">€{p.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setSection('earnings')} className="text-xs text-primary-600 hover:underline mt-3 block">
                    View all payouts →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {section === 'bookings' && (
            <div className="max-w-4xl">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Bookings</h1>
              <p className="text-gray-500 mb-6">Accept, decline, or mark sessions as completed</p>
              <div className="flex gap-2 flex-wrap mb-5">
                {[['All', bookings.length], ['Pending', pending], ['Confirmed', confirmed], ['Completed', completed]].map(([l, c]) => (
                  <span key={l} className="text-sm text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-full">
                    {l} <strong>{c}</strong>
                  </span>
                ))}
              </div>
              {loadingB ? (
                <div className="text-center py-12 text-gray-400">Loading…</div>
              ) : bookings.length === 0 ? (
                <div className="card p-12 text-center"><p className="text-3xl mb-2">📭</p><p className="text-gray-500">No bookings yet.</p></div>
              ) : (
                <div className="space-y-3">
                  {bookings.map(b => (
                    <BookingCard key={b.id} booking={b} actorRole="expert" showActions onStatusChange={handleStatusChange} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ASYNC Q'S ── */}
          {section === 'async' && (
            <div className="max-w-4xl">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Async Q's</h1>
              <p className="text-gray-500 mb-6">Answer client questions — AI draft pre-loaded to help you respond faster</p>
              {loadingA ? (
                <div className="text-center py-12 text-gray-400">Loading…</div>
              ) : asyncQs.length === 0 ? (
                <div className="card p-12 text-center">
                  <p className="text-3xl mb-2">✉</p>
                  <p className="text-gray-500">No async questions yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {asyncQs.map(q => (
                    <div key={q.id} className="card p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900">{q.business_name || 'Client'}</p>
                            <SlaCountdown createdAt={q.created_at} slaHours={q.sla_hours} status={q.status} />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(q.created_at).toLocaleString('en-DE')} · SLA: {q.sla_hours}h · €{q.price}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${q.status === 'answered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {q.status === 'answered' ? '✅ Answered' : '⏳ Pending'}
                        </span>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Client's question:</p>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{q.question}</p>
                      </div>

                      {q.status === 'answered' && q.answer && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                          <p className="text-xs font-semibold text-green-700 mb-1">✅ Your answer:</p>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{q.answer}</p>
                        </div>
                      )}

                      {q.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                            className="btn-primary text-sm"
                          >
                            {expandedQ === q.id ? '▲ Close editor' : '✏ Write Answer (AI Draft available)'}
                          </button>
                          {expandedQ === q.id && (
                            <AIDraftEditor q={q} onSubmit={onAsyncAnswered} />
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {section === 'profile' && (
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                  <p className="text-gray-500">Manage your bio, expertise, and credibility info</p>
                </div>
                <button onClick={() => setEditMode(!editMode)} className="btn-secondary text-sm">
                  {editMode ? 'Cancel' : 'Edit profile'}
                </button>
              </div>

              <div className="card p-6">
                {editMode ? (
                  <div className="space-y-4">
                    <div><label className="label">Bio</label><textarea className="input" rows={5} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} /></div>
                    <div><label className="label">Location</label><input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
                    <div><label className="label">Hourly rate (€)</label><input type="number" className="input" value={form.hourly_rate} onChange={e => setForm(f => ({ ...f, hourly_rate: e.target.value }))} /></div>
                    <div><label className="label">Expertise tags (comma-separated)</label><input className="input" value={form.expertise_tags} onChange={e => setForm(f => ({ ...f, expertise_tags: e.target.value }))} /></div>
                    <button onClick={saveProfile} className="btn-primary w-full" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">{user?.name?.charAt(0)}</span>
                        </div>
                        {profile?.verified && (
                          <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white" title="Verified">✓</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
                        <p className="text-gray-500 text-sm">📍 {profile?.location || '–'}</p>
                        {profile?.verified && <span className="text-xs text-blue-600 font-medium">✓ Verified Expert</span>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{profile?.bio || 'No bio yet.'}</p>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Expertise</p>
                      <div className="flex flex-wrap gap-1.5">{(profile?.expertise_tags || []).map(t => <span key={t} className="badge-blue">{t}</span>)}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-sm">
                      {[
                        ['Rate', `€${profile?.hourly_rate}/hr`],
                        ['Rating', `⭐ ${profile?.rating || '–'} (${profile?.reviews_count || 0})`],
                        ['Publications', profile?.publications || 0],
                        ['Industry Projects', profile?.industry_projects || 0],
                        ['Success Rate', profile?.success_rate > 0 ? `${profile.success_rate}%` : '–'],
                        ['Avg Response', `⚡ ${profile?.avg_response_time || '–'}`],
                      ].map(([l, v]) => (
                        <div key={l}><p className="text-gray-400 text-xs mb-0.5">{l}</p><p className="font-semibold text-gray-900">{v}</p></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── AVAILABILITY ── */}
          {section === 'availability' && (
            <div className="max-w-4xl">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Availability</h1>
              <p className="text-gray-500 mb-6">Click slots to toggle availability. Changes are saved locally (mock).</p>
              <div className="card p-6 mb-5 overflow-x-auto">
                <table className="w-full text-sm min-w-max">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-400 pb-3 pr-4 w-16">Time</th>
                      {DAYS.map(d => <th key={d} className="text-center text-xs font-medium text-gray-700 pb-3 px-2">{d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {HOURS.map(hour => (
                      <tr key={hour}>
                        <td className="text-xs text-gray-400 py-1 pr-4">{hour}</td>
                        {DAYS.map(day => {
                          const key = `${day}-${hour}`;
                          const on  = avail[key];
                          return (
                            <td key={day} className="px-1 py-1">
                              <button
                                onClick={() => setAvail(a => ({ ...a, [key]: !a[key] }))}
                                className={`w-full h-8 rounded transition-colors text-xs font-medium ${on ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-gray-100 text-gray-300 hover:bg-gray-200'}`}
                              >
                                {on ? '✓' : ''}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Pricing Tiers</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Hourly rate</p>
                    <p className="text-xl font-bold text-primary-600">€{profile?.hourly_rate || 0}<span className="text-sm font-normal text-gray-400">/hr</span></p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Half-day (4h)</p>
                    <p className="text-xl font-bold text-primary-600">€{((profile?.hourly_rate || 0) * 3.5).toFixed(0)}<span className="text-sm font-normal text-gray-400"> est.</span></p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Edit your rate in Profile settings.</p>
              </div>
            </div>
          )}

          {/* ── LABS ── */}
          {section === 'labs' && (
            <div className="max-w-3xl">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Labs</h1>
              <p className="text-gray-500 mb-6">Affiliated labs and related bookings</p>
              <div className="card p-8 text-center mb-4">
                <p className="text-4xl mb-3">🔬</p>
                <p className="text-gray-600 mb-4">No lab affiliations yet. Contact your lab administrator to link your account.</p>
                <a href="mailto:support@adventiq.com" className="btn-secondary text-sm">Contact support</a>
              </div>
              <div className="card p-5 bg-blue-50 border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-1">Pro tip</h3>
                <p className="text-sm text-blue-700">Experts affiliated with university labs can offer bundled packages combining consulting + lab access — a highly valued offering on AdventIQ.</p>
              </div>
            </div>
          )}

          {/* ── EARNINGS ── */}
          {section === 'earnings' && (
            <div className="max-w-4xl">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Earnings</h1>
              <p className="text-gray-500 mb-6">Mock Stripe payout history</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Total earned',    value: `€${(earnings + mockTotal).toFixed(2)}`, icon: '💶', c: 'text-green-600' },
                  { label: 'This month',      value: `€${MONTHLY_EARNINGS[MONTHLY_EARNINGS.length - 1].amount}`, icon: '📅', c: 'text-primary-600' },
                  { label: 'Avg per session', value: `€${MOCK_PAYOUTS.length > 0 ? (mockTotal / MOCK_PAYOUTS.length).toFixed(0) : 0}`, icon: '📊', c: 'text-purple-600' },
                ].map(s => (
                  <div key={s.label} className="card p-5 text-center">
                    <span className="text-2xl">{s.icon}</span>
                    <p className={`text-2xl font-bold mt-1 ${s.c}`}>{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Monthly bar chart */}
              <div className="card p-6 mb-5">
                <h3 className="font-semibold text-gray-900 mb-4">Monthly Earnings</h3>
                <div className="flex items-end gap-2 h-40">
                  {MONTHLY_EARNINGS.map((m, i) => {
                    const isLast = i === MONTHLY_EARNINGS.length - 1;
                    const h = Math.round((m.amount / maxBar) * 100);
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-gray-600">€{m.amount}</span>
                        <div className="w-full flex items-end" style={{ height: 96 }}>
                          <div
                            className={`w-full rounded-t transition-all ${isLast ? 'bg-primary-300' : 'bg-primary-500'}`}
                            style={{ height: `${h}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payout table */}
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Payout History</h3>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Mock — no real charges</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {MOCK_PAYOUTS.map(p => (
                    <div key={p.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.type} — {p.client}</p>
                        <p className="text-xs text-gray-400">{p.date} · {p.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">+€{p.amount.toFixed(2)}</p>
                        <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">✓ Paid</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
