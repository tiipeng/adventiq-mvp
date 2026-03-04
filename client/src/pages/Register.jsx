import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'business', label: 'Business', icon: '🏢', desc: 'Find and book expert consultants and lab facilities' },
  { value: 'expert',   label: 'Expert',   icon: '👤', desc: 'Offer your expertise and accept consultation bookings' },
  { value: 'lab',      label: 'Lab',      icon: '🔬', desc: 'List your laboratory facilities for rental bookings' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]   = useState(1); // 1 = role, 2 = details
  const [role, setRole]   = useState('');
  const [form, setForm]   = useState({
    name: '', email: '', password: '', confirmPassword: '',
    bio: '', location: '', hourly_rate: '', expertise_tags: '',
    lab_name: '', description: '', price_per_day: '', services: '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const dashMap = { business: '/dashboard/business', expert: '/dashboard/expert', lab: '/dashboard/lab' };

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
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
        payload.expertise_tags = form.expertise_tags.split(',').map(t => t.trim()).filter(Boolean);
      }
      if (role === 'lab') {
        payload.lab_name = form.lab_name || form.name;
        payload.description = form.description;
        payload.location = form.location;
        payload.price_per_day = parseFloat(form.price_per_day) || 0;
        payload.services = form.services.split(',').map(s => s.trim()).filter(Boolean);
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">AQ</span>
            </div>
            <span className="font-bold text-gray-900 text-xl">AdventIQ</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm">Join AdventIQ — We enable the Fast Forward.</p>
        </div>

        <div className="card p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map(s => (
              <React.Fragment key={s}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
                {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
            <div className="ml-2 text-xs text-gray-500">{step === 1 ? 'Select role' : 'Your details'}</div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          {/* Step 1: Role selection */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-4">Choose your account type:</p>
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                    role === r.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{r.label}</p>
                    <p className="text-sm text-gray-500">{r.desc}</p>
                  </div>
                  {role === r.value && <span className="ml-auto text-primary-600 text-lg">✓</span>}
                </button>
              ))}

              <button
                type="button"
                disabled={!role}
                onClick={() => setStep(2)}
                className="btn-primary w-full py-2.5 mt-4"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
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

              {/* Expert fields */}
              {role === 'expert' && (
                <>
                  <hr className="border-gray-100" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expert Profile</p>
                  <div>
                    <label className="label">Short bio</label>
                    <textarea name="bio" className="input" rows={3} value={form.bio} onChange={handleChange} placeholder="Describe your expertise and background…" />
                  </div>
                  <div>
                    <label className="label">Expertise tags <span className="text-gray-400">(comma-separated)</span></label>
                    <input name="expertise_tags" type="text" className="input" value={form.expertise_tags} onChange={handleChange} placeholder="Machine Learning, Python, NLP" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Location</label>
                      <input name="location" type="text" className="input" value={form.location} onChange={handleChange} placeholder="Munich, Germany" />
                    </div>
                    <div>
                      <label className="label">Hourly rate (€)</label>
                      <input name="hourly_rate" type="number" className="input" value={form.hourly_rate} onChange={handleChange} placeholder="150" />
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                    ⏳ Your expert account will be reviewed by an admin before activation.
                  </div>
                </>
              )}

              {/* Lab fields */}
              {role === 'lab' && (
                <>
                  <hr className="border-gray-100" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lab Profile</p>
                  <div>
                    <label className="label">Lab name</label>
                    <input name="lab_name" type="text" className="input" value={form.lab_name} onChange={handleChange} placeholder="TUM Cleanroom Facility" />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea name="description" className="input" rows={3} value={form.description} onChange={handleChange} placeholder="Describe your lab and available equipment…" />
                  </div>
                  <div>
                    <label className="label">Services offered <span className="text-gray-400">(comma-separated)</span></label>
                    <input name="services" type="text" className="input" value={form.services} onChange={handleChange} placeholder="MEMS Fabrication, Lithography, Thin Film" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Location</label>
                      <input name="location" type="text" className="input" value={form.location} onChange={handleChange} placeholder="Berlin, Germany" />
                    </div>
                    <div>
                      <label className="label">Price per day (€)</label>
                      <input name="price_per_day" type="number" className="input" value={form.price_per_day} onChange={handleChange} placeholder="800" />
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                    ⏳ Your lab account will be reviewed by an admin before activation.
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                <button type="submit" className="btn-primary flex-1 py-2.5" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create account →'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
