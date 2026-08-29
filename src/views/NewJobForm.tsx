import { useRef, useState } from 'react';
import {
  ArrowLeft,
  PlusCircle,
  Upload,
  FileText,
  Image,
  Paperclip,
  X,
  Save,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import type { Job, JobFile, JobType } from '@/types';
import { JOB_TYPES } from '@/types';
import { generatePrompt, formatBytes } from '@/lib/prompt';
import { uid } from '@/lib/storage';
import { useCopy } from '@/lib/useCopy';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { Disclaimer } from '@/components/Disclaimer';
import { navigate, type Route } from '@/lib/router';

interface Props {
  draft: Job;
  onChange: (patch: Partial<Job>) => void;
  onSave: () => void;
  onNavigate: (route: Route) => void;
}

export function NewJobForm({ draft, onChange, onSave, onNavigate }: Props) {
  const copy = useCopy();
  const [copied, setCopied] = useState(false);

  const goBack = () => {
    navigate({ name: 'dashboard' });
    onNavigate({ name: 'dashboard' });
  };

  const canSave = draft.customerName.trim().length > 0 || draft.jobAddress.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave();
  };

  const handleGeneratePrompt = () => {
    const prompt = generatePrompt(draft);
    onChange({ aiPrompt: prompt });
  };

  const handleCopyPrompt = async () => {
    if (!draft.aiPrompt) return;
    const ok = await copy(draft.aiPrompt);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Job"
        subtitle="Enter the customer and job details, attach files, then generate an AI analysis prompt."
        icon={<PlusCircle className="h-5 w-5" />}
        actions={
          <>
            <button onClick={goBack} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button onClick={handleSave} disabled={!canSave} className="btn-primary">
              <Save className="h-4 w-4" /> Create Job
            </button>
          </>
        }
      />

      {/* Step 1: Customer Details */}
      <SectionCard
        title="Customer Details"
        description="Who is this job for?"
        step={1}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Customer Name" required>
            <input
              className="input"
              value={draft.customerName}
              onChange={(e) => onChange({ customerName: e.target.value })}
              placeholder="e.g. John Smith"
            />
          </Field>
          <Field label="Phone">
            <input
              className="input"
              value={draft.customerPhone}
              onChange={(e) => onChange({ customerPhone: e.target.value })}
              placeholder="e.g. 0412 345 678"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className="input"
              value={draft.customerEmail}
              onChange={(e) => onChange({ customerEmail: e.target.value })}
              placeholder="e.g. john@example.com.au"
            />
          </Field>
          <Field label="Job Address">
            <input
              className="input"
              value={draft.jobAddress}
              onChange={(e) => onChange({ jobAddress: e.target.value })}
              placeholder="e.g. 12 Bondi Rd, Bondi NSW 2026"
            />
          </Field>
        </div>
      </SectionCard>

      {/* Step 2: Job Details */}
      <SectionCard title="Job Details" description="Describe the work to be quoted." step={2}>
        <Field label="Job Type">
          <div className="flex flex-wrap gap-2">
            {JOB_TYPES.map((t) => {
              const active = draft.jobType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange({ jobType: t })}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all active:scale-[0.97] ${
                    active
                      ? 'bg-brand-700 text-white shadow-sm ring-1 ring-brand-700'
                      : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Job Description" className="mt-4">
          <textarea
            className="input min-h-[160px] resize-y"
            value={draft.jobDescription}
            onChange={(e) => onChange({ jobDescription: e.target.value })}
            placeholder="Describe the job in detail — e.g. 'Install 6 downlights, 2 ceiling fans, replace old switchboard with new RCBO board, supply and install smoke alarms.'"
          />
        </Field>
      </SectionCard>

      {/* Step 3: Files */}
      <SectionCard
        title="Files & Attachments"
        description="Upload site photos, PDF plans or other documents. Files are stored locally in your browser for this MVP."
        step={3}
      >
        <FileUploads files={draft.files} onChange={(files) => onChange({ files })} />
      </SectionCard>

      {/* Step 4: AI Prompt */}
      <SectionCard
        title="AI Analysis Prompt"
        description="Generate a structured prompt to paste into Gemini, ChatGPT or DeepSeek."
        step={4}
        actions={
          <button onClick={handleGeneratePrompt} className="btn-spark">
            <Sparkles className="h-4 w-4" /> Generate AI Analysis Prompt
          </button>
        }
      >
        <div className="mb-4 rounded-lg bg-brand-50/60 p-4 ring-1 ring-brand-100">
          <ol className="space-y-1.5 text-sm text-slate-700">
            <li>1. Click <span className="font-semibold">Generate AI Analysis Prompt</span>.</li>
            <li>2. Copy the prompt using <span className="font-semibold">Copy Prompt</span>.</li>
            <li>3. Paste it into your chosen AI tool (Gemini, ChatGPT, DeepSeek).</li>
            <li>
              4. After saving the job, paste the AI's response into the{' '}
              <span className="font-semibold">AI Response</span> tab.
            </li>
          </ol>
        </div>

        {draft.aiPrompt ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button onClick={handleGeneratePrompt} className="btn-secondary">
                <RefreshCw className="h-4 w-4" /> Regenerate
              </button>
              <button onClick={handleCopyPrompt} className="btn-primary">
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-300" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? 'Copied' : 'Copy Prompt'}
              </button>
            </div>
            <textarea
              className="input min-h-[360px] resize-y font-mono text-xs leading-relaxed"
              value={draft.aiPrompt}
              onChange={(e) => onChange({ aiPrompt: e.target.value })}
            />
          </div>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-center">
            <Sparkles className="h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">No prompt generated yet</p>
            <p className="mt-1 max-w-sm text-xs text-slate-400">
              Fill in the job details above, then click{' '}
              <span className="font-semibold">Generate AI Analysis Prompt</span> to build a prompt
              ready for Gemini, ChatGPT or DeepSeek.
            </p>
          </div>
        )}
      </SectionCard>

      <Disclaimer />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button onClick={goBack} className="btn-secondary">
          Cancel
        </button>
        <button onClick={handleSave} disabled={!canSave} className="btn-primary">
          <Save className="h-4 w-4" /> Create Job
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const CATEGORIES: { key: JobFile['category']; label: string; icon: typeof Image }[] = [
  { key: 'Site Photos', label: 'Site Photos', icon: Image },
  { key: 'PDF Plans', label: 'PDF Plans', icon: FileText },
  { key: 'Other Documents', label: 'Other Documents', icon: Paperclip },
];

function FileUploads({
  files,
  onChange,
}: {
  files: JobFile[];
  onChange: (files: JobFile[]) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const catFiles = files.filter((f) => f.category === cat.key);
        return (
          <Dropzone
            key={cat.key}
            label={cat.label}
            icon={<Icon className="h-5 w-5" />}
            files={catFiles}
            onAdd={(newFiles) =>
              onChange([...files.filter((f) => f.category !== cat.key), ...newFiles])
            }
            onRemove={(id) => onChange(files.filter((f) => f.id !== id))}
          />
        );
      })}
    </div>
  );
}

function Dropzone({
  label,
  icon,
  files,
  onAdd,
  onRemove,
}: {
  label: string;
  icon: React.ReactNode;
  files: JobFile[];
  onAdd: (files: JobFile[]) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const mapped: JobFile[] = Array.from(fileList).map((f) => ({
      id: uid(),
      name: f.name,
      size: f.size,
      type: f.type,
      category: label as JobFile['category'],
      uploadedAt: new Date().toISOString(),
    }));
    onAdd(mapped);
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        {icon}
        {label}
        {files.length > 0 && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {files.length}
          </span>
        )}
      </div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragOver
            ? 'border-brand-400 bg-brand-50'
            : 'border-slate-300 bg-slate-50 hover:border-brand-300 hover:bg-brand-50/50'
        }`}
      >
        <Upload className="h-5 w-5 text-slate-400" />
        <p className="mt-2 text-xs text-slate-500">
          <span className="font-medium text-brand-700">Click to upload</span> or drag & drop
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-2 rounded-md bg-slate-50 px-2.5 py-1.5 text-xs ring-1 ring-slate-200/70"
            >
              <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate font-medium text-slate-700">{f.name}</span>
              <span className="shrink-0 text-slate-400">{formatBytes(f.size)}</span>
              <span className="hidden shrink-0 rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 sm:inline">
                {fileTypeLabel(f.type, f.name)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(f.id);
                }}
                className="ml-auto rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function fileTypeLabel(mimeType: string, fileName: string): string {
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Document';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Spreadsheet';
    if (mimeType.startsWith('text/')) return 'Text';
    return mimeType.split('/').pop() || 'File';
  }
  const ext = fileName.split('.').pop();
  return ext ? ext.toUpperCase() : 'File';
}
