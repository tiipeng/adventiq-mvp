import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BookingCard from '../components/BookingCard';
import { bookingsApi, labsApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MOCK_BOOKINGS } from '../utils/mockData';

export default function LabDashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({ name: '', description: '', location: '', price_per_day: '', services: '' });
  const [bookingView, setBookingView] = useState('All');
  const [bookingQuery, setBookingQuery] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        description: profile.description || '',
        location: profile.location || '',
        price_per_day: profile.price_per_day || '',
        services: (profile.services_json || []).join(', '),
      });
    }
  }, [profile]);

  useEffect(() => {
    bookingsApi.list()
      .then(response => {
        const bookings = response?.data ?? MOCK_BOOKINGS;
        setBookings(Array.isArray(bookings) ? bookings : MOCK_BOOKINGS);
      })
      .catch(() => setBookings(MOCK_BOOKINGS))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(bookingId, status) {
    try {
      await bookingsApi.updateStatus(bookingId, status);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed');
    }
  }

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    try {
      await labsApi.update(profile.id, {
        name: form.name,
        description: form.description,
        location: form.location,
        price_per_day: parseFloat(form.price_per_day) || 0,
        services_json: form.services.split(',').map(s => s.trim()).filter(Boolean),
      });
      await refreshProfile();
      setEditMode(false);
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const pending  = bookings.filter(b => b.status === 'pending').length;
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const earnings  = bookings.filter(b => ['confirmed','completed'].includes(b.status)).reduce((s,b) => s+(b.total_price||0), 0);
  const bookingViews = ['All', 'Pending', 'Confirmed', 'Completed', 'Rejected'];
  const filteredBookings = bookings.filter((booking) => {
    const matchesView = bookingView === 'All' || String(booking.status).toLowerCase() === bookingView.toLowerCase();
    const q = bookingQuery.trim().toLowerCase();
    const matchesQuery = !q ||
      String(booking.id).toLowerCase().includes(q) ||
      String(booking.business_name || booking.provider_name || '').toLowerCase().includes(q) ||
      String(booking.problem_description || '').toLowerCase().includes(q);
    return matchesView && matchesQuery;
  });

  return (
    <div className="flex min-h-screen bg-[var(--bg-subtle)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 max-w-5xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Lab Dashboard</h1>
            <p className="text-[var(--text-muted)] mt-1">{profile?.name || user?.name} · {profile?.location || 'Location not set'}</p>
          </div>

          {user?.status === 'pending' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 font-medium">⏳ Account pending approval</p>
              <p className="text-yellow-700 text-sm mt-1">An admin will review your lab profile before it appears in listings.</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'New requests', value: pending,   icon: '📬' },
              { label: 'Confirmed',    value: confirmed,  icon: '✅' },
              { label: 'Completed',    value: completed,  icon: '🎯' },
              { label: 'Revenue',      value: `€${earnings}`, icon: '💶' },
            ].map(s => (
              <div key={s.label} className="card p-5 flex items-center gap-4">
                <div className="text-2xl">{s.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{s.value}</p>
                  <p className="text-sm text-[var(--text-muted)]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Lab profile */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[var(--text-primary)]">Lab Profile</h2>
                <button onClick={() => setEditMode(!editMode)} className="text-sm text-primary-600 hover:underline">
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editMode ? (
                <div className="space-y-3">
                  {[
                    { label: 'Lab name', key: 'name', type: 'text' },
                    { label: 'Location', key: 'location', type: 'text' },
                    { label: 'Price per day (€)', key: 'price_per_day', type: 'number' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="label">{f.label}</label>
                      <input type={f.type} className="input" value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} />
                    </div>
                  ))}
                  <div>
                    <label className="label">Description</label>
                    <textarea className="input" rows={3} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
                  </div>
                  <div>
                    <label className="label">Services (comma-separated)</label>
                    <input className="input" value={form.services} onChange={e => setForm(p => ({...p, services: e.target.value}))} />
                  </div>
                  <button onClick={saveProfile} className="btn-primary w-full" disabled={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-2xl">🔬</div>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{profile?.name || user?.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">📍 {profile?.location || '–'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">{profile?.description || 'No description yet.'}</p>
                  <div>
                    <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Services offered</p>
                    <div className="flex flex-wrap gap-1">
                      {(profile?.services_json || []).map(s => <span key={s} className="badge-green">{s}</span>)}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[var(--border)] flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Daily rate</span>
                    <span className="font-semibold text-green-600">€{profile?.price_per_day}/day</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Rating</span>
                    <span className="font-semibold">⭐ {profile?.rating || '–'} ({profile?.reviews_count || 0})</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bookings */}
            <div className="lg:col-span-2">
              <h2 className="font-semibold text-[var(--text-primary)] mb-4">Booking Requests</h2>
              <div className="workspace-header rounded-[12px] p-3 mb-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div className="tabs-underline border-none">
                    {bookingViews.map((item) => (
                      <button key={item} onClick={() => setBookingView(item)} className={`tab-item ${bookingView === item ? 'active' : ''}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                  <input
                    className="input"
                    placeholder="Search bookings..."
                    value={bookingQuery}
                    onChange={(e) => setBookingQuery(e.target.value)}
                  />
                </div>
              </div>
              {loading ? (
                <div className="text-center py-12 text-[var(--text-muted)]">Loading…</div>
              ) : filteredBookings.length === 0 ? (
                <div className="card p-10 text-center">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-[var(--text-muted)]">No bookings match current filters.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map(b => (
                    <BookingCard key={b.id} booking={b} actorRole="lab" showActions onStatusChange={handleStatusChange} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
