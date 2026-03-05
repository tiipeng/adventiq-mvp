import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LabCard from '../components/LabCard';
import { labsApi } from '../utils/api';
import { MOCK_LABS } from '../utils/mockData';

// Leaflet imports (loaded lazily to avoid SSR issues)
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon for Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createLabIcon(color = '#16a34a') {
  return L.divIcon({
    html: `<div style="
      width:36px;height:36px;background:${color};border:3px solid white;
      border-radius:50% 50% 50% 0;transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);font-size:16px;display:block;text-align:center;line-height:30px;">🔬</span></div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

const SERVICE_OPTIONS = [
  'Semiconductor Fabrication', 'MEMS Development', 'Protein Analysis', 'Cell Culture',
  'Nano-patterning', 'Flow Cytometry', 'MEMS Fabrication', 'Nanomaterial Synthesis',
  'Thin Film Deposition', 'Sensor Development',
];

const CITY_OPTIONS = ['Munich', 'Warsaw', 'Dresden', 'Kraków', 'Berlin'];

function FitBounds({ labs }) {
  const map = useMap();
  useEffect(() => {
    const withCoords = labs.filter(l => l.lat && l.lng);
    if (withCoords.length > 0) {
      const bounds = withCoords.map(l => [l.lat, l.lng]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [labs, map]);
  return null;
}

export default function LabsList() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('map'); // 'list' | 'map'
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({ search: '', min_price: '', max_price: '', location: '', service: '', city: '' });
  const [selectedLab, setSelectedLab] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([k, v]) => v !== '' && k !== 'city'));
    if (filters.city) params.location = filters.city;
    setLoading(true);
    labsApi.list(params)
      .then(response => {
        const labs = response?.data ?? MOCK_LABS;
        setLabs(Array.isArray(labs) ? labs : MOCK_LABS);
      })
      .catch(() => setLabs(MOCK_LABS))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    function onFocusSearch() {
      searchInputRef.current?.focus();
    }
    window.addEventListener('focus-page-search', onFocusSearch);
    return () => window.removeEventListener('focus-page-search', onFocusSearch);
  }, []);

  function setFilter(key, val) {
    setFilters(f => ({ ...f, [key]: val }));
  }

  function clearFilters() {
    setFilters({ search: '', min_price: '', max_price: '', location: '', service: '', city: '' });
  }

  const activeFilters = useMemo(() => (
    Object.entries(filters)
      .filter(([, value]) => String(value).trim() !== '')
      .map(([key, value]) => ({ key, label: `${key.replace('_', ' ')}: ${value}` }))
  ), [filters]);

  const mapLabs = labs.filter(l => l.lat && l.lng);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar />
      <div className="container-app py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="mb-1">Lab Rentals</h1>
            <p className="text-[var(--text-muted)]">University-grade laboratory facilities across Germany & Poland.</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {loading ? 'Searching…' : `${labs.length} lab${labs.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/labs/calendar" className="btn-secondary text-sm flex items-center gap-1.5">
              Calendar View
            </Link>
            <div className="flex rounded-[10px] border border-[var(--border)] overflow-hidden">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'list' ? 'bg-[var(--accent)] text-white' : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'}`}
              >
                List
              </button>
              <button
                onClick={() => setView('map')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'map' ? 'bg-[var(--accent)] text-white' : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'}`}
              >
                Map
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
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
                  placeholder="Lab name, service..."
                  value={filters.search}
                  onChange={e => setFilter('search', e.target.value)}
                />
              </div>

              <div>
                <label className="label">City</label>
                <div className="space-y-1.5">
                  {CITY_OPTIONS.map(city => (
                    <label key={city} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="city"
                        checked={filters.city === city}
                        onChange={() => setFilter('city', filters.city === city ? '' : city)}
                      />
                      <span className="text-sm text-[var(--text-secondary)]">{city}</span>
                    </label>
                  ))}
                </div>
              </div>

              {showAdvanced ? (
                <>
                  <div>
                    <label className="label">Price per day (€)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" className="input" placeholder="Min" value={filters.min_price} onChange={e => setFilter('min_price', e.target.value)} />
                      <input type="number" className="input" placeholder="Max" value={filters.max_price} onChange={e => setFilter('max_price', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="label">Equipment type</label>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {SERVICE_OPTIONS.map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="service"
                            checked={filters.service === opt}
                            onChange={() => setFilter('service', filters.service === opt ? '' : opt)}
                          />
                          <span className="text-sm text-[var(--text-secondary)]">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              <button onClick={clearFilters} className="btn-secondary w-full text-sm">
                Clear all filters
              </button>
            </div>
          </aside>

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

            {view === 'map' && (
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-[var(--border)] shadow-sm" style={{ height: 480 }}>
                  {typeof window !== 'undefined' && (
                    <MapContainer
                      center={[51.5, 16.0]}
                      zoom={5}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <FitBounds labs={mapLabs} />
                      {mapLabs.map(lab => (
                        <Marker
                          key={lab.id}
                          position={[lab.lat, lab.lng]}
                          icon={createLabIcon(selectedLab?.id === lab.id ? '#7c3aed' : '#16a34a')}
                          eventHandlers={{ click: () => setSelectedLab(lab) }}
                        >
                          <Popup maxWidth={260}>
                            <div className="py-1">
                              <p className="font-semibold text-[var(--text-primary)] text-sm mb-1">{lab.name}</p>
                              <p className="text-xs text-[var(--text-muted)] mb-1">📍 {lab.location}</p>
                              <p className="text-xs text-[var(--text-secondary)] mb-2 line-clamp-2">{lab.description}</p>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {(lab.services_json || []).slice(0, 2).map(s => (
                                  <span key={s} className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">{s}</span>
                                ))}
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-green-700">€{lab.price_per_day}/day</span>
                                {lab.rating > 0 && <span className="text-xs">⭐ {lab.rating}</span>}
                              </div>
                              <a
                                href={`/labs/${lab.id}`}
                                className="block w-full text-center py-1.5 px-3 bg-[var(--accent)] text-white text-xs font-medium rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                              >
                                Book Lab
                              </a>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  )}
                </div>

                {selectedLab && (
                  <div className="card p-4 border-l-4 border-green-500">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">{selectedLab.name}</h3>
                        <p className="text-sm text-[var(--text-muted)]">{selectedLab.location} · €{selectedLab.price_per_day}/day</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/labs/${selectedLab.id}`} className="btn-secondary text-sm">Details</Link>
                        <Link to={`/book/lab/${selectedLab.id}`} className="btn-primary text-sm">Book Lab</Link>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-3">
                  {labs.map(lab => (
                    <button
                      key={lab.id}
                      onClick={() => { setSelectedLab(lab); }}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${selectedLab?.id === lab.id ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border)] bg-white hover:border-[var(--border-strong)]'}`}
                    >
                      <p className="font-medium text-sm text-[var(--text-primary)]">{lab.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{lab.city || lab.location} · €{lab.price_per_day}/day</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {view === 'list' && (
              <>
                {loading ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="card p-5">
                        <div className="flex gap-3 mb-3">
                          <div className="w-12 h-12 skeleton rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 skeleton w-3/4" />
                            <div className="h-3 skeleton w-1/2" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 skeleton" />
                          <div className="h-3 skeleton w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : labs.length === 0 ? (
                  <div className="card p-12 text-center">
                    <p className="text-4xl mb-3">🔬</p>
                    <p className="text-[var(--text-muted)] mb-4">No labs found matching your criteria.</p>
                    <button onClick={clearFilters} className="btn-primary">Clear filters</button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {labs.map(l => <LabCard key={l.id} lab={l} />)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
