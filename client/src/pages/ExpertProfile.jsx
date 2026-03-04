import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { expertsApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ExpertProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    expertsApi.get(id).then(r => setExpert(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Expert not found.</p>
          <Link to="/experts" className="btn-primary mt-4">Back to experts</Link>
        </div>
      </div>
    );
  }

  const availDates = Object.keys(expert.availability_json || {}).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex gap-2 items-center">
          <Link to="/experts" className="hover:text-primary-600">Experts</Link>
          <span>/</span>
          <span className="text-gray-600">{expert.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="card p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-3xl font-bold">{expert.name?.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{expert.name}</h1>
                  <p className="text-gray-500 flex items-center gap-2 mb-3">
                    <span>📍</span>{expert.location || 'Location not set'}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    {expert.rating > 0 && (
                      <span className="flex items-center gap-1 text-yellow-600 font-medium">
                        ⭐ {expert.rating} <span className="text-gray-400 font-normal">({expert.reviews_count} reviews)</span>
                      </span>
                    )}
                    <span className="text-gray-400">Member since {new Date(expert.member_since).getFullYear()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">€{expert.hourly_rate}</p>
                  <p className="text-sm text-gray-400">per hour</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-3">About</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{expert.bio || 'No bio provided.'}</p>
            </div>

            {/* Expertise */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Areas of Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {(expert.expertise_tags || []).map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium border border-primary-100">{tag}</span>
                ))}
              </div>
            </div>

            {/* Availability preview */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Upcoming Availability</h2>
              {availDates.length === 0 ? (
                <p className="text-gray-400 text-sm">No availability set yet.</p>
              ) : (
                <div className="space-y-2">
                  {availDates.slice(0, 5).map(date => {
                    const slots = expert.availability_json[date];
                    return (
                      <div key={date} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 w-28">
                          {new Date(date + 'T12:00:00').toLocaleDateString('en-DE', { weekday: 'short', day: '2-digit', month: 'short' })}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(slots) ? slots : Object.keys(slots)).slice(0, 6).map(slot => (
                            <span key={slot} className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600">{slot}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="space-y-4">
            <div className="card p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Book a Consultation</h3>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rate</span>
                  <span className="font-semibold">€{expert.hourly_rate}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="text-gray-700">{expert.location || '–'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Available slots</span>
                  <span className="text-gray-700">{availDates.length} dates</span>
                </div>
              </div>

              {user?.role === 'business' ? (
                <Link to={`/book/expert/${expert.id}`} className="btn-primary w-full justify-center text-base py-3">
                  Book Now →
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
