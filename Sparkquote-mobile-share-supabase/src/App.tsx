import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Toast } from '@/components/Toast';
import { useStore } from '@/hooks/useStore';
import { parseHash, type Route } from '@/lib/router';
import { Dashboard } from '@/views/Dashboard';
import { NewJobForm } from '@/views/NewJobForm';
import { JobsList } from '@/views/JobsList';
import { CustomersList } from '@/views/CustomersList';
import { SettingsView } from '@/views/SettingsView';
import { JobDetail } from '@/views/JobDetail';
import { PublicQuoteView } from '@/views/PublicQuoteView';
import type { Job } from '@/types';

function App() {
  const store = useStore();
  const [route, setRoute] = useState<Route>(() => parseHash());
  const [draft, setDraft] = useState<Job | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleNavigate = (r: Route) => setRoute(r);

  // Manage the "new job" draft
  useEffect(() => {
    if (route.name === 'new-job' && !draft) {
      setDraft(store.createJob());
    }
    if (route.name !== 'new-job' && draft) {
      setDraft(null);
    }
  }, [route, draft, store]);

  const renderContent = () => {
    switch (route.name) {
      case 'dashboard':
        return <Dashboard jobs={store.jobs} settings={store.settings} onNavigate={handleNavigate} />;

      case 'new-job': {
        if (!draft) return null;
        return (
          <NewJobForm
            draft={draft}
            onChange={(patch) => setDraft({ ...draft, ...patch })}
            onSave={() => {
              store.addJob(draft);
              const id = draft.id;
              setDraft(null);
              setRoute({ name: 'job', id });
              window.location.hash = `#/job/${id}`;
              showToast('Job created');
            }}
            onNavigate={handleNavigate}
          />
        );
      }

      case 'jobs':
        return (
          <JobsList
            jobs={store.jobs}
            onNavigate={handleNavigate}
            onDelete={(id) => {
              store.deleteJob(id);
              showToast('Job deleted');
            }}
          />
        );

      case 'customers':
        return <CustomersList jobs={store.jobs} onNavigate={handleNavigate} />;

      case 'settings':
        return (
          <SettingsView
            settings={store.settings}
            onChange={store.updateSettings}
            onReset={() => {
              store.resetSettings();
              showToast('Settings reset to defaults');
            }}
          />
        );

      case 'job': {
        const job = store.getJob(route.id);
        if (!job) {
          return (
            <div className="card mx-auto mt-12 max-w-md p-8 text-center">
              <p className="text-sm font-medium text-slate-600">Job not found.</p>
              <button
                onClick={() => handleNavigate({ name: 'jobs' })}
                className="btn-primary mt-4"
              >
                Back to Jobs
              </button>
            </div>
          );
        }
        return (
          <JobDetail
            job={job}
            settings={store.settings}
            onChange={(patch) => {
              store.updateJob(job.id, patch);
              if (patch.status) showToast(`Job marked as ${patch.status}`);
            }}
            onDelete={() => {
              store.deleteJob(job.id);
              setRoute({ name: 'jobs' });
              window.location.hash = '#/jobs';
              showToast('Job deleted');
            }}
            onNavigate={handleNavigate}
          />
        );
      }
      case 'public-quote':
        return <PublicQuoteView token={route.token} />;
    }
  };

  if (route.name === 'public-quote') return renderContent();
  return (
    <>
      <AppShell current={route} onNavigate={handleNavigate}>
        {renderContent()}
      </AppShell>
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}

export default App;
