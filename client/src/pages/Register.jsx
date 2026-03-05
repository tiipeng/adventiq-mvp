import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'business', label: 'Business', icon: 'BI', desc: 'Find and book expert consultants and lab facilities' },
  { value: 'expert', label: 'Expert', icon: 'EX', desc: 'Offer your expertise and accept consultation bookings' },
  { value: 'lab', label: 'Lab', icon: 'LB', desc: 'List your laboratory facilities for rental bookings' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    bio: '', location: '', hourly_rate: '', expertise_tags: '',
    lab_name: '', description: '', price_per_day: '', services: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dashMap = { business: '/dashboard/business', expert: '/dashboard/expert', lab: '/dashboard/lab' };

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
      };
      if (role === 'expert') {
        payload.bio = form.bio;
        payload.location = form.location;
        payload.hourly_rate = parseFloat(form.hourly_rate) || 0;
        payload.expertise_tags = form.expertise_tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
      if (role === 'lab') {
        payload.lab_name = form.lab_name || form.name;
        payload.description = form.description;
        payload.location = form.location;
        payload.price_per_day = parseFloat(form.price_per_day) || 0;
        payload.services = form.services.split(',').map((s) => s.trim()).filter(Boolean);
      }

      const user = await register(payload);
      navigate(dashMap[user.role] || '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center">
            <span className="text-xl font-bold text-[var(--text-primary)]">AdventIQ</span>
          </Link>
          <h1 className="mt-5 mb-1">Create your account</h1>
          <p className="text-sm text-[var(--text-muted)]">Set up your workspace in two steps.</p>
        </div>

        <div className="card p-7 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${step >= s ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'}`}>{s}</div>
                {s < 2 ? <div className={`h-0.5 flex-1 ${step > s ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} /> : null}
              </React.Fragment>
            ))}
          </div>

          {error ? <div className="mb-4 rounded-[10px] border border-[#ffc8cf] bg-[#ffedf0] p-3 text-sm text-[#8f1c2a]">{error}</div> : null}

          {step === 1 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-[var(--text-muted)]">Choose your account type:</p>
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`w-full rounded-[12px] border p-4 text-left transition-all ${
                    role === r.value ? 'border-[#cfe0ff] bg-[var(--accent-light)]' : 'border-[var(--border)] bg-white hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-[8px] bg-[var(--bg-subtle)] text-[11px] font-bold text-[var(--text-primary)]">{r.icon}</span>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{r.label}</p>
                      <p className="text-sm text-[var(--text-muted)]">{r.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
              <button type="button" disabled={!role} onClick={() => setStep(2)} className="btn-primary mt-2 w-full">Continue</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full name</label>
                <input name="name" type="text" className="input" required value={form.name} onChange={handleChange} placeholder="Anna Schmidt" />
              </div>
              <div>
                <label className="label">Email</label>
                <input name="email" type="email" className="input" required value={form.email} onChange={handleChange} placeholder="anna@company.de" />
              </div>
              <div>
                <label className="label">Password</label>
                <input name="password" type="password" className="input" required minLength={6} value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input name="confirmPassword" type="password" className="input" required value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" />
              </div>

              {role === 'expert' ? (
                <>
                  <hr className="border-[var(--border)]" />
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">Expert Profile</p>
                  <div>
                    <label className="label">Short bio</label>
                    <textarea name="bio" className="input" rows={3} value={form.bio} onChange={handleChange} placeholder="Describe your expertise and background..." />
                  </div>
                  <div>
                    <label className="label">Expertise tags (comma-separated)</label>
                    <input name="expertise_tags" type="text" className="input" value={form.expertise_tags} onChange={handleChange} placeholder="Machine Learning, Python, NLP" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Location</label>
                      <input name="location" type="text" className="input" value={form.location} onChange={handleChange} placeholder="Munich, Germany" />
                    </div>
                    <div>
                      <label className="label">Hourly rate (EUR)</label>
                      <input name="hourly_rate" type="number" className="input" value={form.hourly_rate} onChange={handleChange} placeholder="150" />
                    </div>
                  </div>
                </>
              ) : null}

              {role === 'lab' ? (
                <>
                  <hr className="border-[var(--border)]" />
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">Lab Profile</p>
                  <div>
                    <label className="label">Lab name</label>
                    <input name="lab_name" type="text" className="input" value={form.lab_name} onChange={handleChange} placeholder="TUM Cleanroom Facility" />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea name="description" className="input" rows={3} value={form.description} onChange={handleChange} placeholder="Describe your lab and available equipment..." />
                  </div>
                  <div>
                    <label className="label">Services offered (comma-separated)</label>
                    <input name="services" type="text" className="input" value={form.services} onChange={handleChange} placeholder="MEMS Fabrication, Lithography" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Location</label>
                      <input name="location" type="text" className="input" value={form.location} onChange={handleChange} placeholder="Berlin, Germany" />
                    </div>
                    <div>
                      <label className="label">Price per day (EUR)</label>
                      <input name="price_per_day" type="number" className="input" value={form.price_per_day} onChange={handleChange} placeholder="800" />
                    </div>
                  </div>
                </>
              ) : null}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Already have an account? <Link to="/login" className="font-semibold text-[var(--accent)] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
