import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  step?: number;
}

export function SectionCard({ title, description, children, actions, className, step }: Props) {
  return (
    <section className={`card p-5 sm:p-6 ${className ?? ''}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {step !== undefined && (
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {step}
            </span>
          )}
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
