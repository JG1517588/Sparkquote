import type { Quote, Settings } from '@/types';

export interface QuoteTotals {
  costSubtotal: number;
  marginAmount: number;
  netTotal: number;
  gstAmount: number;
  total: number;
}

export function calculateQuote(q: Quote): QuoteTotals {
  const costSubtotal = round2(q.labour + q.materials + q.subcontractors + q.otherCosts);
  const marginAmount = round2((costSubtotal * q.marginPercent) / 100);
  const netTotal = round2(costSubtotal + marginAmount);
  const gstAmount = round2((netTotal * q.gstRate) / 100);
  const total = round2(netTotal + gstAmount);
  return { costSubtotal, marginAmount, netTotal, gstAmount, total };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatAud(n: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(isFinite(n) ? n : 0);
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function buildQuoteDocument(
  job: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    jobAddress: string;
    jobType: string;
    jobDescription: string;
    parsed: { scope: string; materials: string };
    quote: Quote;
  },
  settings: Settings,
  totals: QuoteTotals,
): string {
  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + settings.quoteValidityDays);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' });

  return `ELECTRICAL QUOTE

${settings.businessName || 'Your Business Name'}
${settings.businessAddress}
Phone: ${settings.businessPhone}
Email: ${settings.businessEmail}
${settings.abn ? `ABN: ${settings.abn}` : ''}

----------------------------------------
QUOTE TO
----------------------------------------
${job.customerName}
${job.customerPhone}
${job.customerEmail}

----------------------------------------
JOB DETAILS
----------------------------------------
Address: ${job.jobAddress}
Job type: ${job.jobType}
Date: ${fmt(today)}
Quote valid until: ${fmt(validUntil)}

----------------------------------------
JOB DESCRIPTION
----------------------------------------
${job.jobDescription || '—'}

----------------------------------------
ELECTRICAL SCOPE OF WORKS
----------------------------------------
${job.parsed.scope || '—'}

----------------------------------------
MATERIALS
----------------------------------------
${job.parsed.materials || '—'}

----------------------------------------
PRICING
----------------------------------------
Labour:                ${formatAud(job.quote.labour)}
Materials:             ${formatAud(job.quote.materials)}
Subcontractors:        ${formatAud(job.quote.subcontractors)}
Other Costs:           ${formatAud(job.quote.otherCosts)}
Cost Subtotal:         ${formatAud(totals.costSubtotal)}
Margin (${job.quote.marginPercent}%):     ${formatAud(totals.marginAmount)}
Net Total:             ${formatAud(totals.netTotal)}
GST (${job.quote.gstRate}%):          ${formatAud(totals.gstAmount)}
----------------------------------------
TOTAL (incl. GST):      ${formatAud(totals.total)}
----------------------------------------

----------------------------------------
TERMS & CONDITIONS
----------------------------------------
${settings.termsAndConditions}

This quote is valid for ${settings.quoteValidityDays} days from the date of issue.

AI-generated information is provided as an administrative and planning aid only. All electrical design, installation, testing and compliance decisions must be verified by the appropriately licensed electrician and performed in accordance with applicable Australian requirements.`;
}
