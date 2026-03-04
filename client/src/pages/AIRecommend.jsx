import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { expertsApi, labsApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { value: 'ai_ml',        label: 'AI & Machine Learning',    tags: ['Machine Learning', 'NLP', 'Computer Vision', 'Python', 'TensorFlow'] },
  { value: 'biomedical',   label: 'Biomedical & Regulatory',  tags: ['Biomedical Engineering', 'Regulatory Compliance', 'CE Marking', 'Clinical Trials'] },
  { value: 'sustainability', label: 'Sustainability & Materials', tags: ['Sustainability', 'Circular Economy', 'LCA', 'Green Manufacturing'] },
  { value: 'semiconductor', label: 'Semiconductor & Hardware', tags: ['Semiconductor Fabrication', 'MEMS Development', 'Nano-patterning'] },
  { value: 'biotech',      label: 'Biotechnology',            tags: ['Protein Analysis', 'Cell Culture', 'CRISPR', 'Genomics'] },
  { value: 'other',        label: 'Other / Not sure',         tags: [] },
];

const SORT_OPTIONS = ['Match Score', 'Rating', 'Price (low)', 'Readiness'];

// ── Scoring algorithm ──────────────────────────────────────────────────────────
function scoreExpert(expert, keywords, categoryTags) {
  let score = 0;
  const reasons = [];
  const tags = expert.expertise_tags || [];
  const bio  = (expert.bio || '').toLowerCase();

  // Keyword overlap with description (max 30 pts)
  const kwMatches = keywords.filter(kw =>
    tags.some(t => t.toLowerCase().includes(kw)) ||
    bio.includes(kw)
  ).length;
  if (kwMatches > 0) {
    const kwScore = Math.min(30, kwMatches * 10);
    score += kwScore;
    if (kwMatches >= 2) reasons.push('Expertise match');
  }

  // Category tags overlap (max 25 pts)
  const catMatches = categoryTags.filter(ct => tags.some(t => t.toLowerCase() === ct.toLowerCase())).length;
  if (catMatches > 0) {
    score += Math.min(25, catMatches * 10);
  }

  // Rating boost (max 20 pts)
  if (expert.rating >= 4.8) { score += 20; reasons.push('High rating'); }
  else if (expert.rating >= 4.5) { score += 12; }
  else if (expert.rating >= 4.0) { score += 6; }

  // Response time boost (max 15 pts)
  const rt = expert.avg_response_time || '24h';
  if (rt.startsWith('1') || rt.startsWith('2')) { score += 15; reasons.push('Fast responder'); }
  else if (rt.startsWith('4') || rt.startsWith('6')) { score += 8; }
  else { score += 4; }

  // Success rate boost (max 10 pts)
  if (expert.success_rate >= 95) { score += 10; }
  else if (expert.success_rate >= 90) { score += 6; }

  // Verified bonus
  if (expert.verified) { score += 5; reasons.push('Verified expert'); }

  // Availability bonus (has upcoming slots)
  const availCount = Object.keys(expert.availability_json || {}).length;
  if (availCount >= 3) { score += 5; reasons.push('Available soon'); }

  // Industry-ready score bonus (max 5 pts)
  if (expert.industry_ready_score >= 9) { score += 5; reasons.push('Industry-ready'); }
  else if (expert.industry_ready_score >= 8) { score += 3; }

  return { score: Math.min(99, score), reasons };
}

function scoreSort(item, sortBy) {
  if (sortBy === 'Match Score') return -(item._score || 0);
  if (sortBy === 'Rating') return -(item.rating || 0);
  if (sortBy === 'Price (low)') return item.hourly_rate || item.price_per_day || 0;
  if (sortBy === 'Readiness') return -(item.industry_ready_score || 0);
  return 0;
}

