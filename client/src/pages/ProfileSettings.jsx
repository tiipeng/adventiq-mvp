import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    company: '',
    timezone: 'Europe/Berlin',
    locale: 'en',
  });
  const [saved, setSaved] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (saved) setSaved(false);
  }

  function onSubmit(e) {
    e.preventDefault();
    localStorage.setItem('profile_settings', JSON.stringify(form));
    setSaved(true);
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar />

        <main className="container-app py-8 max-w-3xl">
          <h1 className="mb-2">Profile Settings</h1>
          <p className="text-[var(--text-muted)] mb-6">Update your account profile details.</p>

          <form onSubmit={onSubmit} className="card p-5 space-y-3">
            {saved ? <p className="text-sm text-green-700">Settings saved.</p> : null}
            <div>
              <label className="label">Display name</label>
              <input className="input" name="name" value={form.name} onChange={onChange} required />
            </div>
            <div>
              <label className="label">Company</label>
              <input className="input" name="company" value={form.company} onChange={onChange} placeholder="Your organization" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Timezone</label>
                <select className="input" name="timezone" value={form.timezone} onChange={onChange}>
                  <option value="Europe/Berlin">Europe/Berlin</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                </select>
              </div>
              <div>
                <label className="label">Language</label>
                <select className="input" name="locale" value={form.locale} onChange={onChange}>
                  <option value="en">English</option>
                  <option value="de">German</option>
                  <option value="vi">Vietnamese</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary">Save Settings</button>
          </form>
        </main>
      </div>
    </div>
  );
}
