import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function ProfileNotifications() {
  const [prefs, setPrefs] = useState({
    bookingUpdates: true,
    paymentReceipts: true,
    reportsReady: true,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);

  function toggle(key) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    if (saved) setSaved(false);
  }

  function save() {
    localStorage.setItem('notification_prefs', JSON.stringify(prefs));
    setSaved(true);
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar />

        <main className="container-app py-8 max-w-3xl">
          <h1 className="mb-2">Notifications</h1>
          <p className="text-[var(--text-muted)] mb-6">Choose which updates you want to receive.</p>

          <div className="card p-5 space-y-3">
            {saved ? <p className="text-sm text-green-700">Notification preferences saved.</p> : null}
            {[
              ['bookingUpdates', 'Booking status updates'],
              ['paymentReceipts', 'Payment receipts'],
              ['reportsReady', 'Report availability'],
              ['marketing', 'Product updates'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between border border-[var(--border)] rounded-[10px] px-3 py-2">
                <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                <input type="checkbox" checked={prefs[key]} onChange={() => toggle(key)} />
              </label>
            ))}
            <button type="button" className="btn-primary" onClick={save}>Save Preferences</button>
          </div>
        </main>
      </div>
    </div>
  );
}
