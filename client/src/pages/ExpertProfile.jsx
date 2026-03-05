import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { expertsApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MOCK_EXPERTS } from '../utils/mockData';
import { getExpertImage } from '../utils/imageAssets';
import SmartImage from '../components/ui/SmartImage';

export default function ExpertProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    expertsApi.get(id)
      .then(r => setExpert(r?.data && !Array.isArray(r.data) ? r.data : MOCK_EXPERTS.find(e => e.id === Number(id)) ?? null))
      .catch(() => setExpert(MOCK_EXPERTS.find(e => e.id === Number(id)) ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-subtle)]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-8 bg-[var(--bg-subtle)] rounded w-1/3 mb-4" />
          <div className="h-4 bg-[var(--bg-subtle)] rounded w-1/4 mb-8" />
          <div className="h-48 bg-[var(--bg-subtle)] rounded" />
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-[var(--bg-subtle)]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-[var(--text-muted)]">Expert not found.</p>
          <Link to="/experts" className="btn-primary mt-4">Back to experts</Link>
        </div>
      </div>
    );
  }

  const availDates = Object.keys(expert.availability_json || {}).sort();

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="text-sm text-[var(--text-muted)] mb-6 flex gap-2 items-center">
          <Link to="/experts" className="hover:text-primary-600">Experts</Link>
          <span>/</span>
          <span className="text-[var(--text-muted)]">{expert.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Header */}
            <div className="card p-6">
              <div className="flex items-start gap-5">
                <div className="relative flex-shrink-0">
                  <SmartImage
                    src={getExpertImage(expert)}
                    alt={`${expert.name} portrait`}
                    fallbackLabel="Expert Portrait"
                    className="h-20 w-20 rounded-2xl object-cover shadow-[var(--shadow-2)] ring-1 ring-[var(--border-strong)]"
                    loading="lazy"
                    decoding="async"
                  />
                  {expert.verified ? (
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm border-2 border-white" title="Verified">✓</span>
                  ) : null}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">{expert.name}</h1>
                    {expert.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">✓ Verified</span>
                    )}
                  </div>
                  <p className="text-[var(--text-muted)] flex items-center gap-2 mb-3">
                    <span>📍</span>{expert.location || 'Location not set'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {expert.rating > 0 && (
                      <span className="flex items-center gap-1 text-yellow-600 font-medium">
                        ⭐ {expert.rating} <span className="text-[var(--text-muted)] font-normal">({expert.reviews_count} reviews)</span>
                      </span>
                    )}
                    <span className="text-[var(--text-muted)]">Member since {new Date(expert.member_since || Date.now()).getFullYear()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">€{expert.hourly_rate}</p>
                  <p className="text-sm text-[var(--text-muted)]">per hour</p>
                </div>
              </div>
            </div>

            {/* Credibility Layer */}
            {(expert.publications > 0 || expert.patents > 0 || expert.industry_projects > 0 || expert.success_rate > 0) && (
              <div className="card p-6">
                <h2 className="font-semibold text-[var(--text-primary)] mb-4">Credibility & Track Record</h2>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 mb-4">
                  {[
                    { icon: '📄', label: 'Publications', value: expert.publications, show: expert.publications > 0 },
                    { icon: '💡', label: 'Patents', value: expert.patents, show: expert.patents > 0 },
                    { icon: '🏭', label: 'Industry Projects', value: expert.industry_projects, show: expert.industry_projects > 0 },
                    { icon: '⚡', label: 'Avg. Response', value: expert.avg_response_time || '–', show: !!expert.avg_response_time },
                    { icon: '✅', label: 'Success Rate', value: expert.success_rate > 0 ? `${expert.success_rate}%` : '–', show: expert.success_rate > 0 },
                    { icon: '🏆', label: 'Industry Score', value: expert.industry_ready_score > 0 ? `${expert.industry_ready_score}/10` : '–', show: expert.industry_ready_score > 0 },
                  ].filter(s => s.show).map(stat => (
                    <div key={stat.label} className="flex flex-col items-center p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border)] text-center">
                      <span className="text-xl mb-1">{stat.icon}</span>
                      <p className="text-lg font-bold text-[var(--text-primary)]">{stat.value}</p>
                      <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
                    </div>
                  ))}
                </div>
                {expert.industry_ready_score > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[var(--text-muted)]">Industry-Ready Score</span>
                      <span className="font-semibold text-primary-600">{expert.industry_ready_score}/10</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-full"
                        style={{ width: `${(expert.industry_ready_score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bio */}
            <div className="card p-6">
              <h2 className="font-semibold text-[var(--text-primary)] mb-3">About</h2>
              <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{expert.bio || 'No bio provided.'}</p>
            </div>

            {/* Expertise */}
            <div className="card p-6">
              <h2 className="font-semibold text-[var(--text-primary)] mb-3">Areas of Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {(expert.expertise_tags || []).map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium border border-primary-100">{tag}</span>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="card p-6">
              <h2 className="font-semibold text-[var(--text-primary)] mb-3">Upcoming Availability</h2>
              {availDates.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm">No availability set yet.</p>
              ) : (
                <div className="space-y-2">
                  {availDates.slice(0, 5).map(date => {
                    const slots = expert.availability_json[date];
                    return (
                      <div key={date} className="flex items-center gap-3 p-3 bg-[var(--bg-subtle)] rounded-lg">
                        <div className="text-sm font-medium text-[var(--text-muted)] w-28 flex-shrink-0">
                          {new Date(date + 'T12:00:00').toLocaleDateString('en-DE', { weekday: 'short', day: '2-digit', month: 'short' })}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(slots) ? slots : Object.keys(slots)).slice(0, 6).map(slot => (
                            <span key={slot} className="text-xs px-2 py-0.5 bg-white border border-[var(--border)] rounded text-[var(--text-muted)]">{slot}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card p-6 sticky top-24">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Book a Consultation</h3>
              <div className="space-y-2.5 mb-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Rate</span>
                  <span className="font-semibold">€{expert.hourly_rate}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Location</span>
                  <span className="text-[var(--text-muted)]">{expert.location || '–'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Available slots</span>
                  <span className="text-[var(--text-muted)]">{availDates.length} dates</span>
                </div>
                {expert.avg_response_time && (
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Response time</span>
                    <span className="text-green-600 font-medium">⚡ {expert.avg_response_time}</span>
                  </div>
                )}
              </div>

              {user?.role === 'business' ? (
                <div className="space-y-2">
                  <Link to={`/book/expert/${expert.id}`} className="btn-primary w-full justify-center text-base py-3">
                    Book Now →
                  </Link>
                  <Link to={`/fast-consult/${expert.id}`} className="btn-fast w-full justify-center text-sm">
                    Fast Consult
                  </Link>
                  <Link to={`/async/${expert.id}`} className="btn-secondary w-full justify-center text-sm">
                    ✉ Ask Async Question
                  </Link>
                </div>
              ) : user ? (
                <p className="text-xs text-[var(--text-muted)] text-center">Only business accounts can make bookings.</p>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="btn-primary w-full justify-center">Sign in to book</Link>
                  <Link to="/register" className="btn-secondary w-full justify-center">Create account</Link>
                  <Link to={`/async/${expert.id}`} className="btn-secondary w-full justify-center text-xs">✉ Async from €80</Link>
                </div>
              )}

              <p className="text-xs text-[var(--text-muted)] text-center mt-3">No payment charged until confirmed</p>
            </div>

            {expert.success_rate > 0 && (
              <div className="card p-4 bg-primary-50 border-primary-200">
                <h4 className="text-sm font-semibold text-primary-800 mb-2">Why choose {expert.name?.split(' ')[0]}?</h4>
                <div className="space-y-1 text-xs text-primary-700">
                  {expert.success_rate > 0 && <p>✅ {expert.success_rate}% client success rate</p>}
                  {expert.avg_response_time && <p>⚡ Responds within {expert.avg_response_time}</p>}
                  {expert.publications > 0 && <p>📄 {expert.publications} academic publications</p>}
                  {expert.industry_projects > 0 && <p>🏭 {expert.industry_projects} industry projects delivered</p>}
                  {expert.verified && <p>✓ Identity & credentials verified</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
