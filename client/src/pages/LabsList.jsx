import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LabCard from '../components/LabCard';
import { labsApi } from '../utils/api';

const SERVICE_OPTIONS = ['Semiconductor Fabrication', 'MEMS Development', 'Protein Analysis', 'Cell Culture', 'Nano-patterning', 'Flow Cytometry'];

export default function LabsList() {
  const [labs, setLabs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', min_price: '', max_price: '', location: '', service: '' });

  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    setLoading(true);
    labsApi.list(params).then(r => setLabs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [filters]);

  function setFilter(key, val) {
    setFilters(f => ({ ...f, [key]: val }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lab Rentals</h1>
          <p className="text-gray-500">University-grade laboratory facilities available for short-term rental.</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="card p-5 sticky top-24 space-y-5">
              <h3 className="font-semibold text-gray-900">Filters</h3>

              <div>
                <label className="label">Search</label>
                <input type="text" className="input" placeholder="Lab name, service…" value={filters.search} onChange={e => setFilter('search', e.target.value)} />
              </div>

              <div>
                <label className="label">Location</label>
                <input type="text" className="input" placeholder="Munich, Warsaw…" value={filters.location} onChange={e => setFilter('location', e.target.value)} />
              </div>

              <div>
                <label className="label">Price per day (€)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" className="input" placeholder="Min" value={filters.min_price} onChange={e => setFilter('min_price', e.target.value)} />
                  <input type="number" className="input" placeholder="Max" value={filters.max_price} onChange={e => setFilter('max_price', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label">Services</label>
                <div className="space-y-1.5">
                  {SERVICE_OPTIONS.map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="service"
                        checked={filters.service === opt}
                        onChange={() => setFilter('service', filters.service === opt ? '' : opt)}
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={() => setFilters({ search: '', min_price: '', max_price: '', location: '', service: '' })} className="btn-secondary w-full text-sm">
                Clear filters
              </button>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {loading ? 'Searching…' : `${labs.length} lab${labs.length !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1,2].map(i => (
                  <div key={i} className="card p-5 animate-pulse">
                    <div className="flex gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : labs.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-4xl mb-3">🔬</p>
                <p className="text-gray-500">No labs found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {labs.map(l => <LabCard key={l.id} lab={l} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
