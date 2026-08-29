import { PlusCircle, Briefcase, Users, Settings as SettingsIcon, ArrowRight, MapPin, Clock } from 'lucide-react';
import type { Job } from '@/types';
import type { Settings } from '@/types';
import { formatDate } from '@/lib/quote';
import { navigate, type Route } from '@/lib/router';
import { Disclaimer } from '@/components/Disclaimer';

interface Props {
  jobs: Job[];
  settings: Settings;
  onNavigate: (route: Route) => void;
}

export function Dashboard({ jobs, settings, onNavigate }: Props) {
  const go = (r: Route) => {
    navigate(r);
    onNavigate(r);
  };

  const recent = jobs.slice(0, 5);
  const customerCount = new Set(jobs.map((j) => j.customerEmail || j.customerName).filter(Boolean)).size;

  const stats = [
    { label: 'Total Jobs', value: jobs.length, icon: Briefcase, route: { name: 'jobs' } as Route },
    { label: 'Customers', value: customerCount, icon: Users, route: { name: 'customers' } as Route },
    { label: 'Quoted', value: jobs.filter((j) => j.status === 'Quoted').length, icon: Briefcase, route: { name: 'jobs' } as Route },
  ];

  const actions = [
    {
      label: 'New Job',
      desc: 'Start a new quote from scratch',
      icon: PlusCircle,
      route: { name: 'new-job' } as Route,
      accent: 'bg-brand-700 text-white hover:bg-brand-800',
    },
    {
      label: 'Jobs',
      desc: 'View and manage all jobs',
      icon: Briefcase,
      route: { name: 'jobs' } as Route,
      accent: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
    },
    {
      label: 'Customers',
      desc: 'Browse customer details',
      icon: Users,
      route: { name: 'customers' } as Route,
      accent: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
    },
    {
      label: 'Settings',
      desc: 'Business details & defaults',
      icon: SettingsIcon,
      route: { name: 'settings' } as Route,
      accent: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {settings.businessName ? `Welcome back, ${settings.businessName}` : 'Dashboard'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Analyse a job, organise an electrical scope of works, and prepare a quote.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              onClick={() => go(s.route)}
              className="card flex items-center gap-3 p-4 text-left transition-shadow hover:shadow-card-hover"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold leading-none text-slate-900">{s.value}</div>
                <div className="mt-1 text-xs font-medium text-slate-500">{s.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              onClick={() => go(a.route)}
              className={`group flex flex-col items-start gap-2 rounded-xl p-4 text-left transition-all active:scale-[0.98] ${a.accent}`}
            >
              <Icon className="h-6 w-6" />
              <div className="text-sm font-semibold">{a.label}</div>
              <div className="text-xs opacity-80">{a.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Recent jobs */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Recent Jobs</h2>
          {jobs.length > 0 && (
            <button
              onClick={() => go({ name: 'jobs' })}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              View all <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">No jobs yet</p>
            <p className="mt-1 text-xs text-slate-400">Create a new job to get started.</p>
            <button onClick={() => go({ name: 'new-job' })} className="btn-primary mt-4">
              <PlusCircle className="h-4 w-4" /> New Job
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((job) => (
              <li key={job.id}>
                <button
                  onClick={() => go({ name: 'job', id: job.id })}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                    {initials(job.customerName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-slate-900">
                        {job.customerName || 'Unnamed customer'}
                      </span>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {job.jobAddress || 'No address'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(job.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span className="hidden shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 sm:inline">
                    {job.jobType}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

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
