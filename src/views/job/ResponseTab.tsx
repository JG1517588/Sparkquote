import { useState } from 'react';
import { ClipboardList, Wand2, Check, Copy, AlertCircle, FileText } from 'lucide-react';
import type { Job, ParsedSections } from '@/types';
import { parseResponse } from '@/lib/parse';
import { useCopy } from '@/lib/useCopy';
import { SectionCard } from '@/components/SectionCard';

interface Props {
  job: Job;
  onChange: (patch: Partial<Job>) => void;
}

const SECTION_META: { key: keyof ParsedSections; label: string; icon: typeof FileText }[] = [
  { key: 'scope', label: 'Electrical Scope of Works', icon: ClipboardList },
  { key: 'materials', label: 'Preliminary Materials List', icon: FileText },
  { key: 'verification', label: 'Site Verification Required', icon: AlertCircle },
  { key: 'safety', label: 'Safety / Compliance Considerations', icon: AlertCircle },
  { key: 'assumptions', label: 'Assumptions', icon: FileText },
  { key: 'review', label: 'Items Requiring Electrician Review', icon: AlertCircle },
];

export function ResponseTab({ job, onChange }: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = useCopy();

  const handleProcess = () => {
    if (!job.aiResponse.trim()) return;
    const parsed = parseResponse(job.aiResponse);
    onChange({ parsed, status: 'Analysed' });
  };

  const handleCopySection = async (key: keyof ParsedSections) => {
    const text = job.parsed[key];
    if (!text) return;
    const ok = await copy(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  const hasParsed = Object.values(job.parsed).some((v) => v.length > 0);

  return (
    <div className="space-y-6">
      <SectionCard
        title="Paste AI Response Here"
        description="Copy the response from your AI tool and paste it below, then click Process Response."
        actions={
          <button onClick={handleProcess} disabled={!job.aiResponse.trim()} className="btn-spark">
            <Wand2 className="h-4 w-4" /> Process Response
          </button>
        }
      >
        <textarea
          className="input min-h-[280px] resize-y font-mono text-xs leading-relaxed"
          value={job.aiResponse}
          onChange={(e) => onChange({ aiResponse: e.target.value })}
          placeholder="Paste the full AI response here..."
        />
      </SectionCard>

      {hasParsed ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Check className="h-4 w-4 text-emerald-500" />
            Response processed into the sections below.
          </div>

          {SECTION_META.map((meta) => {
            const Icon = meta.icon;
            const content = job.parsed[meta.key];
            const isEmpty = !content;
            return (
              <SectionCard
                key={meta.key}
                title={meta.label}
                actions={
                  <button
                    onClick={() => handleCopySection(meta.key)}
                    disabled={isEmpty}
                    className="btn-ghost px-2.5 py-1.5 text-xs"
                  >
                    {copiedKey === meta.key ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedKey === meta.key ? 'Copied' : 'Copy'}
                  </button>
                }
              >
                {isEmpty ? (
                  <p className="text-sm italic text-slate-400">
                    No content found for this section in the AI response.
                  </p>
                ) : (
                  <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
                    {content}
                  </pre>
                )}
              </SectionCard>
            );
          })}
        </div>
      ) : (
        <SectionCard title="Organised Sections">
          <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
            <Wand2 className="h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">No response processed yet</p>
            <p className="mt-1 max-w-sm text-xs text-slate-400">
              Paste your AI response above and click <span className="font-semibold">Process Response</span> to organise it into scope, materials, verification, safety, assumptions and review sections.
            </p>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
