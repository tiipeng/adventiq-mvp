import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ExpertCard({ expert, matchScore, matchReasons }) {
  const { user } = useAuth();
  const tags = expert.expertise_tags || [];

  return (
    <div className="card p-5 hover:shadow-md transition-shadow relative">
      {/* Match score badge */}
      {matchScore != null && (
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold border border-primary-200">
            🎯 {matchScore}% match
          </span>
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">{expert.name?.charAt(0)}</span>
          </div>
          {expert.verified ? (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs" title="Verified Expert">✓</span>
          ) : null}
        </div>
        <div className="flex-1 min-w-0 pr-20">
          <h3 className="font-semibold text-gray-900 truncate">{expert.name}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <span>📍</span> {expert.location || 'Location not set'}
          </p>
        </div>
      </div>

      {/* Credibility row */}
      {(expert.publications > 0 || expert.industry_projects > 0 || expert.avg_response_time) && (
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
          {expert.publications > 0 && <span title="Publications">📄 {expert.publications} papers</span>}
          {expert.industry_projects > 0 && <span title="Industry projects">🏭 {expert.industry_projects} projects</span>}
          {expert.avg_response_time && <span title="Avg response time">⚡ {expert.avg_response_time} response</span>}
          {expert.success_rate > 0 && <span title="Success rate" className="text-green-600 font-medium">✅ {expert.success_rate}%</span>}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-lg font-bold text-primary-600">€{expert.hourly_rate}/hr</p>
        {expert.rating > 0 && (
          <p className="text-sm text-yellow-600 flex items-center gap-1">
            ⭐ {expert.rating} <span className="text-gray-400 text-xs">({expert.reviews_count})</span>
          </p>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{expert.bio || 'No bio provided.'}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags.slice(0, 4).map(tag => (
          <span key={tag} className="badge-blue">{tag}</span>
        ))}
        {tags.length > 4 && (
          <span className="badge-gray">+{tags.length - 4} more</span>
        )}
      </div>

      {/* Match reasons */}
      {matchReasons?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {matchReasons.map(r => (
            <span key={r} className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs border border-green-200">{r}</span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Link to={`/experts/${expert.id}`} className="btn-secondary flex-1 text-center text-sm">
          View Profile
        </Link>
        {user?.role === 'business' && (
          <Link to={`/async/${expert.id}`} className="btn-secondary text-sm px-3 text-center" title="Ask async question">
            ✉ Ask
          </Link>
        )}
        <Link to={`/book/expert/${expert.id}`} className="btn-primary flex-1 text-center text-sm">
          Book Now
        </Link>
      </div>
    </div>
  );
}
