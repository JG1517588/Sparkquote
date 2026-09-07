import { useRef } from 'react';
import { Upload, FileText, Image, Paperclip, X } from 'lucide-react';
import type { Job, JobFile, JobType } from '@/types';
import { JOB_TYPES } from '@/types';
import { formatBytes } from '@/lib/prompt';
import { uid } from '@/lib/storage';
import { SectionCard } from '@/components/SectionCard';

interface Props {
  job: Job;
  onChange: (patch: Partial<Job>) => void;
}

export function JobInfoTab({ job, onChange }: Props) {
  return (
    <div className="space-y-6">
      <SectionCard title="Customer Details" description="Update the customer's contact information.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Customer Name">
            <input
              className="input"
              value={job.customerName}
              onChange={(e) => onChange({ customerName: e.target.value })}
            />
          </Field>
          <Field label="Customer Phone">
            <input
              className="input"
              value={job.customerPhone}
              onChange={(e) => onChange({ customerPhone: e.target.value })}
            />
          </Field>
          <Field label="Customer Email">
            <input
              type="email"
              className="input"
              value={job.customerEmail}
              onChange={(e) => onChange({ customerEmail: e.target.value })}
            />
          </Field>
          <Field label="Job Address">
            <input
              className="input"
              value={job.jobAddress}
              onChange={(e) => onChange({ jobAddress: e.target.value })}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Job Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Job Type">
            <select
              className="input"
              value={job.jobType}
              onChange={(e) => onChange({ jobType: e.target.value as JobType })}
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Job Description" className="mt-4">
          <textarea
            className="input min-h-[140px] resize-y"
            value={job.jobDescription}
            onChange={(e) => onChange({ jobDescription: e.target.value })}
          />
        </Field>
      </SectionCard>

      <SectionCard
        title="Files & Attachments"
        description="Photos, PDF plans and other documents. Stored locally in your browser."
      >
        <FileUploads files={job.files} onChange={(files) => onChange({ files })} />
      </SectionCard>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
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
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition-colors hover:border-brand-300 hover:bg-brand-50/50"
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
