import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { getExpertImage } from '../utils/imageAssets';
import SmartImage from './ui/SmartImage';

export default function ExpertCard({ expert, matchScore, matchReasons = [] }) {
  const tags = expert?.expertise_tags ?? [];

  return (
    <Card className="group h-full">
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-3 flex min-h-[58px] items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <SmartImage
              src={getExpertImage(expert)}
              alt={`${expert?.name || 'Expert'} profile`}
              fallbackLabel="Expert Profile"
              className="h-12 w-12 rounded-full object-cover shadow-[var(--shadow-1)] ring-1 ring-[var(--border-strong)]"
              loading="lazy"
              decoding="async"
            />
            <div className="min-w-0">
              <p className="line-clamp-2 text-[16px] font-semibold leading-tight text-[var(--text-primary)]">{expert?.name}</p>
              <p className="truncate text-[13px] text-[var(--text-muted)]">{expert?.location || 'University partner'}</p>
            </div>
          </div>
          {matchScore != null ? <span className="badge-blue">{matchScore}% Match</span> : null}
        </div>

        <div className="mb-3 flex min-h-[58px] flex-wrap content-start gap-1.5">
          {tags.slice(0, 3).map((tag) => <span key={tag} className="badge-blue">{tag}</span>)}
        </div>

        {matchReasons.length > 0 ? (
          <div className="mb-3 flex min-h-[30px] flex-wrap content-start gap-1.5">
            {matchReasons.slice(0, 3).map((reason) => <span key={reason} className="badge-gray">{reason}</span>)}
          </div>
        ) : null}

        <div className="mb-4 mt-auto flex min-h-[32px] items-end justify-between">
          <span className="text-sm text-[var(--text-muted)]">{expert?.rating ?? 4.8} rating</span>
          <span className="w-[138px] text-right font-semibold text-[var(--accent)]">EUR {expert?.hourly_rate}/hr</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link to={`/book/expert/${expert.id}`} className="btn-primary text-sm">Book Now</Link>
          <Link to={`/fast-consult/${expert.id}`} className="btn-fast text-sm">Fast Consult</Link>
        </div>
        <div className="mt-2">
          <Link to={`/async/${expert.id}`} className="btn-secondary w-full text-sm">Ask Async</Link>
        </div>
      </CardContent>
    </Card>
  );
}
