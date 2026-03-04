import React from 'react';
import { Link } from 'react-router-dom';

export default function ExpertCard({ expert }) {
  const tags = expert.expertise_tags || [];

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-lg">{expert.name?.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{expert.name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span>📍</span> {expert.location || 'Location not set'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary-600">€{expert.hourly_rate}/hr</p>
          {expert.rating > 0 && (
            <p className="text-sm text-yellow-600 flex items-center gap-1 justify-end">
              ⭐ {expert.rating} ({expert.reviews_count})
            </p>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{expert.bio || 'No bio provided.'}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {tags.slice(0, 4).map(tag => (
          <span key={tag} className="badge-blue">{tag}</span>
        ))}
        {tags.length > 4 && (
          <span className="badge-gray">+{tags.length - 4} more</span>
        )}
      </div>

      <div className="flex gap-2">
        <Link to={`/experts/${expert.id}`} className="btn-secondary flex-1 text-center text-sm">
          View Profile
        </Link>
        <Link to={`/book/expert/${expert.id}`} className="btn-primary flex-1 text-center text-sm">
          Book Now
        </Link>
      </div>
    </div>
  );
}
