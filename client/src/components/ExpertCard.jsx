import React from 'react';
import { Link } from 'react-router-dom';

export default function ExpertCard({ expert, matchScore, matchReasons = [] }) {
  const tags = expert?.expertise_tags ?? [];

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center font-semibold text-base">
            {expert?.name?.charAt(0) ?? 'E'}
          </div>
          <div className="min-w-0">
            <p className="text-[16px] font-semibold text-[var(--text-primary)] leading-tight truncate">{expert?.name}</p>
            <p className="text-[13px] text-[var(--text-muted)] truncate">{expert?.location || 'University partner'}</p>
          </div>
        </div>
        {matchScore != null ? <span className="badge-blue">{matchScore}% Match</span> : null}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags.slice(0, 3).map((tag) => <span key={tag} className="badge-blue">{tag}</span>)}
      </div>

      {matchReasons.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {matchReasons.slice(0, 3).map((reason) => <span key={reason} className="badge-gray">{reason}</span>)}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[var(--text-muted)]">⭐ {expert?.rating ?? 4.8}</span>
        <span className="text-[var(--accent)] font-semibold">€{expert?.hourly_rate}/hr</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link to={`/book/expert/${expert.id}`} className="btn-primary text-sm">Book Now</Link>
        <Link to={`/fast-consult/${expert.id}`} className="btn-fast text-sm">Fast Consult</Link>
      </div>
      <div className="mt-2">
        <Link to={`/async/${expert.id}`} className="btn-secondary w-full text-sm">Ask Async</Link>
      </div>
    </div>
  );
}
