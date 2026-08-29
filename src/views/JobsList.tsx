import { useState } from 'react';
import { Briefcase, PlusCircle, Search, MapPin, ArrowRight, Trash2 } from 'lucide-react';
import type { Job } from '@/types';
import { formatDate } from '@/lib/quote';
import { navigate, type Route } from '@/lib/router';
import { PageHeader } from '@/components/PageHeader';
import { Disclaimer } from '@/components/Disclaimer';

interface Props {
  jobs: Job[];
  onNavigate: (route: Route) => void;
  onDelete: (id: string) => void;
}

export function JobsList({ jobs, onNavigate, onDelete }: Props) {
  const [query, setQuery] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const go = (r: Route) => {
    navigate(r);
    onNavigate(r);
  };

  const filtered = jobs.filter((j) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      j.customerName.toLowerCase().includes(q) ||
      j.jobAddress.toLowerCase().includes(q) ||
      j.jobType.toLowerCase().includes(q) ||
      j.customerEmail.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        subtitle={`${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} in total`}
        icon={<Briefcase className="h-5 w-5" />}
        actions={
          <button onClick={() => go({ name: 'new-job' })} className="btn-primary">
            <PlusCircle className="h-4 w-4" /> New Job
          </button>
        }
      />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-10"
          placeholder="Search by customer, address, type or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center px-5 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Briefcase className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-600">
            {jobs.length === 0 ? 'No jobs yet' : 'No jobs match your search'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {jobs.length === 0 ? 'Create a new job to get started.' : 'Try a different search term.'}
          </p>
          {jobs.length === 0 && (
            <button onClick={() => go({ name: 'new-job' })} className="btn-primary mt-4">
              <PlusCircle className="h-4 w-4" /> New Job
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((job) => (
            <li key={job.id} className="card group relative overflow-hidden transition-shadow hover:shadow-card-hover">
              <div className="flex items-stretch">
                <button
                  onClick={() => go({ name: 'job', id: job.id })}
                  className="flex flex-1 items-center gap-4 p-4 text-left"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
                    {initials(job.customerName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold text-slate-900">
                        {job.customerName || 'Unnamed customer'}
                      </span>
                      <StatusBadge status={job.status} />
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {job.jobType}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {job.jobAddress || 'No address'}
                      </span>
                      <span>{formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </button>
                <div className="flex items-center border-l border-slate-100 px-2">
                  {confirmId === job.id ? (
                    <div className="flex flex-col gap-1 py-2">
                      <button
                        onClick={() => {
                          onDelete(job.id);
                          setConfirmId(null);
                        }}
                        className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="rounded px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(job.id)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete job"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Disclaimer />
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StatusBadge({ status }: { status: Job['status'] }) {
  const styles: Record<Job['status'], string> = {
    Draft: 'bg-slate-100 text-slate-600',
    Prompted: 'bg-blue-50 text-blue-700',
    Analysed: 'bg-amber-50 text-amber-700',
    Quoted: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
