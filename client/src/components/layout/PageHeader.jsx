import React from 'react';

export default function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {title ? <h1>{title}</h1> : null}
        {description ? <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
