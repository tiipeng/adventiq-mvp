import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { labsApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function LabProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [lab, setLab]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    labsApi.get(id).then(r => setLab(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Lab not found.</p>
          <Link to="/labs" className="btn-primary mt-4">Back to labs</Link>
        </div>
      </div>
    );
  }

  const availDates = Object.keys(lab.availability_json || {}).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="text-sm text-gray-400 mb-6 flex gap-2 items-center">
          <Link to="/labs" className="hover:text-primary-600">Labs</Link>
          <span>/</span>
          <span className="text-gray-600">{lab.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="card p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-4xl">🔬</div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{lab.name}</h1>
                  <p className="text-gray-500 flex items-center gap-2 mb-3">
                    <span>📍</span>{lab.location || 'Location not set'}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    {lab.rating > 0 && (
                      <span className="flex items-center gap-1 text-yellow-600 font-medium">
                        ⭐ {lab.rating} <span className="text-gray-400 font-normal">({lab.reviews_count} reviews)</span>
                      </span>
                    )}
                    <span className="text-gray-400">Member since {new Date(lab.member_since).getFullYear()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">€{lab.price_per_day}</p>
                  <p className="text-sm text-gray-400">per day</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-3">About this Lab</h2>
              <p className="text-gray-600 leading-relaxed">{lab.description || 'No description provided.'}</p>
            </div>

            {/* Services */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Available Services</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {(lab.services_json || []).map(svc => (
                  <div key={svc} className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg border border-green-100">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                    <span className="text-sm text-green-800">{svc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Upcoming Available Days</h2>
              {availDates.length === 0 ? (
                <p className="text-gray-400 text-sm">No availability set yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availDates.slice(0, 12).map(date => (
                    <div key={date} className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 font-medium">
                      {new Date(date + 'T12:00:00').toLocaleDateString('en-DE', { weekday: 'short', day: '2-digit', month: 'short' })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking sidebar */}
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Rent this Lab</h3>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Daily rate</span>
                  <span className="font-semibold text-green-600">€{lab.price_per_day}/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="text-gray-700">{lab.location || '–'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Available days</span>
                  <span className="text-gray-700">{availDates.length} days</span>
                </div>
              </div>

              {user?.role === 'business' ? (
                <Link to={`/book/lab/${lab.id}`} className="inline-flex items-center justify-center w-full px-4 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors">
                  Book Lab →
                </Link>
              ) : user ? (
                <p className="text-xs text-gray-400 text-center">Only business accounts can make bookings.</p>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="btn-primary w-full justify-center">Sign in to book</Link>
                  <Link to="/register" className="btn-secondary w-full justify-center">Create account</Link>
                </div>
              )}
              <p className="text-xs text-gray-400 text-center mt-3">No payment charged until confirmed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
