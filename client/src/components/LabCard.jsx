import React from 'react';
import { Link } from 'react-router-dom';

export default function LabCard({ lab }) {
  const services = lab.services_json || [];
  const certs    = lab.certifications_json || [];

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
          🔬
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 leading-snug">{lab.name}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <span>📍</span> {lab.location || 'Location not set'}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-base font-bold text-green-600">€{lab.price_per_day}/day</p>
          {lab.hourly_rate > 0 && <p className="text-xs text-gray-400">€{lab.hourly_rate}/hr</p>}
          {lab.rating > 0 && (
            <p className="text-xs text-yellow-600 flex items-center gap-1 justify-end mt-0.5">
              ⭐ {lab.rating} <span className="text-gray-400">({lab.reviews_count})</span>
            </p>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lab.description || 'No description provided.'}</p>

      {/* Certifications */}
      {certs.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {certs.slice(0, 2).map(c => (
            <span key={c} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">
              🛡 {c}
            </span>
          ))}
          {certs.length > 2 && <span className="text-xs text-gray-400">+{certs.length - 2} certs</span>}
        </div>
      )}

      {/* Capacity */}
      {lab.capacity > 0 && (
        <p className="text-xs text-gray-400 mb-3">👥 Capacity: {lab.capacity} researchers</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {services.slice(0, 3).map(svc => (
          <span key={svc} className="badge-green">{svc}</span>
        ))}
        {services.length > 3 && (
          <span className="badge-gray">+{services.length - 3} more</span>
        )}
      </div>

      <div className="flex gap-2">
        <Link to={`/labs/${lab.id}`} className="btn-secondary flex-1 text-center text-sm">
          View Details
        </Link>
        <Link to={`/book/lab/${lab.id}`} className="btn-primary flex-1 text-center text-sm">
          Book Lab
        </Link>
      </div>
    </div>
  );
}
