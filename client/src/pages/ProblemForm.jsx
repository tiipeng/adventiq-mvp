import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExpertCard from '../components/ExpertCard';
import LabCard from '../components/LabCard';
import { expertsApi, labsApi } from '../utils/api';
import { MOCK_EXPERTS, MOCK_LABS } from '../utils/mockData';

const CATEGORIES = [
  { value: 'ai_ml',        label: 'AI & Machine Learning',      tags: ['Machine Learning', 'NLP', 'Computer Vision'] },
  { value: 'biomedical',   label: 'Biomedical & Regulatory',    tags: ['Biomedical Engineering', 'Regulatory Compliance', 'CE Marking'] },
  { value: 'sustainability', label: 'Sustainability & Materials',tags: ['Sustainability', 'Circular Economy', 'LCA'] },
  { value: 'semiconductor', label: 'Semiconductor & Hardware',  tags: ['Semiconductor Fabrication', 'MEMS Development'] },
  { value: 'biotech',      label: 'Biotechnology',              tags: ['Protein Analysis', 'Cell Culture', 'CRISPR'] },
  { value: 'other',        label: 'Other / Not sure',           tags: [] },
];

export default function ProblemForm() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState({ category: '', description: '', type: 'both', budget: '', timeline: '' });
  const [experts, setExperts]   = useState([]);
  const [labs, setLabs]         = useState([]);
  const [loading, setLoading]   = useState(false);

  function handleCategorySelect(cat) {
    setForm(f => ({ ...f, category: cat }));
  }

  async function handleSearch() {
    setLoading(true);
    const cat = CATEGORIES.find(c => c.value === form.category);
    const tags = cat?.tags.join(',') || '';
    const params = { search: form.description };
    if (tags) params.expertise = tags;

    try {
      const [eRes, lRes] = await Promise.all([
        (form.type === 'expert' || form.type === 'both') ? expertsApi.list(params) : Promise.resolve({ data: [] }),
        (form.type === 'lab'    || form.type === 'both') ? labsApi.list({ search: form.description }) : Promise.resolve({ data: [] }),
      ]);
      const experts = eRes?.data ?? MOCK_EXPERTS;
      const labs = lRes?.data ?? MOCK_LABS;
      setExperts(Array.isArray(experts) ? experts : MOCK_EXPERTS);
      setLabs(Array.isArray(labs) ? labs : MOCK_LABS);
    } catch (e) {
      console.error(e);
      setExperts(MOCK_EXPERTS);
      setLabs(MOCK_LABS);
    } finally {
      setLoading(false);
      setStep(2);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 max-w-5xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Find the Right Expert or Lab</h1>
            <p className="text-gray-500 mt-1">Describe your problem and we'll match you with the best options.</p>
          </div>

          {/* AI placeholder note */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">🤖</span>
            <p className="text-sm text-blue-700">
              <strong>AI Matching:</strong> Smart AI-powered matching (matchExpertByAI) is coming soon. Currently using keyword-based filtering.
            </p>
          </div>

          {step === 1 && (
            <div className="card p-8 max-w-2xl">
              <div className="space-y-6">
                {/* Service type */}
                <div>
                  <label className="label text-base mb-3">What are you looking for?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'both',   label: 'Both', icon: '🔍' },
                      { value: 'expert', label: 'Expert', icon: '👤' },
                      { value: 'lab',    label: 'Lab',    icon: '🔬' },
                    ].map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, type: t.value }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${form.type === t.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <span className="text-xl block mb-1">{t.icon}</span>
                        <span className="text-sm font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="label text-base mb-3">Problem category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => handleCategorySelect(cat.value)}
                        className={`p-3 rounded-xl border-2 text-left text-sm transition-all ${form.category === cat.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="label text-base">Describe your problem</label>
                  <textarea
                    className="input"
                    rows={5}
                    placeholder="e.g. We're building a medical wearable device and need help with CE marking regulatory compliance for the EU market…"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>

                {/* Budget/Timeline */}
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
                  {loading ? 'Searching…' : '🔍 Find matches →'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep(1)} className="btn-secondary text-sm">← Refine search</button>
                <p className="text-gray-500 text-sm">Found {experts.length} expert{experts.length !== 1 ? 's' : ''} and {labs.length} lab{labs.length !== 1 ? 's' : ''}</p>
              </div>

              {experts.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Matching Experts</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {experts.map(e => <ExpertCard key={e.id} expert={e} />)}
                  </div>
                </div>
              )}

              {labs.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Matching Labs</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {labs.map(l => <LabCard key={l.id} lab={l} />)}
                  </div>
                </div>
              )}

              {experts.length === 0 && labs.length === 0 && (
                <div className="card p-12 text-center">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-gray-500 mb-4">No matches found. Try a different description or category.</p>
                  <button onClick={() => setStep(1)} className="btn-primary">Refine search</button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
