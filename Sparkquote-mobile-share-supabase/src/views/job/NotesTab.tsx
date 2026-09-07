import { useState } from 'react';
import { StickyNote, Copy, Check } from 'lucide-react';
import type { Job } from '@/types';
import { useCopy } from '@/lib/useCopy';
import { SectionCard } from '@/components/SectionCard';

interface Props {
  job: Job;
  onChange: (patch: Partial<Job>) => void;
}

export function NotesTab({ job, onChange }: Props) {
  const copy = useCopy();
  const [copied, setCopied] = useState(false);

  const buildNotesForAi = () => {
    const lines: string[] = [];
    lines.push('JOB NOTES — for AI report generation');
    lines.push('');
    lines.push(`Customer: ${job.customerName || '—'}`);
    lines.push(`Address: ${job.jobAddress || '—'}`);
    lines.push(`Job type: ${job.jobType}`);
    lines.push(`Date: ${new Date().toLocaleDateString('en-AU')}`);
    lines.push('');
    lines.push('NOTES:');
    lines.push(job.notes || '(no notes entered)');
    lines.push('');
    lines.push('Please produce a professional job report from these notes, suitable for record-keeping and client communication. Use Australian English.');
    return lines.join('\n');
  };

  const handleCopy = async () => {
    const text = buildNotesForAi();
    const ok = await copy(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Job Notes"
        description="Type any site observations, conversations or reminders. Use Copy Job Notes to paste into an AI tool for a professional report."
        actions={
          <button onClick={handleCopy} disabled={!job.notes.trim()} className="btn-primary">
            {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy Job Notes'}
          </button>
        }
      >
        <textarea
          className="input min-h-[300px] resize-y"
          value={job.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="e.g. Attended site 14/03. Switchboard is old ceramic fuses — recommend upgrade to RCBO board. Customer wants downlights in living area and a ceiling fan in the main bedroom. Need to check roof space access for fan wiring."
        />
      </SectionCard>

      <SectionCard title="Copy Job Notes" description="A clean, formatted version ready to paste into an AI tool.">
        <pre className="max-h-[300px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 ring-1 ring-slate-200">
          {buildNotesForAi()}
        </pre>
      </SectionCard>
    </div>
  );
}
