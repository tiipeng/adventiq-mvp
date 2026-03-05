import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { asyncApi, bookingsApi, expertsApi, labsApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MOCK_ASYNC, MOCK_BOOKINGS, MOCK_EXPERTS, MOCK_LABS } from '../utils/mockData';
import { getExpertImage } from '../utils/imageAssets';
import SmartImage from '../components/ui/SmartImage';

const STATUS_PROGRESS = {
  pending: 24,
  confirmed: 68,
  completed: 100,
  answered: 100,
  rejected: 0,
  cancelled: 0,
};

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-DE', { day: '2-digit', month: 'short' });
}

function getNextLabDate(lab) {
  const dates = Object.keys(lab.availability_json || {})
    .filter((d) => (lab.availability_json || {})[d])
    .sort();
  if (!dates.length) return null;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return dates.find((d) => d >= todayStr) || dates[0];
}

function MetricCard({ label, value, hint }) {
  return (
    <div className="metric-tile p-4">
      <p className="text-xs uppercase tracking-[0.09em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">{hint}</p>
    </div>
  );
}

function PipelineCard({ item }) {
  const progress = STATUS_PROGRESS[item.status] ?? 40;
  return (
    <div className="feature-block">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base">{item.title}</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Assigned expert: {item.expert}</p>
          <p className="text-xs text-[var(--text-muted)]">Lab booked: {item.lab}</p>
        </div>
        <span className={item.status === 'completed' ? 'badge-green' : item.status === 'confirmed' ? 'badge-blue' : 'badge-yellow'}>{item.status}</span>
      </div>
      <div className="mb-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="progress-track mb-3"><span className="progress-fill" style={{ width: `${progress}%` }} /></div>
      <div className="flex justify-end">
        <Link to={item.link} className="btn-secondary h-8 px-3 text-xs">Open</Link>
      </div>
    </div>
  );
}

function ExpertCard({ expert }) {
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-3">
        <SmartImage
          src={getExpertImage(expert)}
          alt={`${expert.name} profile`}
          fallbackLabel="Expert Profile"
          className="h-10 w-10 rounded-xl object-cover shadow-[var(--shadow-1)] ring-1 ring-[var(--border-strong)]"
          loading="lazy"
          decoding="async"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{expert.name}</p>
          <p className="truncate text-xs text-[var(--text-muted)]">{(expert.expertise_tags || []).slice(0, 2).join(' · ') || 'Generalist'}</p>
        </div>
      </div>
      <p className="mb-3 text-xs text-[var(--text-secondary)]">Response time: {expert.avg_response_time || 'n/a'}</p>
      <Link to={`/book/expert/${expert.id}`} className="btn-primary h-8 w-full px-3 text-xs">Book Expert</Link>
    </div>
  );
}

