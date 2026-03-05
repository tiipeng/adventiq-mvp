import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function ProfileSecurity() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [message, setMessage] = useState('');

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (message) setMessage('');
  }

  function onSubmit(e) {
    e.preventDefault();
    if (form.next.length < 8) {
      setMessage('New password must be at least 8 characters.');
      return;
    }
    if (form.next !== form.confirm) {
      setMessage('Password confirmation does not match.');
      return;
    }
    setMessage('Password updated (demo).');
    setForm({ current: '', next: '', confirm: '' });
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar />

        <main className="container-app py-8 max-w-3xl">
          <h1 className="mb-2">Security</h1>
          <p className="text-[var(--text-muted)] mb-6">Manage password and active sessions.</p>

          <form onSubmit={onSubmit} className="card p-5 space-y-3 mb-4">
            {message ? <p className="text-sm text-[var(--text-secondary)]">{message}</p> : null}
            <div>
              <label className="label">Current password</label>
              <input type="password" className="input" name="current" value={form.current} onChange={onChange} required />
            </div>
            <div>
              <label className="label">New password</label>
              <input type="password" className="input" name="next" value={form.next} onChange={onChange} required />
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input type="password" className="input" name="confirm" value={form.confirm} onChange={onChange} required />
            </div>
            <button type="submit" className="btn-primary">Update Password</button>
          </form>

          <div className="card p-5">
            <h3 className="mb-2">Active Sessions</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-3">Current device is signed in. Other sessions can be revoked here in a full backend setup.</p>
            <button className="btn-secondary" type="button">Sign Out Other Sessions</button>
          </div>
        </main>
      </div>
    </div>
  );
}
