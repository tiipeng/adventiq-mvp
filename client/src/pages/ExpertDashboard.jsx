import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BookingCard from '../components/BookingCard';
import { bookingsApi, expertsApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ExpertDashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({ bio: '', location: '', hourly_rate: '', expertise_tags: '' });

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

  useEffect(() => {
    bookingsApi.list().then(r => setBookings(r.data)).catch(console.error).finally(() => setLoading(false));
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
      await expertsApi.update(profile.id, {
        bio: form.bio,
        location: form.location,
        hourly_rate: parseFloat(form.hourly_rate) || 0,
        expertise_tags: form.expertise_tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      await refreshProfile();
      setEditMode(false);
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const pending   = bookings.filter(b => b.status === 'pending').length;
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const earnings  = bookings.filter(b => ['confirmed','completed'].includes(b.status)).reduce((s,b) => s+(b.total_price||0), 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 max-w-5xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Expert Dashboard</h1>
            <p className="text-gray-500 mt-1">{user?.name} · {profile?.location || 'Location not set'}</p>
          </div>

          {user?.status === 'pending' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 font-medium">⏳ Account pending approval</p>
              <p className="text-yellow-700 text-sm mt-1">An admin will review your profile and activate your account shortly. You'll be notified by email.</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'New requests', value: pending,   icon: '📬', color: 'yellow' },
              { label: 'Confirmed',    value: confirmed,  icon: '✅', color: 'green' },
              { label: 'Completed',    value: completed,  icon: '🎯', color: 'blue' },
              { label: 'Earnings',     value: `€${earnings}`, icon: '💶', color: 'purple' },
            ].map(s => (
              <div key={s.label} className="card p-5 flex items-center gap-4">
                <div className="text-2xl">{s.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile card */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">My Profile</h2>
                <button onClick={() => setEditMode(!editMode)} className="text-sm text-primary-600 hover:underline">
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="label">Bio</label>
                    <textarea className="input" rows={4} value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} />
                  </div>
                  <div>
                    <label className="label">Location</label>
                    <input className="input" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} />
                  </div>
                  <div>
                    <label className="label">Hourly rate (€)</label>
                    <input type="number" className="input" value={form.hourly_rate} onChange={e => setForm(f => ({...f, hourly_rate: e.target.value}))} />
                  </div>
                  <div>
                    <label className="label">Expertise tags</label>
                    <input className="input" value={form.expertise_tags} onChange={e => setForm(f => ({...f, expertise_tags: e.target.value}))} placeholder="ML, Python, NLP" />
                  </div>
                  <button onClick={saveProfile} className="btn-primary w-full" disabled={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">{user?.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">📍 {profile?.location || '–'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{profile?.bio || 'No bio yet.'}</p>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Expertise</p>
                    <div className="flex flex-wrap gap-1">
                      {(profile?.expertise_tags || []).map(t => <span key={t} className="badge-blue">{t}</span>)}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex justify-between text-sm">
                    <span className="text-gray-500">Rate</span>
                    <span className="font-semibold text-primary-600">€{profile?.hourly_rate}/hr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rating</span>
                    <span className="font-semibold">⭐ {profile?.rating || 'No reviews'} ({profile?.reviews_count || 0})</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bookings */}
            <div className="lg:col-span-2">
              <h2 className="font-semibold text-gray-900 mb-4">Booking Requests</h2>
              {loading ? (
                <div className="text-center py-12 text-gray-400">Loading…</div>
              ) : bookings.length === 0 ? (
                <div className="card p-10 text-center">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-gray-500">No bookings yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map(b => (
                    <BookingCard key={b.id} booking={b} actorRole="expert" showActions onStatusChange={handleStatusChange} />
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
