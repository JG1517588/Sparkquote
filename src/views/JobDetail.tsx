import { useState } from 'react';
import { ArrowLeft, Briefcase, ClipboardList, Sparkles, FileText, StickyNote, Trash2 } from 'lucide-react';
import type { Job, Settings } from '@/types';
import { navigate, type Route } from '@/lib/router';
import { PageHeader } from '@/components/PageHeader';
import { Disclaimer } from '@/components/Disclaimer';
import { JobInfoTab } from '@/views/job/JobInfoTab';
import { PromptTab } from '@/views/job/PromptTab';
import { ResponseTab } from '@/views/job/ResponseTab';
import { QuoteTab } from '@/views/job/QuoteTab';
import { NotesTab } from '@/views/job/NotesTab';

interface Props {
  job: Job;
  settings: Settings;
  onChange: (patch: Partial<Job>) => void;
  onDelete: () => void;
  onNavigate: (route: Route) => void;
}

type Tab = 'info' | 'prompt' | 'response' | 'quote' | 'notes';

const TABS: { key: Tab; label: string; icon: typeof Briefcase }[] = [
  { key: 'info', label: 'Job Info', icon: Briefcase },
  { key: 'prompt', label: 'AI Prompt', icon: Sparkles },
  { key: 'response', label: 'AI Response', icon: ClipboardList },
  { key: 'quote', label: 'Quote', icon: FileText },
  { key: 'notes', label: 'Notes', icon: StickyNote },
];

export function JobDetail({ job, settings, onChange, onDelete, onNavigate }: Props) {
  const [tab, setTab] = useState<Tab>('info');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const goBack = () => {
    navigate({ name: 'jobs' });
    onNavigate({ name: 'jobs' });
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={job.customerName || 'Unnamed Job'}
        subtitle={`${job.jobType} · ${job.jobAddress || 'No address'}`}
        icon={<Briefcase className="h-5 w-5" />}
        actions={
          <>
            <button onClick={goBack} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {confirmDelete ? (
              <>
                <button onClick={() => setConfirmDelete(false)} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleDelete} className="btn-danger">
                  <Trash2 className="h-4 w-4" /> Confirm Delete
                </button>
              </>
            ) : (
              <button onClick={handleDelete} className="btn-secondary text-red-600 ring-red-200 hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            )}
          </>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-white p-1.5 shadow-card ring-1 ring-slate-200/70">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'info' && <JobInfoTab job={job} onChange={onChange} />}
      {tab === 'prompt' && <PromptTab job={job} onChange={onChange} />}
      {tab === 'response' && <ResponseTab job={job} onChange={onChange} />}
      {tab === 'quote' && <QuoteTab job={job} settings={settings} onChange={onChange} />}
      {tab === 'notes' && <NotesTab job={job} onChange={onChange} />}

      <Disclaimer />
    </div>
  );
}