export default function AIRecommend() {
  const { user } = useAuth();
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState({ category: '', description: '', type: 'both', budget: '', timeline: '' });
  const [sortBy, setSortBy]     = useState('Match Score');
  const [results, setResults]   = useState({ experts: [], labs: [] });
  const [loading, setLoading]   = useState(false);

  async function handleSearch() {
    setLoading(true);
    const cat = CATEGORIES.find(c => c.value === form.category);
    const categoryTags = cat?.tags || [];
    const keywords = form.description.toLowerCase().split(/\W+/).filter(w => w.length > 3);

    try {
      const params = {};
      if (form.description) params.search = form.description;
      if (categoryTags.length) params.expertise = categoryTags.slice(0, 2).join(',');

      const [eRes, lRes] = await Promise.all([
        (form.type === 'expert' || form.type === 'both') ? expertsApi.list(params) : Promise.resolve({ data: [] }),
        (form.type === 'lab'    || form.type === 'both') ? labsApi.list({ search: form.description }) : Promise.resolve({ data: [] }),
      ]);

      // Score and annotate experts
      const scoredExperts = eRes.data.map(e => {
        const { score, reasons } = scoreExpert(e, keywords, categoryTags);
        return { ...e, _score: score, _reasons: reasons };
      });

      setResults({ experts: scoredExperts, labs: lRes.data });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setStep(2);
    }
  }

  // Sort results
  const sortedExperts = [...results.experts].sort((a, b) => scoreSort(a, sortBy) - scoreSort(b, sortBy));
  const sortedLabs    = [...results.labs];

  const hasSidebar = user?.role === 'business' || user?.role === 'expert' || user?.role === 'lab' || user?.role === 'admin';

  const Inner = (
    <main className="flex-1 p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Expert Matching</h1>
        <p className="text-gray-500 mt-1">Smart scoring algorithm — keyword overlap, expertise match, rating, availability, and more.</p>
      </div>

      {/* AI note */}
      <div className="mb-6 p-3 bg-primary-50 border border-primary-100 rounded-lg flex items-start gap-2">
        <span className="text-primary-500 mt-0.5 text-lg">🤖</span>
        <div className="text-sm text-primary-800">
          <strong>How scoring works:</strong> We rank experts by keyword overlap with your description, category expertise match, rating boost, response-time boost, and verified/industry-ready badges. Each factor is weighted and combined into a 0–99% match score.
        </div>
      </div>

      {step === 1 && (
        <div className="card p-8 max-w-2xl">
          <div className="space-y-6">
            <div>
              <label className="label text-base mb-3">What are you looking for?</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'both', label: 'Both', icon: '🔍' },
                  { value: 'expert', label: 'Expert', icon: '👤' },
                  { value: 'lab',    label: 'Lab',    icon: '🔬' },
                ].map(t => (
                  <button
                    key={t.value}
                    onClick={() => setForm(f => ({ ...f, type: t.value }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${form.type === t.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <span className="text-xl block mb-1">{t.icon}</span>
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label text-base mb-3">Problem category</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setForm(f => ({ ...f, category: f.category === cat.value ? '' : cat.value }))}
                    className={`p-3 rounded-xl border-2 text-left text-sm transition-all ${form.category === cat.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label text-base">Describe your problem</label>
              <textarea
                className="input"
                rows={5}
                placeholder="e.g. We're building a medical wearable and need CE marking compliance guidance for the EU market, specifically around clinical trials…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Budget (€)</label>
                <input type="text" className="input" placeholder="e.g. 500–2000" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
              </div>
              <div>
                <label className="label">Timeline</label>
                <input type="text" className="input" placeholder="e.g. ASAP, 2 weeks" value={form.timeline} onChange={e => setForm(f => ({ ...f, timeline: e.target.value }))} />
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading || !form.description.trim()}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? '🤖 Scoring matches…' : '🤖 Find & Score Matches →'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          {/* Sort + back */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <button onClick={() => setStep(1)} className="btn-secondary text-sm">← Refine search</button>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Sort by:</span>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${sortBy === opt ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-400 ml-auto">
              {sortedExperts.length} expert{sortedExperts.length !== 1 ? 's' : ''} · {sortedLabs.length} lab{sortedLabs.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Expert results */}
          {sortedExperts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Matching Experts</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {sortedExperts.map(e => (
                  <div key={e.id} className="card p-5 hover:shadow-md transition-shadow relative">
                    {/* Match score */}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${
                        e._score >= 70 ? 'bg-green-100 text-green-700 border-green-300' :
                        e._score >= 50 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                         'bg-gray-100 text-gray-600 border-gray-300'
                      }`}>
                        🎯 {e._score}%
                      </span>
                    </div>

                    <div className="flex items-start gap-3 mb-3 pr-16">
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">{e.name?.charAt(0)}</span>
                        </div>
                        {e.verified && <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center border border-white">✓</span>}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{e.name}</p>
                        <p className="text-xs text-gray-500">📍 {e.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-bold text-primary-600">€{e.hourly_rate}/hr</span>
                      {e.rating > 0 && <span className="text-xs text-yellow-600">⭐ {e.rating} ({e.reviews_count})</span>}
                    </div>

                    {/* Credibility mini row */}
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                      {e.success_rate > 0 && <span>✅ {e.success_rate}%</span>}
                      {e.avg_response_time && <span>⚡ {e.avg_response_time}</span>}
                      {e.industry_ready_score > 0 && <span>🏆 {e.industry_ready_score}/10</span>}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {(e.expertise_tags || []).slice(0, 3).map(t => (
                        <span key={t} className="badge-blue text-xs">{t}</span>
                      ))}
                    </div>

                    {/* Match reasons */}
                    {e._reasons?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {e._reasons.map(r => (
                          <span key={r} className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs border border-green-200">{r}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link to={`/experts/${e.id}`} className="btn-secondary text-xs flex-1 text-center">Profile</Link>
                      {user?.role === 'business' && (
                        <Link to={`/async/${e.id}`} className="btn-secondary text-xs px-2.5">✉</Link>
                      )}
                      <Link to={`/book/expert/${e.id}`} className="btn-primary text-xs flex-1 text-center">Book</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab results */}
          {sortedLabs.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Matching Labs</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {sortedLabs.map(l => (
                  <div key={l.id} className="card p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">🔬</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{l.name}</p>
                        <p className="text-xs text-gray-500">📍 {l.location}</p>
                      </div>
                      <p className="text-base font-bold text-green-600 flex-shrink-0">€{l.price_per_day}/day</p>
                    </div>
                    {(l.certifications_json || []).length > 0 && (
                      <div className="flex gap-1 mb-2">
                        {(l.certifications_json || []).slice(0, 2).map(c => (
                          <span key={c} className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">🛡 {c}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(l.services_json || []).slice(0, 3).map(s => (
                        <span key={s} className="badge-green text-xs">{s}</span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/labs/${l.id}`} className="btn-secondary text-xs flex-1 text-center">Details</Link>
                      <Link to={`/book/lab/${l.id}`} className="btn-primary text-xs flex-1 text-center">Book Lab</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sortedExperts.length === 0 && sortedLabs.length === 0 && (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500 mb-4">No matches found. Try a different description or category.</p>
              <button onClick={() => setStep(1)} className="btn-primary">Refine search</button>
            </div>
          )}
        </div>
      )}
    </main>
  );

  if (hasSidebar) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          {Inner}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {Inner}
      </div>
    </div>
  );
}
