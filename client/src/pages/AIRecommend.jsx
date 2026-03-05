import React, { useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { expertsApi } from '../utils/api';
import { MOCK_EXPERTS } from '../utils/mockData';
import ExpertCard from '../components/ExpertCard';

const EXAMPLES = [
  'We need help integrating machine learning into our medical diagnostics pipeline',
  'Looking for an expert in sustainable manufacturing and environmental compliance',
  'Need guidance on drug delivery systems for our clinical trials',
  'We want to automate our assembly line with collaborative robots',
];

const SORTS = ['Match Score', 'Rating', 'Price', 'Availability'];

function scoreExpert(expert, query) {
  const base = 55 + Math.floor(Math.random() * 30);
  const reasons = ['ML expertise', 'Medical background', 'Fast responder'];
  if (query.toLowerCase().includes('sustainable')) reasons.splice(0, 1, 'Sustainability');
  return { ...expert, _score: Math.min(98, base), _reasons: reasons };
}

export default function AIRecommend() {
  const [text, setText] = useState('');
  const [results, setResults] = useState([]);
  const [sort, setSort] = useState('Match Score');
  const [searched, setSearched] = useState(false);

  async function findExperts() {
    setSearched(true);
    try {
      const response = await expertsApi.list({ search: text });
      const experts = response?.data ?? MOCK_EXPERTS;
      const list = (experts ?? []).map((e) => scoreExpert(e, text));
      setResults(list);
    } catch {
      setResults((MOCK_EXPERTS ?? []).map((e) => scoreExpert(e, text)));
    }
  }

  const sorted = useMemo(() => {
    const arr = [...results];
    if (sort === 'Match Score') return arr.sort((a, b) => (b._score ?? 0) - (a._score ?? 0));
    if (sort === 'Rating') return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === 'Price') return arr.sort((a, b) => (a.hourly_rate ?? 0) - (b.hourly_rate ?? 0));
    return arr.sort((a, b) => (a.avg_response_time ?? '').localeCompare(b.avg_response_time ?? ''));
  }, [results, sort]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar />
        <div className="container-app py-8 max-w-5xl">
          <section className="card p-6 mb-6">
            <p className="text-xs tracking-[0.1em] text-[var(--text-muted)] mb-2">AI EXPERT FINDER</p>
            <h1 className="mb-2">Describe your project or challenge, and our AI will match you with the best academic experts</h1>
            <div className="relative">
              <textarea
                className="input"
                style={{ minHeight: 120 }}
                maxLength={500}
                placeholder="Describe your project, challenge, or research need..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <span className="absolute right-3 bottom-2 text-xs text-[var(--text-muted)]">{text.length} / 500</span>
            </div>
            <button className="btn-primary w-full mt-3" onClick={findExperts}>FIND EXPERTS</button>

            <div className="mt-4">
              <p className="text-xs text-[var(--text-muted)] mb-2">TRY AN EXAMPLE</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((example) => (
                  <button key={example} onClick={() => setText(example)} className="btn-secondary text-xs h-auto py-2 text-left">
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {sorted.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4 text-sm">
                <span>Sort by:</span>
                {SORTS.map((option) => (
                  <button key={option} className={`tab-item ${sort === option ? 'active' : ''}`} onClick={() => setSort(option)}>{option}</button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {sorted.map((expert) => (
                  <ExpertCard key={expert.id} expert={expert} matchScore={expert._score} matchReasons={expert._reasons} />
                ))}
              </div>
            </section>
          )}

          {searched && sorted.length === 0 && (
            <section className="card p-8 text-center">
              <p className="text-3xl mb-2">🔎</p>
              <h3 className="mb-1">No expert matches yet</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">Try a more specific project description, domain, or expected outcome.</p>
              <button className="btn-secondary" onClick={() => setText(EXAMPLES[0])}>Use an example prompt</button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
