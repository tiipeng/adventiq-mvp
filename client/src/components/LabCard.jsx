import React from 'react';
import { Link } from 'react-router-dom';

export default function LabCard({ lab }) {
  const services = lab?.services_json ?? [];

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[16px] font-semibold text-[var(--text-primary)] leading-tight">{lab?.name}</p>
          <p className="text-[13px] text-[var(--text-muted)]">{lab?.location || 'University lab'}</p>
        </div>
        <span className="text-[var(--accent)] font-semibold">€{lab?.price_per_day}/day</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {services.slice(0, 3).map((service) => <span key={service} className="badge-blue">{service}</span>)}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link to={`/labs/${lab.id}`} className="btn-secondary text-sm">View Lab</Link>
        <Link to={`/book/lab/${lab.id}`} className="btn-primary text-sm">Book Lab</Link>
      </div>
    </div>
  );
}
