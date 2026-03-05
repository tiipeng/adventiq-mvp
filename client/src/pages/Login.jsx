import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@adventiq.com', password: 'Admin123!' },
  { role: 'Business', email: 'anna.schmidt@techcorp.de', password: 'Business123!' },
  { role: 'Expert', email: 'dr.mueller@university.de', password: 'Expert123!' },
  { role: 'Lab', email: 'cleanroom@tum.de', password: 'Lab123!' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dashMap = { business: '/dashboard/business', expert: '/dashboard/expert', lab: '/dashboard/lab', admin: '/dashboard/admin' };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      navigate(from || dashMap[user.role] || '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(acc) {
    setForm({ email: acc.email, password: acc.password });
    setError('');
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] px-4 py-10">
      <div className="mx-auto grid w-full max-w-5xl items-stretch gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="card hidden p-8 lg:block">
          <div className="mb-6 flex items-center">
            <span className="text-xl font-bold text-[var(--text-primary)]">AdventIQ</span>
          </div>
          <h1 className="mb-3">High-signal external expertise for high-stakes product decisions.</h1>
          <p className="mb-6 text-sm text-[var(--text-secondary)]">
            Use one workspace to source experts, reserve labs, and manage delivery with confidence.
          </p>
          <div className="grid gap-3">
            <div className="rounded-[12px] border border-[var(--border)] bg-white/70 p-4">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Search-first workflow</p>
              <p className="text-xs text-[var(--text-muted)]">Command palette and AI finder built in.</p>
            </div>
            <div className="rounded-[12px] border border-[var(--border)] bg-white/70 p-4">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Fast turnaround modes</p>
              <p className="text-xs text-[var(--text-muted)]">Async and urgent consult options per request.</p>
            </div>
          </div>
        </div>

        <div className="card p-7 md:p-8">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center lg:hidden">
              <span className="font-bold text-[var(--text-primary)]">AdventIQ</span>
            </Link>
            <h2 className="mt-4 mb-1">Welcome back</h2>
            <p className="text-sm text-[var(--text-muted)]">Sign in to continue to your workspace.</p>
          </div>

          <div className="mb-5 rounded-[12px] border border-[var(--border)] bg-white/70 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">Demo accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="rounded-[10px] border border-[var(--border)] bg-white px-3 py-2 text-left transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]"
                >
                  <p className="text-xs font-semibold text-[var(--text-primary)]">{acc.role}</p>
                  <p className="truncate text-xs text-[var(--text-muted)]">{acc.email}</p>
                </button>
              ))}
            </div>
          </div>

          {error ? <div className="mb-4 rounded-[10px] border border-[#ffc8cf] bg-[#ffedf0] p-3 text-sm text-[#8f1c2a]">{error}</div> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--text-muted)]">
            Don&apos;t have an account? <Link to="/register" className="font-semibold text-[var(--accent)] hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
