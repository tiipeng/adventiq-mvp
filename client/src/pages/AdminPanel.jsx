import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { adminApi } from '../utils/api';
import { MOCK_BOOKINGS, MOCK_USERS } from '../utils/mockData';

const statusBadge = {
  approved: 'badge-green',
  pending:  'badge-yellow',
  rejected: 'badge-red',
};

const bookingStatusBadge = {
  pending:   'badge-yellow',
  confirmed: 'badge-blue',
  completed: 'badge-green',
  rejected:  'badge-red',
  cancelled: 'badge-gray',
};

function fmtDate(str) {
  if (!str) return '–';
  return new Date(str).toLocaleDateString('en-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminPanel() {
  const [tab, setTab]         = useState('overview');
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      adminApi.stats(),
      adminApi.users(),
      adminApi.bookings(),
    ]).then(([s, u, b]) => {
      const users = u?.data ?? MOCK_USERS;
      const bookings = b?.data ?? MOCK_BOOKINGS;
      const fallbackStats = {
        users: {
          total: (users ?? []).length,
          pending: (users ?? []).filter((x) => x.status === 'pending').length,
          business: (users ?? []).filter((x) => x.role === 'business').length,
          expert: (users ?? []).filter((x) => x.role === 'expert').length,
          lab: (users ?? []).filter((x) => x.role === 'lab').length,
        },
        bookings: {
          total: (bookings ?? []).length,
          pending: (bookings ?? []).filter((x) => x.status === 'pending').length,
          completed: (bookings ?? []).filter((x) => x.status === 'completed').length,
        },
        revenue: {
          total: (bookings ?? []).reduce((sum, x) => sum + (x.total_price || 0), 0),
        },
      };

      setStats(typeof s?.data === 'object' && s.data !== null && !Array.isArray(s.data) ? s.data : fallbackStats);
      setUsers(Array.isArray(users) ? users : MOCK_USERS);
      setBookings(Array.isArray(bookings) ? bookings : MOCK_BOOKINGS);
    }).catch(() => {
      setStats({
        users: {
          total: MOCK_USERS.length,
          pending: MOCK_USERS.filter((x) => x.status === 'pending').length,
          business: MOCK_USERS.filter((x) => x.role === 'business').length,
          expert: MOCK_USERS.filter((x) => x.role === 'expert').length,
          lab: MOCK_USERS.filter((x) => x.role === 'lab').length,
        },
        bookings: {
          total: MOCK_BOOKINGS.length,
          pending: MOCK_BOOKINGS.filter((x) => x.status === 'pending').length,
          completed: MOCK_BOOKINGS.filter((x) => x.status === 'completed').length,
        },
        revenue: {
          total: MOCK_BOOKINGS.reduce((sum, x) => sum + (x.total_price || 0), 0),
        },
      });
      setUsers(MOCK_USERS);
      setBookings(MOCK_BOOKINGS);
    }).finally(() => setLoading(false));
  }, []);

  async function updateUserStatus(userId, status) {
    try {
      await adminApi.updateUserStatus(userId, status);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed');
    }
  }

  async function deleteUser(userId) {
    if (!window.confirm('Delete this user and all their data?')) return;
    try {
      await adminApi.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed');
    }
  }

  const filteredUsers = userFilter === 'all' ? users : users.filter(u => u.role === userFilter || u.status === userFilter);

  return (
    <div className="flex min-h-screen bg-[var(--bg-subtle)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Panel</h1>
            <p className="text-[var(--text-muted)] mt-1">Manage users, approvals, and platform data</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-[var(--bg-subtle)] p-1 rounded-xl w-fit">
            {['overview', 'users', 'bookings'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white shadow text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
              >
                {t}
                {t === 'users' && stats?.users?.pending > 0 && (
                  <span className="ml-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">{stats.users.pending}</span>
                )}
              </button>
            ))}
          </div>

          {loading && <div className="text-center py-12 text-[var(--text-muted)]">Loading…</div>}

          {/* Overview */}
          {!loading && tab === 'overview' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total users',      value: stats.users.total,     icon: '👥', sub: `${stats.users.pending} pending` },
                  { label: 'Business',         value: stats.users.business,  icon: '🏢', sub: 'accounts' },
                  { label: 'Experts',          value: stats.users.expert,    icon: '👤', sub: 'registered' },
                  { label: 'Labs',             value: stats.users.lab,       icon: '🔬', sub: 'registered' },
                  { label: 'Total bookings',   value: stats.bookings.total,  icon: '📋', sub: 'all time' },
                  { label: 'Pending bookings', value: stats.bookings.pending,icon: '⏳', sub: 'awaiting action' },
                  { label: 'Completed',        value: stats.bookings.completed,icon:'✅', sub: 'bookings' },
                  { label: 'Platform revenue', value: `€${stats.revenue.total}`, icon: '💶', sub: 'confirmed+completed' },
                ].map(s => (
                  <div key={s.label} className="card p-5">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{s.value}</p>
                    <p className="text-sm text-[var(--text-muted)]">{s.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Pending approvals */}
              {users.filter(u => u.status === 'pending').length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">⏳ Pending Approvals</h2>
                  <div className="space-y-3">
                    {users.filter(u => u.status === 'pending').map(u => (
                      <div key={u.id} className="card p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-semibold text-primary-700">{u.name.charAt(0)}</div>
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">{u.name}</p>
                            <p className="text-sm text-[var(--text-muted)]">{u.email} · <span className="capitalize">{u.role}</span></p>
                            {u.profile && (
                              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                {u.role === 'expert' ? `${u.profile.location} · €${u.profile.hourly_rate}/hr` : `${u.profile.location} · €${u.profile.price_per_day}/day`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => updateUserStatus(u.id, 'approved')} className="btn-primary text-xs">✓ Approve</button>
                          <button onClick={() => updateUserStatus(u.id, 'rejected')} className="btn-danger text-xs">✗ Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {!loading && tab === 'users' && (
            <div>
              {/* Filter */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {['all', 'business', 'expert', 'lab', 'pending', 'approved', 'rejected'].map(f => (
                  <button
                    key={f}
                    onClick={() => setUserFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${userFilter === f ? 'bg-primary-600 text-white' : 'bg-white border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'}`}
                  >
                    {f} {f === 'all' ? `(${users.length})` : `(${users.filter(u => u.role === f || u.status === f).length})`}
                  </button>
                ))}
              </div>

              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-subtle)]">
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">User</th>
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Role</th>
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Joined</th>
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-subtle)]">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">{u.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 capitalize text-[var(--text-muted)]">{u.role}</td>
                        <td className="px-4 py-3">
                          <span className={statusBadge[u.status] || 'badge-gray'}>{u.status}</span>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">{fmtDate(u.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {u.status !== 'approved' && (
                              <button onClick={() => updateUserStatus(u.id, 'approved')} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">Approve</button>
                            )}
                            {u.status !== 'rejected' && (
                              <button onClick={() => updateUserStatus(u.id, 'rejected')} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Reject</button>
                            )}
                            <button onClick={() => deleteUser(u.id)} className="text-xs px-2 py-1 bg-[var(--bg-subtle)] text-[var(--text-muted)] rounded hover:bg-[var(--border)]">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="p-8 text-center text-[var(--text-muted)]">No users found.</div>
                )}
              </div>
            </div>
          )}

          {/* Bookings */}
          {!loading && tab === 'bookings' && (
            <div>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-subtle)]">
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">#</th>
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Business</th>
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Provider</th>
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Type</th>
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-subtle)]">
                        <td className="px-4 py-3 text-[var(--text-muted)]">#{b.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--text-primary)]">{b.business_name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{b.business_email}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-[var(--text-muted)]">{b.provider_name || '–'}</td>
                        <td className="px-4 py-3 capitalize">
                          <span className={b.provider_type === 'expert' ? 'badge-blue' : 'badge-green'}>{b.provider_type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={bookingStatusBadge[b.status] || 'badge-gray'}>{b.status}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">€{b.total_price}</td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">{fmtDate(b.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bookings.length === 0 && (
                  <div className="p-8 text-center text-[var(--text-muted)]">No bookings yet.</div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
