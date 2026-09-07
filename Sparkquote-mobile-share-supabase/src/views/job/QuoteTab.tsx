import { useState } from 'react';
import { Copy, Printer, Share2 } from 'lucide-react';
import type { Job, Quote, Settings } from '@/types';
import { calculateQuote, formatAud } from '@/lib/quote';
import { createSharedQuote, makeShareQuote } from '@/lib/share';
import { QuoteDocument } from '@/components/QuoteDocument';

interface Props { job: Job; settings: Settings; onChange: (patch: Partial<Job>) => void; }
const COST_FIELDS: { key: keyof Pick<Quote, 'labour' | 'materials' | 'subcontractors' | 'otherCosts'>; label: string }[] = [
  { key: 'labour', label: 'Labour' }, { key: 'materials', label: 'Materials' },
  { key: 'subcontractors', label: 'Subcontractors' }, { key: 'otherCosts', label: 'Other costs' },
];

export function QuoteTab({ job, settings, onChange }: Props) {
  const [shareState, setShareState] = useState<'idle' | 'saving' | 'copied' | 'error'>('idle');
  const quote = job.quote;
  const totals = calculateQuote(quote);
  const updateQuote = (patch: Partial<Quote>) => onChange({ quote: { ...quote, ...patch }, status: 'Quoted' });
  const shareQuote = async () => {
    setShareState('saving');
    try {
      const token = await createSharedQuote(makeShareQuote(job, settings));
      const url = `${window.location.origin}${window.location.pathname}#/quote/${token}`;
      const shareData = { title: `Quote ${job.id}`, text: `Your SparkQuote for ${job.customerName || 'your job'} is ready to view.`, url };
      if (navigator.share) { await navigator.share(shareData); setShareState('idle'); }
      else { await navigator.clipboard.writeText(url); setShareState('copied'); window.setTimeout(() => setShareState('idle'), 2500); }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') { setShareState('idle'); return; }
      setShareState('error');
    }
  };
  return <div className="space-y-5">
    <section className="card p-5 sm:p-6 print:hidden"><div className="mb-5"><h2 className="text-xl font-bold text-slate-900">Quote calculator</h2><p className="mt-1 text-sm text-slate-500">Each cost appears as a separate line in the customer quote.</p></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{COST_FIELDS.map(({ key, label }) => <MoneyInput key={key} label={label} value={quote[key]} onChange={(value) => updateQuote({ [key]: value } as Partial<Quote>)} />)}</div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"><NumberInput label="Margin (%)" value={quote.marginPercent} suffix="%" onChange={(value) => updateQuote({ marginPercent: value })} /><NumberInput label="GST rate (%)" value={quote.gstRate} suffix="%" onChange={(value) => updateQuote({ gstRate: value })} /></div>
      <div className="mt-6 ml-auto max-w-md border-t border-slate-200 pt-4"><TotalRow label="Cost subtotal" value={totals.costSubtotal} /><TotalRow label={`Margin (${quote.marginPercent}%)`} value={totals.marginAmount} /><TotalRow label="Subtotal (ex. GST)" value={totals.netTotal} strong /><TotalRow label={`GST (${quote.gstRate}%)`} value={totals.gstAmount} /><div className="mt-3 flex items-center justify-between rounded-lg bg-slate-800 px-4 py-3 text-white"><span className="font-bold uppercase tracking-wide text-sm">Total (incl. GST)</span><span className="text-xl font-bold">{formatAud(totals.total)}</span></div></div>
    </section>
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end print:hidden"><button type="button" onClick={shareQuote} disabled={shareState === 'saving'} className="btn-primary"><Share2 className="h-4 w-4" />{shareState === 'saving' ? 'Creating link…' : 'Share complete quote'}</button><button type="button" onClick={() => window.print()} className="btn-secondary"><Printer className="h-4 w-4" /> Export PDF</button></div>
    {shareState === 'copied' && <Notice icon={<Copy className="h-4 w-4" />}>Link copied — paste it into WhatsApp, SMS or email.</Notice>}
    {shareState === 'error' && <Notice error>Sharing needs the Vercel and Supabase settings described in `README.md`.</Notice>}
    <QuoteDocument quote={makeShareQuote(job, settings)} />
  </div>;
}
function MoneyInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <NumberInput label={label} value={value} prefix="$" onChange={onChange} />; }
function NumberInput({ label, value, onChange, prefix, suffix }: { label: string; value: number; onChange: (value: number) => void; prefix?: string; suffix?: string }) { return <label className="block"><span className="label">{label}</span><div className="relative">{prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">{prefix}</span>}<input className={`input ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-8' : ''}`} type="number" min="0" step="0.01" value={value || ''} onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))} />{suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">{suffix}</span>}</div></label>; }
function TotalRow({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) { return <div className={`flex justify-between border-b border-slate-100 py-2 text-sm ${strong ? 'font-bold text-slate-900' : 'text-slate-600'}`}><span>{label}</span><span>{formatAud(value)}</span></div>; }
function Notice({ children, error = false, icon }: { children: React.ReactNode; error?: boolean; icon?: React.ReactNode }) { return <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${error ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'}`}>{icon}{children}</div>; }
