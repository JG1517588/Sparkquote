import { useCallback, useEffect, useState } from 'react';
import type { Job, Settings } from '@/types';
import { DEFAULT_SETTINGS, EMPTY_PARSED, emptyQuote } from '@/types';
import { loadJobs, loadSettings, saveJobs, saveSettings, uid } from '@/lib/storage';

export function useStore() {
  const [jobs, setJobs] = useState<Job[]>(() => loadJobs());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  useEffect(() => {
    saveJobs(jobs);
  }, [jobs]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const createJob = useCallback((): Job => {
    const now = new Date().toISOString();
    const job: Job = {
      id: uid(),
      createdAt: now,
      updatedAt: now,
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      jobAddress: '',
      jobType: 'New Build',
      jobDescription: '',
      files: [],
      aiPrompt: '',
      aiResponse: '',
      parsed: { ...EMPTY_PARSED },
      quote: emptyQuote(settings),
      notes: '',
      status: 'Draft',
    };
    return job;
  }, [settings]);

  const addJob = useCallback((job: Job) => {
    setJobs((prev) => [job, ...prev]);
  }, []);

  const updateJob = useCallback((id: string, patch: Partial<Job>) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id ? { ...j, ...patch, updatedAt: new Date().toISOString() } : j,
      ),
    );
  }, []);

  const deleteJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  const getJob = useCallback((id: string) => jobs.find((j) => j.id === id), [jobs]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

  return {
    jobs,
    settings,
    createJob,
    addJob,
    updateJob,
    deleteJob,
    getJob,
    updateSettings,
    resetSettings,
  };
}

export type Store = ReturnType<typeof useStore>;
