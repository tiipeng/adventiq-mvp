import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { labsApi, feasibilityApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MOCK_LABS } from '../utils/mockData';
import { getLabImage } from '../utils/imageAssets';
import SmartImage from '../components/ui/SmartImage';

export default function LabProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [lab, setLab]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Feasibility check state
  const [showFeasibility, setShowFeasibility] = useState(false);
  const [feasForm, setFeasForm] = useState({ description: '', equipment: '', duration: 1 });
  const [feasResult, setFeasResult] = useState(null);
  const [feasLoading, setFeasLoading] = useState(false);

  useEffect(() => {
    labsApi.get(id)
      .then(r => setLab(r?.data && !Array.isArray(r.data) ? r.data : MOCK_LABS.find(l => l.id === Number(id)) ?? null))
      .catch(() => setLab(MOCK_LABS.find(l => l.id === Number(id)) ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  async function runFeasibility() {
    setFeasLoading(true);
    try {
      const equipmentList = feasForm.equipment.split(',').map(e => e.trim()).filter(Boolean);
      const r = await feasibilityApi.check({
        lab_id: parseInt(id),
        project_description: feasForm.description,
        equipment_needed: equipmentList,
        duration_days: feasForm.duration,
      });
      setFeasResult(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setFeasLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-subtle)]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-8 bg-[var(--bg-subtle)] rounded w-1/3 mb-8" />
          <div className="h-48 bg-[var(--bg-subtle)] rounded" />
        </div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-[var(--bg-subtle)]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-[var(--text-muted)]">Lab not found.</p>
          <Link to="/labs" className="btn-primary mt-4">Back to labs</Link>
        </div>
      </div>
    );
  }

  const availDates      = Object.keys(lab.availability_json || {}).sort();
  const certifications  = lab.certifications_json || [];
  const equipment       = lab.equipment_json || [];

  const verdictStyle = {
    'Feasible':     'bg-green-50 border-green-300 text-green-800',
    'Conditional':  'bg-yellow-50 border-yellow-300 text-yellow-800',
    'Not Feasible': 'bg-red-50 border-red-300 text-red-800',
  };
  const verdictIcon = { 'Feasible': '✅', 'Conditional': '⚠️', 'Not Feasible': '❌' };

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="text-sm text-[var(--text-muted)] mb-6 flex gap-2 items-center">
          <Link to="/labs" className="hover:text-primary-600">Labs</Link>
          <span>/</span>
          <span className="text-[var(--text-muted)]">{lab.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header card */}
            <div className="card p-6">
              <SmartImage
                src={getLabImage(lab)}
                alt={`${lab.name} laboratory`}
                fallbackLabel="Laboratory"
                className="mb-5 h-52 w-full rounded-2xl object-cover shadow-[var(--shadow-2)]"
                loading="lazy"
                decoding="async"
              />
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-4xl">🔬</div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{lab.name}</h1>
                  <p className="text-[var(--text-muted)] flex items-center gap-2 mb-3">
                    <span>📍</span>{lab.location || 'Location not set'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {lab.rating > 0 && (
                      <span className="flex items-center gap-1 text-yellow-600 font-medium">
                        ⭐ {lab.rating} <span className="text-[var(--text-muted)] font-normal">({lab.reviews_count} reviews)</span>
                      </span>
                    )}
                    {lab.capacity > 0 && <span className="text-[var(--text-muted)]">👥 {lab.capacity} researchers</span>}
                    <span className="text-[var(--text-muted)]">Member since {new Date(lab.member_since || Date.now()).getFullYear()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">€{lab.price_per_day}</p>
                  <p className="text-sm text-[var(--text-muted)]">per day</p>
                </div>
              </div>

              {certifications.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {certifications.map(c => (
                      <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium">
                        🛡 {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="font-semibold text-[var(--text-primary)] mb-3">About this Lab</h2>
              <p className="text-[var(--text-muted)] leading-relaxed">{lab.description || 'No description provided.'}</p>
            </div>

            {/* Pricing Tiers */}
            <div className="card p-6">
              <h2 className="font-semibold text-[var(--text-primary)] mb-4">Pricing Tiers</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Hourly', price: lab.hourly_rate, unit: '/hr', icon: '⏱', best: false },
                  { label: 'Half-day (4h)', price: lab.half_day_rate, unit: '/4h', icon: '🌅', best: true },
                  { label: 'Full-day', price: lab.price_per_day, unit: '/day', icon: '📅', best: false },
                ].map(tier => (
                  <div key={tier.label} className={`relative p-4 rounded-xl border-2 text-center ${tier.best ? 'border-green-400 bg-green-50' : 'border-[var(--border)] bg-white'}`}>
                    {tier.best && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium whitespace-nowrap">Best value</span>
                    )}
                    <div className="text-2xl mb-1">{tier.icon}</div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">{tier.label}</p>
                    <p className="text-xl font-bold text-green-600">{tier.price > 0 ? `€${tier.price}` : '–'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{tier.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment */}
            {equipment.length > 0 && (
              <div className="card p-6">
                <h2 className="font-semibold text-[var(--text-primary)] mb-3">Available Equipment</h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {equipment.map(eq => (
                    <div key={eq} className="flex items-center gap-2 p-2.5 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border)]">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0" />
                      <span className="text-sm text-[var(--text-muted)]">{eq}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            <div className="card p-6">
              <h2 className="font-semibold text-[var(--text-primary)] mb-3">Available Services</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {(lab.services_json || []).map(svc => (
                  <div key={svc} className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg border border-green-100">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                    <span className="text-sm text-green-800">{svc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="card p-6">
              <h2 className="font-semibold text-[var(--text-primary)] mb-3">Upcoming Available Days</h2>
              {availDates.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm">No availability set yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availDates.slice(0, 12).map(date => (
                    <div key={date} className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 font-medium">
                      {new Date(date + 'T12:00:00').toLocaleDateString('en-DE', { weekday: 'short', day: '2-digit', month: 'short' })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Feasibility Check */}
            <div className="card p-6" id="feasibility-section">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="font-semibold text-[var(--text-primary)]">Check Feasibility</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-0.5">Assess if this lab can support your specific project</p>
                </div>
                <button
                  onClick={() => { setShowFeasibility(!showFeasibility); setFeasResult(null); }}
                  className="btn-secondary text-sm"
                >
                  {showFeasibility ? 'Close' : '🔍 Check Feasibility'}
                </button>
              </div>

              {showFeasibility && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="label">Project description</label>
                    <textarea
                      className="input"
                      rows={3}
                      placeholder="Describe what you want to do in this lab…"
                      value={feasForm.description}
                      onChange={e => setFeasForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Equipment needed (comma-separated)</label>
                    <input
                      className="input"
                      placeholder="e.g. SEM, Sputtering System, Flow Cytometer"
                      value={feasForm.equipment}
                      onChange={e => setFeasForm(f => ({ ...f, equipment: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Duration (days)</label>
                    <input
                      type="number" className="input" min={1} max={30}
                      value={feasForm.duration}
                      onChange={e => setFeasForm(f => ({ ...f, duration: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <button
                    onClick={runFeasibility}
                    disabled={feasLoading || !feasForm.description.trim()}
                    className="btn-primary w-full"
                  >
                    {feasLoading ? '⏳ Assessing…' : '🔍 Run Feasibility Assessment'}
                  </button>
                </div>
              )}

              {feasResult && (
                <div className={`mt-5 p-5 rounded-xl border-2 ${verdictStyle[feasResult.verdict] || 'bg-[var(--bg-subtle)] border-[var(--border-strong)]'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{verdictIcon[feasResult.verdict]}</span>
                    <div>
                      <p className="text-xl font-bold">{feasResult.verdict}</p>
                      <p className="text-sm opacity-75">Risk level: <strong>{feasResult.risk_level}</strong></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Est. Cost', value: `€${feasResult.estimated_cost}` },
                      { label: 'Est. Time', value: feasResult.estimated_time },
                      { label: 'Equipment Match', value: `${feasResult.equipment_match.score}%` },
                    ].map(item => (
                      <div key={item.label} className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                        <p className="text-xs text-[var(--text-muted)] mb-1">{item.label}</p>
                        <p className="font-bold text-[var(--text-primary)]">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {feasResult.equipment_match.matched.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold mb-1">✅ Matched:</p>
                      <div className="flex flex-wrap gap-1">
                        {feasResult.equipment_match.matched.map(e => (
                          <span key={e} className="text-xs px-2 py-0.5 bg-green-200 text-green-800 rounded">{e}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {feasResult.equipment_match.missing.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold mb-1">❌ Not available:</p>
                      <div className="flex flex-wrap gap-1">
                        {feasResult.equipment_match.missing.map(e => (
                          <span key={e} className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">{e}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-sm leading-relaxed border-t border-current border-opacity-20 pt-3">{feasResult.recommendation}</p>

                  {feasResult.verdict !== 'Not Feasible' && user?.role === 'business' && (
                    <Link to={`/book/lab/${lab.id}`} className="mt-3 inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors">
                      Proceed to Booking →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Booking sidebar */}
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Rent this Lab</h3>
              <div className="space-y-2.5 mb-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Hourly rate</span>
                  <span className="font-semibold text-green-600">€{lab.hourly_rate}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Half-day (4h)</span>
                  <span className="font-semibold text-green-600">€{lab.half_day_rate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Full-day rate</span>
                  <span className="font-semibold text-green-600">€{lab.price_per_day}/day</span>
                </div>
                <div className="border-t border-[var(--border)] pt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-[var(--text-muted)]">Location</span>
                    <span className="text-[var(--text-muted)] text-right text-xs">{lab.location || '–'}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[var(--text-muted)]">Capacity</span>
                    <span className="text-[var(--text-muted)]">{lab.capacity > 0 ? `${lab.capacity} researchers` : '–'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Available days</span>
                    <span className="text-[var(--text-muted)]">{availDates.length} days</span>
                  </div>
                </div>
              </div>

              {user?.role === 'business' ? (
                <div className="space-y-2">
                  <Link to={`/book/lab/${lab.id}`} className="inline-flex items-center justify-center w-full px-4 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors">
                    Book Lab →
                  </Link>
                  <button
                    onClick={() => { setShowFeasibility(true); setTimeout(() => document.getElementById('feasibility-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                    className="btn-secondary w-full text-sm"
                  >
                    🔍 Check Feasibility
                  </button>
                </div>
              ) : user ? (
                <p className="text-xs text-[var(--text-muted)] text-center">Only business accounts can make bookings.</p>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="btn-primary w-full justify-center">Sign in to book</Link>
                  <Link to="/register" className="btn-secondary w-full justify-center">Create account</Link>
                </div>
              )}

              <p className="text-xs text-[var(--text-muted)] text-center mt-3">No payment charged until confirmed</p>

              {certifications.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Certifications</p>
                  <div className="space-y-1">
                    {certifications.map(c => (
                      <p key={c} className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                        <span className="text-blue-500">🛡</span> {c}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
