import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { getLabImage } from '../utils/imageAssets';
import SmartImage from './ui/SmartImage';

export default function LabCard({ lab }) {
  const services = lab?.services_json ?? [];

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col p-5">
        <SmartImage
          src={getLabImage(lab)}
          alt={`${lab?.name || 'Laboratory'} photo`}
          fallbackLabel="Laboratory"
          className="mb-4 h-36 w-full rounded-xl object-cover shadow-[var(--shadow-2)]"
          loading="lazy"
          decoding="async"
        />

        <div className="mb-3 flex min-h-[72px] items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="line-clamp-2 text-[16px] font-semibold leading-tight text-[var(--text-primary)]">{lab?.name}</p>
            <p className="text-[13px] text-[var(--text-muted)]">{lab?.location || 'University lab'}</p>
          </div>
          <span className="w-[148px] shrink-0 text-right font-semibold text-[var(--accent)]">EUR {lab?.price_per_day}/day</span>
        </div>

        <div className="mb-4 flex min-h-[58px] flex-wrap content-start gap-1.5">
          {services.slice(0, 3).map((service) => <span key={service} className="badge-blue">{service}</span>)}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Link to={`/labs/${lab.id}`} className="btn-secondary text-sm">View Lab</Link>
          <Link to={`/book/lab/${lab.id}`} className="btn-primary text-sm">Book Lab</Link>
        </div>
      </CardContent>
    </Card>
  );
}
