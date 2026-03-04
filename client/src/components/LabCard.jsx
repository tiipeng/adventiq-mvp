import React from 'react';
import { Link } from 'react-router-dom';

export default function LabCard({ lab }) {
  const services = lab.services_json || [];

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl">🔬</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{lab.name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span>📍</span> {lab.location || 'Location not set'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">€{lab.price_per_day}/day</p>
          {lab.rating > 0 && (
            <p className="text-sm text-yellow-600 flex items-center gap-1 justify-end">
              ⭐ {lab.rating} ({lab.reviews_count})
            </p>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lab.description || 'No description provided.'}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {services.slice(0, 4).map(svc => (
          <span key={svc} className="badge-green">{svc}</span>
        ))}
        {services.length > 4 && (
          <span className="badge-gray">+{services.length - 4} more</span>
        )}
      </div>

      <div className="flex gap-2">
        <Link to={`/labs/${lab.id}`} className="btn-secondary flex-1 text-center text-sm">
          View Profile
        </Link>
        <Link to={`/book/lab/${lab.id}`} className="btn-primary flex-1 text-center text-sm">
          Book Now
        </Link>
      </div>
    </div>
  );
}
