import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function StatCard({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-primary-600">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 text-2xl">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ n, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">{n}</div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-full mb-6">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-primary-700">Now available in Germany & Poland</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
            We enable the<br />
            <span className="text-primary-600">Fast Forward.</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect your business with world-class expert consultants and
            university lab facilities — on-demand, fully managed, zero friction.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary px-8 py-3 text-base">
              Start for free →
            </Link>
            <Link to="/experts" className="btn-secondary px-8 py-3 text-base">
              Browse experts
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <StatCard value="50+" label="Verified Experts" />
            <StatCard value="12" label="Partner Labs" />
            <StatCard value="DE & PL" label="Markets" />
          </div>
        </div>
      </section>

      {/* Service selection */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What are you looking for?</h2>
            <p className="text-gray-500">Choose your path to accelerate your project</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Expert Card */}
            <div className="bg-white rounded-2xl border border-primary-100 p-8 hover:shadow-lg transition-shadow group">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:bg-primary-600 group-hover:text-white transition-colors">
                👤
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Consultation</h3>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                Get one-on-one sessions with industry experts in AI, engineering,
                regulatory compliance, sustainability, and more. Hourly billing, flexible scheduling.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-gray-600">
                {['AI & Machine Learning', 'Biomedical & Regulatory', 'Sustainability & Materials', 'Industry & Engineering'].map(t => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" /> {t}
                  </li>
                ))}
              </ul>
              <Link to="/experts" className="btn-primary w-full justify-center">
                Browse Experts →
              </Link>
            </div>

            {/* Lab Card */}
            <div className="bg-white rounded-2xl border border-green-100 p-8 hover:shadow-lg transition-shadow group">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                🔬
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lab Rental</h3>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                Access cutting-edge university laboratory facilities for prototyping,
                testing, and research. Daily rates, full technical support available.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-gray-600">
                {['Cleanroom & Semiconductor', 'Biotechnology & Genomics', 'Materials Testing', 'Nanotechnology'].map(t => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> {t}
                  </li>
                ))}
              </ul>
              <Link to="/labs" className="inline-flex items-center justify-center w-full px-4 py-2 rounded-lg bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors">
                Browse Labs →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-gray-500">From problem to solution in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 max-w-3xl mx-auto">
            <StepCard n="1" title="Describe your problem" desc="Fill in our structured problem form — we'll suggest the most relevant experts or labs automatically." />
            <StepCard n="2" title="Select & schedule" desc="Browse filtered results, view profiles, and pick a time slot using our calendar booking system." />
            <StepCard n="3" title="Confirm & pay" desc="Secure booking with mock payment flow. Your slot is locked in once payment is confirmed." />
            <StepCard n="4" title="Get your report" desc="Receive a detailed consultation report or lab results, downloadable from your dashboard." />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for modern innovation teams</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon="🔐" title="Verified experts only" desc="Every expert and lab is reviewed and approved by our team before appearing in search results." />
            <FeatureCard icon="📅" title="Real-time availability" desc="See exactly when experts and labs are available. No back-and-forth email scheduling." />
            <FeatureCard icon="📄" title="Structured reports" desc="Every engagement ends with a downloadable report — from consultation summaries to lab results." />
            <FeatureCard icon="🤖" title="AI matching (coming soon)" desc="Our AI engine will match your problem description to the most relevant experts automatically." />
            <FeatureCard icon="🌍" title="Germany & Poland" desc="Focused network of experts and labs in DE and PL, with plans to expand across the EU." />
            <FeatureCard icon="⚡" title="Fast turnaround" desc="Most experts respond within 24 hours. Lab slots available within days, not weeks." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Fast Forward your project?</h2>
          <p className="text-primary-200 mb-8">Join businesses across Germany and Poland already using AdventIQ.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
              Create free account
            </Link>
            <Link to="/login" className="border border-primary-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AQ</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">AdventIQ</span>
            <span className="text-gray-400 text-sm">· We enable the Fast Forward.</span>
          </div>
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} AdventIQ. Germany & Poland.</p>
        </div>
      </footer>
    </div>
  );
}
