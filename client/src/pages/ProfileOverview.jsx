import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const ITEMS = [
  { to: '/profile/settings', title: 'Settings', desc: 'Update account details and preferences.' },
  { to: '/profile/security', title: 'Security', desc: 'Password, sessions, and login protection.' },
  { to: '/profile/notifications', title: 'Notifications', desc: 'Control email and in-app updates.' },
];

export default function ProfileOverview() {
  const { user, profile } = useAuth();
  const storageKey = 'profile_overview_inline';
  const initialSaved = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      return {};
    }
  }, []);
  const [editing, setEditing] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [form, setForm] = useState({
    displayName: initialSaved.displayName || user?.name || '',
    company: initialSaved.company || '',
    timezone: initialSaved.timezone || 'Europe/Berlin',
  });

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (savedMsg) setSavedMsg('');
  }

  function saveInline() {
    localStorage.setItem(storageKey, JSON.stringify(form));
    setEditing(false);
    setSavedMsg('Profile details saved.');
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar />

        <main className="container-app py-8">
          <h1 className="mb-2">Profile</h1>
          <p className="text-[var(--text-muted)] mb-6">Manage your account and workspace preferences.</p>

          <div className="card p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[var(--text-primary)] font-semibold">Account Details</p>
              {!editing ? (
                <button type="button" className="btn-secondary text-xs" onClick={() => setEditing(true)}>Edit inline</button>
              ) : (
                <div className="flex gap-2">
                  <button type="button" className="btn-secondary text-xs" onClick={() => setEditing(false)}>Cancel</button>
                  <button type="button" className="btn-primary text-xs" onClick={saveInline}>Save</button>
                </div>
              )}
            </div>
            {savedMsg ? <p className="text-sm text-[var(--success)] mb-2">{savedMsg}</p> : null}
            <p className="text-sm text-[var(--text-muted)]">Name</p>
            {editing ? (
              <input className="input mb-3" name="displayName" value={form.displayName} onChange={onChange} />
            ) : (
              <p className="text-[var(--text-primary)] font-medium mb-3">{form.displayName || user?.name || '-'}</p>
            )}
            <p className="text-sm text-[var(--text-muted)]">Email</p>
            <p className="text-[var(--text-primary)] font-medium mb-3">{user?.email || '-'}</p>
            <p className="text-sm text-[var(--text-muted)]">Role</p>
            <p className="text-[var(--text-primary)] font-medium capitalize">{user?.role || '-'}</p>
            {editing ? (
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="label">Company</label>
                  <input className="input" name="company" value={form.company} onChange={onChange} placeholder="Your organization" />
                </div>
                <div>
                  <label className="label">Timezone</label>
                  <select className="input" name="timezone" value={form.timezone} onChange={onChange}>
                    <option value="Europe/Berlin">Europe/Berlin</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="mt-2 space-y-1">
                {form.company ? <p className="text-sm text-[var(--text-muted)]">Company: {form.company}</p> : null}
                <p className="text-sm text-[var(--text-muted)]">Timezone: {form.timezone}</p>
                {profile?.location ? <p className="text-sm text-[var(--text-muted)]">Location: {profile.location}</p> : null}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {ITEMS.map((item) => (
              <Link key={item.to} to={item.to} className="card p-5 hover:border-[var(--accent)] transition-colors">
                <h3 className="mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
