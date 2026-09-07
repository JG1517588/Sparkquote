import { useMemo, useState } from 'react';
import { Users, Search, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import type { Job } from '@/types';
import { navigate, type Route } from '@/lib/router';
import { PageHeader } from '@/components/PageHeader';
import { Disclaimer } from '@/components/Disclaimer';

interface Props {
  jobs: Job[];
  onNavigate: (route: Route) => void;
}

interface Customer {
  name: string;
  phone: string;
  email: string;
  jobCount: number;
  latestJobId: string;
  addresses: string[];
}

export function CustomersList({ jobs, onNavigate }: Props) {
  const [query, setQuery] = useState('');

  const go = (r: Route) => {
    navigate(r);
    onNavigate(r);
  };

  const customers = useMemo(() => {
    const map = new Map<string, Customer>();
    for (const job of jobs) {
      const key = job.customerEmail || job.customerName || 'Unknown';
      const existing = map.get(key);
      if (existing) {
        existing.jobCount += 1;
        if (job.jobAddress && !existing.addresses.includes(job.jobAddress)) {
          existing.addresses.push(job.jobAddress);
        }
        existing.latestJobId = job.id;
      } else {
        map.set(key, {
          name: job.customerName || 'Unknown',
          phone: job.customerPhone,
          email: job.customerEmail,
          jobCount: 1,
          latestJobId: job.id,
          addresses: job.jobAddress ? [job.jobAddress] : [],
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [jobs]);

  const filtered = customers.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} ${customers.length === 1 ? 'customer' : 'customers'}`}
        icon={<Users className="h-5 w-5" />}
      />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-10"
          placeholder="Search by name, email or phone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center px-5 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Users className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-600">
            {customers.length === 0 ? 'No customers yet' : 'No customers match your search'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Customers are created automatically when you add a job.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <button
              key={c.email || c.name}
              onClick={() => go({ name: 'job', id: c.latestJobId })}
              className="card group p-4 text-left transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
                  {initials(c.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500">
                    {c.jobCount} {c.jobCount === 1 ? 'job' : 'jobs'}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
              </div>
              <dl className="mt-3 space-y-1.5 text-xs text-slate-600">
                {c.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{c.phone}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
                {c.addresses.length > 0 && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{c.addresses[0]}</span>
                  </div>
                )}
              </dl>
            </button>
          ))}
        </div>
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
