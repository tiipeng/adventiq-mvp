import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { bookingsApi } from '../utils/api';

const REPORT_VIEWS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

function readLocalBookings() {
  const items = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith('booking_')) {
      const data = JSON.parse(localStorage.getItem(key) ?? 'null');
      if (data) items.push(data);
    }
  }
  return items;
}

export default function Reports() {
  const { bookingId } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    bookingsApi.list()
      .then((response) => {
        const bookings = response?.data ?? [];
        const serverRows = (bookings ?? []).map((b) => ({
          id: b.id,
          date: b.slot_start ?? b.created_at,
          expert: b.provider_name ?? `Provider #${b.provider_id}`,
          topic: b.problem_description ?? 'Consultation',
          status: b.status ?? 'pending',
        }));
        const localRows = readLocalBookings().map((b) => ({
          id: b.id,
          date: b.createdAt,
          expert: b.provider?.name,
          topic: b.problem ?? 'Consultation booking',
          status: b.status ?? 'confirmed',
        }));

        setRows([...localRows, ...serverRows]);
      })
      .catch(() => {
        setRows(readLocalBookings().map((b) => ({
          id: b.id,
          date: b.createdAt,
          expert: b.provider?.name,
          topic: b.problem ?? 'Consultation booking',
          status: b.status ?? 'confirmed',
        })));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = rows;
    if (bookingId) list = list.filter((r) => String(r.id) === String(bookingId));
    if (view !== 'All') list = list.filter((r) => String(r.status).toLowerCase() === view.toLowerCase());
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((r) =>
        String(r.id).toLowerCase().includes(q) ||
        String(r.expert || '').toLowerCase().includes(q) ||
        String(r.topic || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [rows, bookingId, view, query]);

  const counts = useMemo(() => {
    return {
      all: rows.length,
      pending: rows.filter((r) => String(r.status).toLowerCase() === 'pending').length,
      confirmed: rows.filter((r) => String(r.status).toLowerCase() === 'confirmed').length,
      completed: rows.filter((r) => String(r.status).toLowerCase() === 'completed').length,
      cancelled: rows.filter((r) => String(r.status).toLowerCase() === 'cancelled').length,
    };
  }, [rows]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar />
        <div className="container-app py-8">
          <h1 className="mb-2">Reports</h1>
          <p className="text-[var(--text-muted)] mb-4">Date / Expert / Topic / Status / Actions</p>

          <div className="workspace-header mb-4 rounded-[12px] p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="tabs-underline border-none">
                {REPORT_VIEWS.map((item) => (
                  <button key={item} onClick={() => setView(item)} className={`tab-item ${view === item ? 'active' : ''}`}>
                    {item}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="Search by id, expert, topic..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="button" className="btn-secondary text-sm" onClick={() => { setQuery(''); setView('All'); }}>Reset</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            <div className="card p-3"><p className="text-xs text-[var(--text-muted)]">All</p><p className="text-xl font-semibold">{counts.all}</p></div>
            <div className="card p-3"><p className="text-xs text-[var(--text-muted)]">Pending</p><p className="text-xl font-semibold">{counts.pending}</p></div>
            <div className="card p-3"><p className="text-xs text-[var(--text-muted)]">Confirmed</p><p className="text-xl font-semibold">{counts.confirmed}</p></div>
            <div className="card p-3"><p className="text-xs text-[var(--text-muted)]">Completed</p><p className="text-xl font-semibold">{counts.completed}</p></div>
            <div className="card p-3"><p className="text-xs text-[var(--text-muted)]">Cancelled</p><p className="text-xl font-semibold">{counts.cancelled}</p></div>
          </div>

          <div className="card overflow-hidden">
            <table className="table-clean">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Expert</th>
                  <th>Topic</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <>
                    {[1, 2, 3, 4].map((item) => (
                      <tr key={`s-${item}`}>
                        <td><div className="h-3 skeleton w-24" /></td>
                        <td><div className="h-3 skeleton w-28" /></td>
                        <td><div className="h-3 skeleton w-40" /></td>
                        <td><div className="h-3 skeleton w-20" /></td>
                        <td><div className="h-8 skeleton w-16" /></td>
                      </tr>
                    ))}
                  </>
                )}
                {(filtered ?? []).map((row) => (
                  <tr key={row.id}>
                    <td>{row.date ? new Date(row.date).toLocaleDateString() : '-'}</td>
                    <td>{row.expert}</td>
                    <td>{row.topic}</td>
                    <td><span className="badge-blue">{row.status}</span></td>
                    <td>
                      <Link to={`/reports/${row.id}`} className="btn-secondary text-xs">View</Link>
                    </td>
                  </tr>
                ))}
                {!loading && (filtered ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-[var(--text-muted)]">No reports yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-2">
            <Link to="/booking" className="btn-primary">New Booking</Link>
            <Link to="/dashboard/business" className="btn-secondary">Back</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
