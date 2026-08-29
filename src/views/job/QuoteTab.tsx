import { useMemo, useState } from 'react';
import { FileText, Copy, Check, Download, Printer } from 'lucide-react';
import type { Job, Quote, Settings } from '@/types';
import { calculateQuote, formatAud, buildQuoteDocument } from '@/lib/quote';
import { useCopy } from '@/lib/useCopy';
import { SectionCard } from '@/components/SectionCard';

interface Props {
  job: Job;
  settings: Settings;
  onChange: (patch: Partial<Job>) => void;
}

export function QuoteTab({ job, settings, onChange }: Props) {
  const copy = useCopy();
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(false);

  const totals = useMemo(() => calculateQuote(job.quote), [job.quote]);

  const updateQuote = (patch: Partial<Quote>) => {
    onChange({ quote: { ...job.quote, ...patch } });
  };

  const handleGenerate = () => {
    setGenerated(true);
  };

  const quoteDoc = useMemo(
    () => (generated ? buildQuoteDocument(job, settings, totals) : ''),
    [generated, job, settings, totals],
  );

  const handleCopyQuote = async () => {
    if (!quoteDoc) return;
    const ok = await copy(quoteDoc);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleDownload = () => {
    if (!quoteDoc) return;
    const blob = new Blob([quoteDoc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-${job.customerName.replace(/\s+/g, '-').toLowerCase() || 'job'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!quoteDoc) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<pre style="font-family: 'Courier New', monospace; white-space: pre-wrap; padding: 24px; max-width: 800px; margin: 0 auto;">${escapeHtml(quoteDoc)}</pre>`);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Quote Builder"
        description="Enter your costs. The subtotal, margin, GST and total are calculated automatically."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MoneyField label="Labour" value={job.quote.labour} onChange={(v) => updateQuote({ labour: v })} />
          <MoneyField label="Materials" value={job.quote.materials} onChange={(v) => updateQuote({ materials: v })} />
          <MoneyField label="Subcontractors" value={job.quote.subcontractors} onChange={(v) => updateQuote({ subcontractors: v })} />
          <MoneyField label="Other Costs" value={job.quote.otherCosts} onChange={(v) => updateQuote({ otherCosts: v })} />
          <PercentField label="Margin (%)" value={job.quote.marginPercent} onChange={(v) => updateQuote({ marginPercent: v })} />
          <PercentField label="GST Rate (%)" value={job.quote.gstRate} onChange={(v) => updateQuote({ gstRate: v })} />
        </div>

        <div className="mt-6 overflow-hidden rounded-lg ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100">
              <Row label="Cost Subtotal" value={formatAud(totals.costSubtotal)} />
              <Row label={`Margin (${job.quote.marginPercent}%)`} value={formatAud(totals.marginAmount)} />
              <Row label="Net Total" value={formatAud(totals.netTotal)} bold />
              <Row label={`GST (${job.quote.gstRate}%)`} value={formatAud(totals.gstAmount)} />
              <Row label="Total Quote (incl. GST)" value={formatAud(totals.total)} highlight />
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={handleGenerate} className="btn-primary">
            <FileText className="h-4 w-4" /> Generate Quote
          </button>
        </div>
      </SectionCard>

      {generated && quoteDoc && (
        <SectionCard
          title="Generated Quote"
          description={`Prepared by ${settings.businessName || 'your business'} for ${job.customerName || 'customer'}.`}
          actions={
            <>
              <button onClick={handlePrint} className="btn-secondary">
                <Printer className="h-4 w-4" /> Print
              </button>
              <button onClick={handleDownload} className="btn-secondary">
                <Download className="h-4 w-4" /> Download
              </button>
              <button onClick={handleCopyQuote} className="btn-primary">
                {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy Quote'}
              </button>
            </>
          }
        >
          <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 ring-1 ring-slate-200">
            {quoteDoc}
          </pre>
        </SectionCard>
      )}
    </div>
  );
}

function MoneyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-slate-400">
          $
        </span>
        <input
          type="number"
          min={0}
          step="0.01"
          className="input pl-7"
          value={Number.isNaN(value) ? '' : value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
      </div>
    </div>
  );
}

function PercentField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type="number"
          min={0}
          step="0.1"
          className="input pr-8"
          value={Number.isNaN(value) ? '' : value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-400">
          %
        </span>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? 'bg-brand-50' : undefined}>
      <td className={`px-4 py-3 ${highlight ? 'font-bold text-brand-900' : 'text-slate-600'} ${bold ? 'font-semibold' : ''}`}>
        {label}
      </td>
      <td className={`px-4 py-3 text-right tabular-nums ${highlight ? 'text-lg font-bold text-brand-900' : 'font-semibold text-slate-900'}`}>
        {value}
      </td>
    </tr>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
