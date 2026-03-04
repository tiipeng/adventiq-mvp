import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { bookingsApi } from '../utils/api';

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
      });
  }, []);

  const filtered = useMemo(() => {
    if (!bookingId) return rows;
    return rows.filter((r) => String(r.id) === String(bookingId));
  }, [rows, bookingId]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar />
        <div className="container-app py-8">
          <h1 className="mb-2">Reports</h1>
          <p className="text-[var(--text-muted)] mb-6">Date / Expert / Topic / Status / Actions</p>

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
                {(filtered ?? []).map((row) => (
                  <tr key={row.id}>
                    <td>{row.date ? new Date(row.date).toLocaleDateString() : '-'}</td>
                    <td>{row.expert}</td>
                    <td>{row.topic}</td>
                    <td><span className="badge-blue">{row.status}</span></td>
                    <td>
                      <button className="btn-secondary text-xs">View</button>
                    </td>
                  </tr>
                ))}
                {(filtered ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-[var(--text-muted)]">No reports yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Link to="/dashboard/business" className="btn-secondary">Back</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
