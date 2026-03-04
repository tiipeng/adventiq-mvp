import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { role: 'Admin',    email: 'admin@adventiq.com',        password: 'Admin123!' },
  { role: 'Business', email: 'anna.schmidt@techcorp.de',   password: 'Business123!' },
  { role: 'Expert',   email: 'dr.mueller@university.de',   password: 'Expert123!' },
  { role: 'Lab',      email: 'cleanroom@tum.de',           password: 'Lab123!' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || null;

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">AQ</span>
            </div>
            <span className="font-bold text-gray-900 text-xl">AdventIQ</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm">Sign in to your AdventIQ account</p>
        </div>

        {/* Demo accounts */}
        <div className="card p-4 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Demo accounts</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.role}
                type="button"
                onClick={() => fillDemo(acc)}
                className="text-left px-3 py-2 rounded-lg border border-gray-200 hover:bg-primary-50 hover:border-primary-200 transition-colors"
              >
                <p className="text-xs font-semibold text-gray-700">{acc.role}</p>
                <p className="text-xs text-gray-400 truncate">{acc.email}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="card p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
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
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
