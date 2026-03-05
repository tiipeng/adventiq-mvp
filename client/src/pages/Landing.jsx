import React from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { HERO_LAB_IMAGE } from '../utils/imageAssets';
import SmartImage from '../components/ui/SmartImage';

const PRODUCT_METRICS = [
  { value: '50+', label: 'Verified Experts', delta: '+18% this quarter' },
  { value: '12', label: 'Lab Partners', delta: 'Across 4 major cities' },
  { value: '24h', label: 'Fast Consult SLA', delta: 'Priority response lane' },
  { value: '94%', label: 'Delivery Confidence', delta: 'On-time completion rate' },
];

const FEATURE_BLOCKS = [
  {
    icon: '01',
    title: 'Expert Booking Ops',
    desc: 'Match with domain specialists, lock scope, and track outcomes from one workspace.',
  },
  {
    icon: '02',
    title: 'Lab Access Network',
    desc: 'Reserve vetted facilities with transparent windows, pricing, and operational notes.',
  },
  {
    icon: '03',
    title: 'Async + Fast Consult',
    desc: 'Switch between deep async analysis and fast turnarounds for critical decisions.',
  },
  {
    icon: '04',
    title: 'Report Delivery Flow',
    desc: 'Collect outputs in a standardized format with report visibility for all stakeholders.',
  },
];

const DASHBOARD_STATS = [
  { label: 'Active Projects', value: '26' },
  { label: 'Waiting Review', value: '07' },
  { label: 'Monthly Spend', value: 'EUR 38.4k' },
  { label: 'Reports Delivered', value: '112' },
];

export default function Landing() {
  return (
    <AppShell>
      <div className="min-h-screen bg-[var(--bg-base)]">
        <section className="section-app pb-12">
          <div className="container-app">
            <div className="hero-shell glass-panel p-6 sm:p-8 lg:p-10">
              <SmartImage
                src={HERO_LAB_IMAGE}
                alt="Futuristic research laboratory environment"
                fallbackLabel="Research Lab Visual"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(6,12,24,0.9)_0%,rgba(7,14,30,0.82)_48%,rgba(8,15,32,0.92)_100%)]" />
              <div className="relative z-10 grid items-stretch gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="relative z-10">
                  <p className="section-kicker mb-4">Premium R&D orchestration</p>
                  <h1 className="display-title mb-5 max-w-4xl">Scale research decisions with elite experts and lab workflows.</h1>
                  <p className="mb-8 max-w-2xl text-base text-[var(--text-secondary)]">
                    AdventIQ combines expert hiring, laboratory booking, async consultations, and report delivery in one modern operating layer for high-performance teams.
                  </p>

                  <div className="mb-10 flex flex-wrap gap-3">
                    <Link to="/ai-recommend" className="btn-primary">Start with AI Finder</Link>
                    <Link to="/experts" className="btn-secondary">Browse Experts</Link>
                    <Link to="/labs" className="btn-ghost border border-[var(--border)]">Browse Labs</Link>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {PRODUCT_METRICS.map((item) => (
                      <div key={item.label} className="metric-tile p-4">
                        <p className="text-2xl font-semibold text-[var(--text-primary)]">{item.value}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{item.delta}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid content-start gap-3 lg:gap-4">
                  <div className="floating-panel p-5">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Pipeline Health</p>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs text-[var(--text-muted)]">
                          <span>Booking conversion</span>
                          <span>79%</span>
                        </div>
                        <div className="progress-track"><span className="progress-fill" style={{ width: '79%' }} /></div>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs text-[var(--text-muted)]">
                          <span>Fast consult SLA</span>
                          <span>91%</span>
                        </div>
                        <div className="progress-track"><span className="progress-fill" style={{ width: '91%' }} /></div>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs text-[var(--text-muted)]">
                          <span>Report completion</span>
                          <span>96%</span>
                        </div>
                        <div className="progress-track"><span className="progress-fill" style={{ width: '96%' }} /></div>
                      </div>
                    </div>
                  </div>

                  <div className="floating-panel p-4">
                    <p className="text-xs text-[var(--text-muted)]">Realtime match insight</p>
                    <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Top match: Polymer Science Expert</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">Response window under 4 hours</p>
                  </div>

                  <div className="floating-panel p-4">
                    <p className="text-xs text-[var(--text-muted)]">Active this week</p>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {['14', '08', '11', '05'].map((value, i) => (
                        <div key={value} className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-2 text-center">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{value}</p>
                          <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">Q{i + 1}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-app pt-2">
          <div className="container-app grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-panel p-7">
              <p className="section-kicker mb-3">Platform capabilities</p>
              <h2 className="mb-3 max-w-2xl">A modern operating system for expert collaboration and technical execution.</h2>
              <p className="mb-6 max-w-2xl text-sm text-[var(--text-secondary)]">
                Replace fragmented tools with a unified interface designed for startup and enterprise teams running high-stakes research work.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {FEATURE_BLOCKS.map((item) => (
                  <div key={item.title} className="feature-block">
                    <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--accent-light)] text-xs font-semibold text-[var(--text-primary)]">
                      {item.icon}
                    </div>
                    <h3 className="mb-2 text-lg">{item.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6">
              <p className="section-kicker mb-3">Dashboard preview</p>
              <div className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Operations Snapshot</p>
                  <span className="badge-blue">Live</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {DASHBOARD_STATS.map((item) => (
                    <div key={item.label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-3">
                      <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{item.value}</p>
                    </div>
                  ))}
                </div>
                <Link className="btn-secondary mt-4 w-full justify-center" to="/dashboard/business">Open Business Dashboard</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
