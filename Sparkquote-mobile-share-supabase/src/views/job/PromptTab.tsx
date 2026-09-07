import { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import type { Job } from '@/types';
import { generatePrompt } from '@/lib/prompt';
import { useCopy } from '@/lib/useCopy';
import { SectionCard } from '@/components/SectionCard';

interface Props {
  job: Job;
  onChange: (patch: Partial<Job>) => void;
}

export function PromptTab({ job, onChange }: Props) {
  const copy = useCopy();
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const prompt = generatePrompt(job);
    onChange({ aiPrompt: prompt, status: job.status === 'Draft' ? 'Prompted' : job.status });
  };

  const handleCopy = async () => {
    if (!job.aiPrompt) return;
    const ok = await copy(job.aiPrompt);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Generate AI Analysis Prompt"
        description="Click the button to build a structured prompt you can paste into Gemini, ChatGPT or DeepSeek."
        actions={
          <button onClick={handleGenerate} className="btn-spark">
            <Sparkles className="h-4 w-4" /> Generate AI Analysis Prompt
          </button>
        }
      >
        <div className="rounded-lg bg-brand-50/60 p-4 ring-1 ring-brand-100">
          <ol className="space-y-1.5 text-sm text-slate-700">
            <li>1. Click <span className="font-semibold">Generate AI Analysis Prompt</span>.</li>
            <li>2. Copy the prompt using <span className="font-semibold">Copy Prompt</span>.</li>
            <li>3. Paste it into your chosen AI tool (Gemini, ChatGPT, DeepSeek).</li>
            <li>4. Copy the AI's response and return here to the <span className="font-semibold">AI Response</span> tab.</li>
          </ol>
        </div>
      </SectionCard>

      <SectionCard
        title="Generated Prompt"
        description="This is the prompt to send to your external AI tool."
        actions={
          <>
            <button onClick={handleGenerate} className="btn-secondary">
              <RefreshCw className="h-4 w-4" /> Regenerate
            </button>
            <button onClick={handleCopy} disabled={!job.aiPrompt} className="btn-primary">
              {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy Prompt'}
            </button>
          </>
        }
      >
        {job.aiPrompt ? (
          <textarea
            className="input min-h-[360px] resize-y font-mono text-xs leading-relaxed"
            value={job.aiPrompt}
            onChange={(e) => onChange({ aiPrompt: e.target.value })}
          />
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-center">
            <Sparkles className="h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">No prompt generated yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Click <span className="font-semibold">Generate AI Analysis Prompt</span> above.
            </p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