export default function BusinessDashboard() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [asyncQs, setAsyncQs] = useState([]);
  const [experts, setExperts] = useState([]);
  const [labs, setLabs] = useState([]);

  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    bookingsApi.list()
      .then((response) => {
        const list = response?.data ?? MOCK_BOOKINGS;
        setBookings(Array.isArray(list) ? list : MOCK_BOOKINGS);
      })
      .catch(() => setBookings(MOCK_BOOKINGS))
      .finally(() => setLoadingBookings(false));

    asyncApi.list()
      .then((response) => {
        const list = response?.data ?? MOCK_ASYNC;
        setAsyncQs(Array.isArray(list) ? list : MOCK_ASYNC);
      })
      .catch(() => setAsyncQs(MOCK_ASYNC));

    Promise.allSettled([expertsApi.list(), labsApi.list()])
      .then(([expertsResult, labsResult]) => {
        const expertsList = expertsResult.status === 'fulfilled' ? expertsResult.value?.data : MOCK_EXPERTS;
        const labsList = labsResult.status === 'fulfilled' ? labsResult.value?.data : MOCK_LABS;
        setExperts(Array.isArray(expertsList) ? expertsList : MOCK_EXPERTS);
        setLabs(Array.isArray(labsList) ? labsList : MOCK_LABS);
      })
      .catch(() => {
        setExperts(MOCK_EXPERTS);
        setLabs(MOCK_LABS);
      })
      .finally(() => setLoadingData(false));
  }, []);

  const metrics = useMemo(() => {
    const activeResearch = bookings.filter((b) => ['pending', 'confirmed'].includes(b.status)).length + asyncQs.filter((a) => a.status !== 'answered').length;
    const expertsEngaged = new Set(bookings.filter((b) => b.provider_type === 'expert').map((b) => b.provider_id)).size;
    const labsBooked = bookings.filter((b) => b.provider_type === 'lab').length;
    const reportsDelivered = bookings.filter((b) => b.status === 'completed').length + asyncQs.filter((a) => a.status === 'answered').length;

    return { activeResearch, expertsEngaged, labsBooked, reportsDelivered };
  }, [bookings, asyncQs]);

  const recommendedExperts = useMemo(() => {
    return [...experts]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
  }, [experts]);

  const pipelineItems = useMemo(() => {
    const fallbackLab = labs[0]?.name || 'Not assigned';
    const fallbackExpert = experts[0]?.name || 'TBD';

    return bookings.slice(0, 5).map((booking) => {
      const title = booking.problem_description?.slice(0, 72) || `Research Workstream #${booking.id}`;
      return {
        id: booking.id,
        title,
        expert: booking.provider_type === 'expert' ? booking.provider_name : fallbackExpert,
        lab: booking.provider_type === 'lab' ? booking.provider_name : fallbackLab,
        status: booking.status,
        link: booking.status === 'completed' ? `/reports/${booking.id}` : '/booking',
      };
    });
  }, [bookings, labs, experts]);

  const upcomingLabs = useMemo(() => {
    return labs
      .map((lab) => ({ ...lab, nextDate: getNextLabDate(lab) }))
      .filter((lab) => Boolean(lab.nextDate))
      .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
      .slice(0, 5);
  }, [labs]);

  const weekPreview = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(start);
      d.setDate(start.getDate() + idx);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const count = labs.reduce((sum, lab) => sum + ((lab.availability_json || {})[key] ? 1 : 0), 0);
      return { key, label: d.toLocaleDateString('en-DE', { weekday: 'short' }), day: d.getDate(), count };
    });
  }, [labs]);

  const activityFeed = useMemo(() => {
    const bookingEvents = bookings.slice(0, 8).map((booking) => ({
      id: `booking-${booking.id}`,
      type: booking.status === 'completed' ? 'report delivered' : booking.status === 'confirmed' ? 'lab booking confirmed' : 'booking updated',
      detail: `${booking.provider_name || 'Provider'} · ${booking.status}`,
      date: booking.slot_start || new Date().toISOString(),
    }));

    const asyncEvents = asyncQs.slice(0, 6).map((item) => ({
      id: `async-${item.id}`,
      type: item.status === 'answered' ? 'consult completed' : 'consult in progress',
      detail: `${item.expert_name || 'Expert'} · SLA ${item.sla_hours}h`,
      date: item.created_at || new Date().toISOString(),
    }));

    return [...bookingEvents, ...asyncEvents]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  }, [bookings, asyncQs]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Navbar />

        <main className="container-app py-8">
          <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker mb-2">Research operations</p>
              <h1 className="mb-2">Research Command Center</h1>
              <p className="max-w-2xl text-[var(--text-muted)]">Overview of expert engagements, lab access, and research pipelines.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/experts" className="btn-secondary">Find Expert</Link>
              <Link to="/labs" className="btn-secondary">Book Lab</Link>
              <Link to="/ai-recommend" className="btn-primary">Start Consult</Link>
            </div>
          </section>

          <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Active Research Projects" value={metrics.activeResearch} hint="Live engagements in pipeline" />
            <MetricCard label="Experts Engaged" value={metrics.expertsEngaged} hint="Distinct specialist contributors" />
            <MetricCard label="Labs Booked" value={metrics.labsBooked} hint="Facility reservations in system" />
            <MetricCard label="Reports Delivered" value={metrics.reportsDelivered} hint="Completed outputs across workstreams" />
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
            <div className="space-y-4">
              <div className="glass-panel p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg">Active Research Pipeline</h2>
                  <Link to="/booking" className="text-xs text-[var(--accent-alt)] hover:text-[var(--text-primary)]">Manage all</Link>
                </div>
                {loadingBookings ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {[1, 2, 3, 4].map((item) => <div key={item} className="h-36 skeleton" />)}
                  </div>
                ) : pipelineItems.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">No active projects yet.</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {pipelineItems.map((item) => <PipelineCard key={item.id} item={item} />)}
                  </div>
                )}
              </div>

              <div className="glass-panel p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg">Expert Matches</h2>
                  <Link to="/experts" className="text-xs text-[var(--accent-alt)] hover:text-[var(--text-primary)]">View directory</Link>
                </div>

                {loadingData ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 skeleton" />)}
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {recommendedExperts.map((expert) => <ExpertCard key={expert.id} expert={expert} />)}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-panel p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg">Lab Availability</h2>
                  <Link to="/labs/calendar" className="text-xs text-[var(--accent-alt)] hover:text-[var(--text-primary)]">Open calendar</Link>
                </div>

                <div className="mb-4 grid grid-cols-7 gap-1.5">
                  {weekPreview.map((day) => (
                    <div key={day.key} className="rounded-lg border border-[var(--border)] bg-[rgba(17,28,46,0.78)] p-2 text-center">
                      <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">{day.label}</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{day.day}</p>
                      <p className="text-[10px] text-[var(--text-secondary)]">{day.count} labs</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {upcomingLabs.map((lab) => (
                    <div key={lab.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[rgba(14,24,40,0.74)] px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">{lab.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">Next slot: {formatDate(lab.nextDate)}</p>
                      </div>
                      <Link to={`/book/lab/${lab.id}`} className="btn-secondary h-8 px-3 text-xs">Book</Link>
                    </div>
                  ))}
                  {!upcomingLabs.length ? <p className="text-sm text-[var(--text-muted)]">No upcoming slots available.</p> : null}
                </div>
              </div>

              <div className="glass-panel p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg">Activity Feed</h2>
                  <span className="badge-blue">Live</span>
                </div>

                <div className="space-y-2">
                  {activityFeed.map((event) => (
                    <div key={event.id} className="rounded-xl border border-[var(--border)] bg-[rgba(16,27,45,0.72)] p-3">
                      <p className="text-sm font-medium capitalize text-[var(--text-primary)]">{event.type}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{event.detail}</p>
                      <p className="mt-1 text-[11px] text-[var(--text-muted)]">{formatDate(event.date)}</p>
                    </div>
                  ))}
                  {!activityFeed.length ? <p className="text-sm text-[var(--text-muted)]">No recent activity.</p> : null}
                </div>
              </div>
            </div>
          </section>

          <p className="mt-6 text-xs text-[var(--text-muted)]">Signed in as {user?.name || 'Business User'}.</p>
        </main>
      </div>
    </div>
  );
}
