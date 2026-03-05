import React, { useMemo, useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import ExpertCard from '../components/ExpertCard';
import { expertsApi } from '../utils/api';
import { MOCK_EXPERTS } from '../utils/mockData';

const EXPERTISE_OPTIONS = ['Machine Learning', 'NLP', 'Computer Vision', 'Biomedical', 'Sustainability', 'Regulatory', 'Materials Science'];

export default function ExpertsList() {
  const [experts, setExperts]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ search: '', min_price: '', max_price: '', location: '', expertise: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    setLoading(true);
    expertsApi.list(params)
      .then(response => {
        const experts = response?.data ?? MOCK_EXPERTS;
        setExperts(Array.isArray(experts) ? experts : MOCK_EXPERTS);
      })
      .catch(() => setExperts(MOCK_EXPERTS))
      .finally(() => setLoading(false));
  }, [filters]);

  function setFilter(key, val) {
    setFilters(f => ({ ...f, [key]: val }));
  }

  function clearFilters() {
    setFilters({ search: '', min_price: '', max_price: '', location: '', expertise: '' });
  }

  const activeFilters = useMemo(() => {
    return Object.entries(filters)
      .filter(([, value]) => String(value).trim() !== '')
      .map(([key, value]) => ({ key, label: `${key.replace('_', ' ')}: ${value}` }));
  }, [filters]);

  useEffect(() => {
    function onFocusSearch() {
      searchInputRef.current?.focus();
    }
    window.addEventListener('focus-page-search', onFocusSearch);
    return () => window.removeEventListener('focus-page-search', onFocusSearch);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar />
      <div className="container-app py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Expert Consultants</h1>
          <p className="text-[var(--text-muted)]">Verified experts across AI, engineering, regulatory compliance, sustainability and more.</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {loading ? 'Searching…' : `${experts.length} expert${experts.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <aside className="lg:col-span-1">
            <div className="card p-5 sticky top-24 space-y-5">
              <div className="flex items-center justify-between">
                <h3>Filters</h3>
                <button type="button" className="btn-secondary text-xs" onClick={() => setShowAdvanced((v) => !v)}>
                  {showAdvanced ? 'Hide advanced' : 'Show advanced'}
                </button>
              </div>

              <div>
                <label className="label">Search</label>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="input"
                  placeholder="Name, skill, keyword…"
                  value={filters.search}
                  onChange={e => setFilter('search', e.target.value)}
                />
              </div>

              {showAdvanced ? (
                <>
                  <div>
                    <label className="label">Location</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Munich, Warsaw…"
                      value={filters.location}
                      onChange={e => setFilter('location', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="label">Hourly rate (€)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" className="input" placeholder="Min" value={filters.min_price} onChange={e => setFilter('min_price', e.target.value)} />
                      <input type="number" className="input" placeholder="Max" value={filters.max_price} onChange={e => setFilter('max_price', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="label">Expertise</label>
                    <div className="space-y-1.5">
                      {EXPERTISE_OPTIONS.map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="expertise"
                            className="text-primary-600"
                            checked={filters.expertise === opt}
                            onChange={() => setFilter('expertise', filters.expertise === opt ? '' : opt)}
                          />
                          <span className="text-sm text-[var(--text-secondary)]">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              <button
                onClick={clearFilters}
                className="btn-secondary w-full text-sm"
              >
                Clear filters
              </button>
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            {activeFilters.length > 0 ? (
              <div className="mb-4 flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    className="badge-gray"
                    onClick={() => setFilter(filter.key, '')}
                  >
                    {filter.label} ×
                  </button>
                ))}
                <button type="button" className="btn-ghost text-xs h-7 px-2" onClick={clearFilters}>Clear all</button>
              </div>
            ) : null}

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="card p-5">
                    <div className="flex gap-3 mb-3">
                      <div className="w-12 h-12 skeleton rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 skeleton w-3/4" />
                        <div className="h-3 skeleton w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 skeleton" />
                      <div className="h-3 skeleton w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : experts.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-[var(--text-muted)] mb-2">No experts found matching your criteria.</p>
                <button onClick={clearFilters} className="btn-secondary text-sm">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {experts.map(e => <ExpertCard key={e.id} expert={e} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
