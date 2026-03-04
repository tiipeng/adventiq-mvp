import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar />

      <section className="section-app">
        <div className="container-app">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="badge-blue mb-3">Research-Grade Consulting Platform</span>
              <h1 className="mb-4">Find verified experts and university labs for high-impact projects</h1>
              <p className="text-base text-[var(--text-secondary)] mb-6">AdventIQ helps innovation teams book academic specialists, secure lab time, and get actionable outputs in one workflow.</p>
              <div className="flex gap-2">
                <Link to="/ai-recommend" className="btn-primary">Start with AI Expert Finder</Link>
                <Link to="/experts" className="btn-secondary">Browse Experts</Link>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="mb-3">Platform at a glance</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="card p-4"><p className="text-2xl font-semibold text-[var(--accent)]">50+</p><p className="text-sm">Experts</p></div>
                <div className="card p-4"><p className="text-2xl font-semibold text-[var(--accent)]">12</p><p className="text-sm">Labs</p></div>
                <div className="card p-4"><p className="text-2xl font-semibold text-[var(--accent)]">24h</p><p className="text-sm">Fast Consult</p></div>
                <div className="card p-4"><p className="text-2xl font-semibold text-[var(--accent)]">3 steps</p><p className="text-sm">Book to Report</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-app pt-0">
        <div className="container-app">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card p-5">
              <h3 className="mb-2">Expert Booking</h3>
              <p className="text-sm mb-4">Book consultations with a structured calendar and summary workflow.</p>
              <Link className="btn-secondary" to="/experts">Explore</Link>
            </div>
            <div className="card p-5">
              <h3 className="mb-2">Lab Booking</h3>
              <p className="text-sm mb-4">Select equipment/services and reserve capacity by date and time.</p>
              <Link className="btn-secondary" to="/labs">Explore</Link>
            </div>
            <div className="card p-5">
              <h3 className="mb-2">Fast Consult</h3>
              <p className="text-sm mb-4">Get a rapid response with urgency-based pricing and workspace delivery.</p>
              <Link className="btn-secondary" to="/experts">Start</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
