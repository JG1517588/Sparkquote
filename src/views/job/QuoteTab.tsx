import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { Job, Settings } from '@/types';
import { Printer } from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface QuoteCostData {
  labour: number;
  materials: number;
  subcontractors: number;
  otherCosts: number;
  marginRate: number;
  gstRate: number;
}

interface QuoteCalculations {
  costSubtotal: number;
  marginAmount: number;
  netTotal: number;
  gstAmount: number;
  totalQuote: number;
}

interface Props {
  job: Job;
  settings: Settings;
  onChange: (patch: Partial<Job>) => void;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

const parseNumber = (value: string): number => {
  if (value === '') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

const validatePercentage = (value: number): number => {
  return Math.max(0, Math.min(100, value));
};

const getValidUntil = (days: number = 30): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// ============================================
// COST INPUT COMPONENT
// ============================================
interface CostInputProps {
  label: string;
  field: keyof QuoteCostData;
  value: number;
  onUpdate: (field: keyof QuoteCostData, value: string) => void;
  percentage?: boolean;
}

const CostInput: React.FC<CostInputProps> = ({
  label,
  field,
  value,
  onUpdate,
  percentage = false,
}) => {
  const displayValue = value === 0 ? '' : value;

  return (
    <div>
      <label 
        htmlFor={`cost-${field}`}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        {!percentage && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            $
          </span>
        )}
        <input
          id={`cost-${field}`}
          type="number"
          min="0"
          step="any"
          value={displayValue}
          onChange={(e) => onUpdate(field, e.target.value)}
          placeholder="0"
          aria-label={label}
          className={`
            w-full rounded-lg border border-slate-300 bg-white py-2.5
            ${percentage ? 'pl-3' : 'pl-8'}
            ${percentage ? 'pr-9' : 'pr-3'}
            text-sm font-medium text-slate-800 outline-none transition
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100
            hover:border-slate-400
          `}
        />
        {percentage && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            %
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================
// QUOTE CALCULATOR COMPONENT
// ============================================
interface QuoteCalculatorProps {
  costs: QuoteCostData;
  calculations: QuoteCalculations;
  onCostUpdate: (field: keyof QuoteCostData, value: string) => void;
}

const QuoteCalculator: React.FC<QuoteCalculatorProps> = ({
  costs,
  calculations,
  onCostUpdate,
}) => {
  const { costSubtotal, marginAmount, netTotal, gstAmount, totalQuote } = calculations;

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:hidden">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Quote Calculator</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter your costs. The subtotal, margin, GST and total are calculated automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CostInput
          label="Labour"
          field="labour"
          value={costs.labour}
          onUpdate={onCostUpdate}
        />
        <CostInput
          label="Materials"
          field="materials"
          value={costs.materials}
          onUpdate={onCostUpdate}
        />
        <CostInput
          label="Subcontractors"
          field="subcontractors"
          value={costs.subcontractors}
          onUpdate={onCostUpdate}
        />
        <CostInput
          label="Other Costs"
          field="otherCosts"
          value={costs.otherCosts}
          onUpdate={onCostUpdate}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CostInput
          label="Margin (%)"
          field="marginRate"
          value={costs.marginRate}
          onUpdate={onCostUpdate}
          percentage
        />
        <CostInput
          label="GST Rate (%)"
          field="gstRate"
          value={costs.gstRate}
          onUpdate={onCostUpdate}
          percentage
        />
      </div>

      <div className="mt-6 border-t border-slate-200 pt-6">
        <div className="ml-auto w-full max-w-md space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Cost Subtotal</span>
            <span className="font-semibold text-slate-800">
              {formatCurrency(costSubtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Margin ({costs.marginRate}%)</span>
            <span className="font-semibold text-slate-800">
              {formatCurrency(marginAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
            <span className="font-medium text-slate-600">Net Total</span>
            <span className="font-bold text-slate-900">
              {formatCurrency(netTotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">GST ({costs.gstRate}%)</span>
            <span className="font-semibold text-slate-800">
              {formatCurrency(gstAmount)}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-800 px-4 py-4">
            <span className="text-sm font-bold uppercase tracking-wide text-white">
              Total Quote (incl. GST)
            </span>
            <span className="text-xl font-bold text-white">
              {formatCurrency(totalQuote)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// QUOTE DOCUMENT SUB-COMPONENTS
// ============================================
interface QuoteHeaderProps {
  quoteNumber: string;
  businessName: string;
}

const QuoteHeader: React.FC<QuoteHeaderProps> = ({ quoteNumber, businessName }) => (
  <header className="border-b-4 border-slate-800 px-8 py-7 md:px-10">
    <div className="flex items-start justify-between gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1d5bd8] shadow-sm print:shadow-none">
          <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-lg font-bold leading-tight text-slate-900">SparkQuote</span>
          <span className="text-xs font-medium text-slate-500">Electrical Quote Assistant</span>
        </div>
      </div>

      <div className="text-right">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Electrical Quote
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">#{quoteNumber}</h2>
      </div>
    </div>
  </header>
);

interface BusinessInfoProps {
  businessName: string;
  businessAddress: string;
  businessABN: string;
  businessACN: string;
  businessPhone: string;
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  customerPhone: string;
  quoteNumber: string;
  dateStr: string;
  validUntilStr: string;
}

const BusinessInfo: React.FC<BusinessInfoProps> = (props) => (
  <section className="px-8 py-7 md:px-10">
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div>
        <div className="mb-3 border-b border-slate-200 pb-2">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">From</h3>
        </div>
        <div className="space-y-1 text-sm">
          <p className="font-bold text-slate-900">{props.businessName}</p>
          <p className="text-slate-600">{props.businessAddress}</p>
          <p className="text-slate-600">ABN: {props.businessABN}</p>
          <p className="text-slate-600">ACN: {props.businessACN}</p>
          <p className="text-slate-600">Phone: {props.businessPhone}</p>
        </div>
      </div>

      <div>
        <div className="mb-3 border-b border-slate-200 pb-2">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">Bill To</h3>
        </div>
        <div className="space-y-1 text-sm">
          <p className="font-bold text-slate-900">{props.customerName}</p>
          <p className="text-slate-600">{props.customerAddress}</p>
          <p className="text-slate-600">Email: {props.customerEmail}</p>
          <p className="text-slate-600">Phone: {props.customerPhone}</p>
        </div>
      </div>
    </div>

    <div className="mt-7 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 md:grid-cols-4">
      <InfoItem label="Quote Number" value={`#${props.quoteNumber}`} />
      <InfoItem label="Issue Date" value={props.dateStr} />
      <InfoItem label="Valid Until" value={props.validUntilStr} />
      <InfoItem label="Status" value="QUOTE" valueClassName="text-blue-600" />
    </div>
  </section>
);

interface InfoItemProps {
  label: string;
  value: string;
  valueClassName?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, valueClassName = 'text-slate-800' }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <p className={`mt-1 text-sm font-semibold ${valueClassName}`}>{value}</p>
  </div>
);

const ScopeOfWork: React.FC<{ description: string }> = ({ description }) => (
  <section className="px-8 md:px-10">
    <div className="mb-3">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">Scope of Work</h3>
    </div>
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{description}</p>
    </div>
  </section>
);

interface QuoteTableProps {
  description: string;
  netTotal: number;
  gstAmount: number;
}

const QuoteTable: React.FC<QuoteTableProps> = ({ description, netTotal, gstAmount }) => (
  <section className="px-8 py-7 md:px-10">
    <div className="overflow-hidden rounded-lg border border-slate-300">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="w-[46%] px-4 py-3 text-left font-semibold uppercase tracking-wider">Description</th>
            <th className="w-[10%] px-2 py-3 text-center font-semibold uppercase tracking-wider">Qty</th>
            <th className="w-[16%] px-3 py-3 text-right font-semibold uppercase tracking-wider">Unit Price</th>
            <th className="w-[16%] px-3 py-3 text-right font-semibold uppercase tracking-wider">Subtotal</th>
            <th className="w-[12%] px-3 py-3 text-right font-semibold uppercase tracking-wider">GST</th>
          </tr>
        </thead>
        <tbody>
          <tr className="align-top">
            <td className="border-t border-slate-300 px-4 py-4">
              <p className="whitespace-pre-line font-medium leading-5 text-slate-800">{description}</p>
            </td>
            <td className="border-l border-t border-slate-300 px-2 py-4 text-center text-slate-700">1</td>
            <td className="border-l border-t border-slate-300 px-3 py-4 text-right text-slate-700">
              {formatCurrency(netTotal)}
            </td>
            <td className="border-l border-t border-slate-300 px-3 py-4 text-right font-medium text-slate-800">
              {formatCurrency(netTotal)}
            </td>
            <td className="border-l border-t border-slate-300 px-3 py-4 text-right text-slate-700">
              {formatCurrency(gstAmount)}
            </td>
          </tr>
          <tr className="h-32">
            <td className="border-t border-slate-200"></td>
            <td className="border-l border-t border-slate-200"></td>
            <td className="border-l border-t border-slate-200"></td>
            <td className="border-l border-t border-slate-200"></td>
            <td className="border-l border-t border-slate-200"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
);

interface TotalsProps {
  costs: QuoteCostData;
  calculations: QuoteCalculations;
}

const Totals: React.FC<TotalsProps> = ({ costs, calculations }) => {
  const { costSubtotal, marginAmount, netTotal, gstAmount, totalQuote } = calculations;

  return (
    <section className="px-8 md:px-10">
      <div className="flex justify-end">
        <div className="w-full max-w-sm">
          <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
            <span className="font-medium text-slate-500">Cost Subtotal</span>
            <span className="font-semibold text-slate-800">{formatCurrency(costSubtotal)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
            <span className="font-medium text-slate-500">Margin ({costs.marginRate}%)</span>
            <span className="font-semibold text-slate-800">{formatCurrency(marginAmount)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
            <span className="font-medium text-slate-500">Net Total</span>
            <span className="font-semibold text-slate-800">{formatCurrency(netTotal)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
            <span className="font-medium text-slate-500">GST ({costs.gstRate}%)</span>
            <span className="font-semibold text-slate-800">{formatCurrency(gstAmount)}</span>
          </div>
          <div className="mt-1 flex justify-between rounded-lg bg-slate-800 px-4 py-3">
            <span className="text-sm font-bold uppercase tracking-wider text-white">Total Quote (incl. GST)</span>
            <span className="text-lg font-bold text-white">{formatCurrency(totalQuote)}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

interface PaymentDetailsProps {
  bankName: string;
  bsb: string;
  accountNumber: string;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ bankName, bsb, accountNumber }) => (
  <section className="px-8 py-8 md:px-10">
    <div className="grid grid-cols-1 gap-6 border-t border-slate-200 pt-6 md:grid-cols-2">
      <div>
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">Payment Details</h3>
        <div className="space-y-1 text-xs text-slate-600">
          <p><span className="font-semibold text-slate-800">Bank:</span> {bankName}</p>
          <p><span className="font-semibold text-slate-800">BSB:</span> {bsb}</p>
          <p><span className="font-semibold text-slate-800">Account:</span> {accountNumber}</p>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">Payment Terms</h3>
        <p className="text-xs leading-5 text-slate-600">
          Payment is due within 7 days of completion unless otherwise agreed in writing.
        </p>
      </div>
    </div>
  </section>
);

const TermsAndConditions: React.FC = () => {
  const terms = [
    'This quotation is valid for 30 days from the issue date unless otherwise stated.',
    'All electrical work will be carried out by appropriately licensed electrical workers and in accordance with applicable Australian legislation, regulations and relevant standards.',
    'Electrical installation work will be carried out in accordance with AS/NZS 3000 where applicable.',
    'Any additional work outside the agreed scope of work may be charged separately and will require approval where reasonably practicable.',
    'Access to the work area, existing services and suitable working conditions are to be provided by the customer.',
    'Any concealed defects, hazardous conditions or non-compliant existing electrical installations discovered during the work may require additional rectification work.',
    'Final payment is due within 7 days of completion unless different payment terms have been agreed in writing.',
  ];

  return (
    <section className="border-t border-slate-200 px-8 py-7 md:px-10">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">Terms & Conditions</h3>
      <ol className="list-decimal space-y-1.5 pl-4 text-[10px] leading-4 text-slate-500">
        {terms.map((term, index) => (
          <li key={index}>{term}</li>
        ))}
      </ol>
    </section>
  );
};

const QuoteFooter: React.FC = () => (
  <footer className="border-t border-slate-200 px-8 py-5 text-center md:px-10">
    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Thank you for your business</p>
    <p className="mt-1 text-[9px] text-slate-400">Generated with SparkQuote — Electrical Quote Assistant</p>
  </footer>
);

// ============================================
// QUOTE DOCUMENT COMPONENT
// ============================================
interface QuoteDocumentProps {
  job: Job;
  settings: Settings;
  costs: QuoteCostData;
  calculations: QuoteCalculations;
}

const QuoteDocument: React.FC<QuoteDocumentProps> = ({ job, settings, costs, calculations }) => {
  const issueDate = new Date();
  const validUntil = getValidUntil(30);
  const dateStr = formatDate(issueDate);
  const validUntilStr = formatDate(validUntil);

  const quoteNumber = job.id || '1391';
  const {
    businessName = 'MY ELECTRICAL BUSINESS',
    address: businessAddress = '[Business Address]',
    phone: businessPhone = '[Phone Number]',
    abn: businessABN = '[ABN]',
    acn: businessACN = '[ACN]',
    bankName = '[Bank Name]',
    bsb = '[BSB]',
    accountNumber = '[Account Number]',
  } = settings || {};

  const customerName = job.customerName ?? '[Customer Name]';
  const customerAddress = job.jobAddress ?? '[Job Address]';
  const customerEmail = job.customerEmail ?? '-';
  const customerPhone = job.customerPhone ?? '-';

  const description = job.jobDescription || job.scopeOfWork || 
    'Electrical installation, testing and related services';

  return (
    <div
      id="quote-document"
      className="
        mx-auto w-full max-w-[794px] bg-white text-slate-800 shadow-lg
        print:max-w-none print:shadow-none
      "
    >
      <QuoteHeader quoteNumber={quoteNumber} businessName={businessName} />
      
      <BusinessInfo
        businessName={businessName}
        businessAddress={businessAddress}
        businessABN={businessABN}
        businessACN={businessACN}
        businessPhone={businessPhone}
        customerName={customerName}
        customerAddress={customerAddress}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        quoteNumber={quoteNumber}
        dateStr={dateStr}
        validUntilStr={validUntilStr}
      />

      <ScopeOfWork description={description} />
      
      <QuoteTable description={description} netTotal={calculations.netTotal} gstAmount={calculations.gstAmount} />
      
      <Totals costs={costs} calculations={calculations} />
      
      <PaymentDetails bankName={bankName} bsb={bsb} accountNumber={accountNumber} />
      
      <TermsAndConditions />
      
      <QuoteFooter />
    </div>
  );
};

// ============================================
// PRINT STYLES
// ============================================
const PrintStyles: React.FC = () => (
  <style>{`
    @media print {
      @page {
        size: A4;
        margin: 0mm;
      }

      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      body > *:not(#quote-document) {
        display: none !important;
      }

      .print\\:hidden {
        display: none !important;
      }

      #quote-document {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }

      #quote-document section,
      #quote-document header,
      #quote-document footer,
      table,
      tr {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .bg-slate-800 {
        background-color: #1e293b !important;
      }

      .bg-slate-50 {
        background-color: #f8fafc !important;
      }

      .border-slate-200 {
        border-color: #e2e8f0 !important;
      }

      .border-slate-300 {
        border-color: #cbd5e1 !important;
      }

      .text-white {
        color: #ffffff !important;
      }
    }
  `}</style>
);

// ============================================
// MAIN QUOTE TAB COMPONENT
// ============================================
export function QuoteTab({ job, settings, onChange }: Props) {
  const storedJob = job as Job & Partial<QuoteCostData>;
  const isInitialMount = useRef(true);

  // State
  const [costs, setCosts] = useState<QuoteCostData>(() => ({
    labour: storedJob.labour ?? 0,
    materials: storedJob.materials ?? 0,
    subcontractors: storedJob.subcontractors ?? 0,
    otherCosts: storedJob.otherCosts ?? 0,
    marginRate: storedJob.marginRate ?? 20,
    gstRate: storedJob.gstRate ?? 10,
  }));

  // Sync when job changes
  useEffect(() => {
    setCosts({
      labour: storedJob.labour ?? 0,
      materials: storedJob.materials ?? 0,
      subcontractors: storedJob.subcontractors ?? 0,
      otherCosts: storedJob.otherCosts ?? 0,
      marginRate: storedJob.marginRate ?? 20,
      gstRate: storedJob.gstRate ?? 10,
    });
  }, [job.id]);

  // Calculations
  const calculations = useMemo<QuoteCalculations>(() => {
    const costSubtotal = 
      (costs.labour || 0) +
      (costs.materials || 0) +
      (costs.subcontractors || 0) +
      (costs.otherCosts || 0);

    const marginAmount = costSubtotal * ((costs.marginRate || 0) / 100);
    const netTotal = costSubtotal + marginAmount;
    const gstAmount = netTotal * ((costs.gstRate || 0) / 100);
    const totalQuote = netTotal + gstAmount;

    return { costSubtotal, marginAmount, netTotal, gstAmount, totalQuote };
  }, [costs]);

  // Save to parent
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    onChange({
      labour: costs.labour,
      materials: costs.materials,
      subcontractors: costs.subcontractors,
      otherCosts: costs.otherCosts,
      marginRate: costs.marginRate,
      gstRate: costs.gstRate,
      subtotal: calculations.netTotal,
      gst: calculations.gstAmount,
      total: calculations.totalQuote,
    });
  }, [
    costs.labour,
    costs.materials,
    costs.subcontractors,
    costs.otherCosts,
    costs.marginRate,
    costs.gstRate,
    calculations.netTotal,
    calculations.gstAmount,
    calculations.totalQuote,
    onChange,
  ]);

  // Update handler
  const updateCost = useCallback((field: keyof QuoteCostData, value: string) => {
    const parsed = parseNumber(value);
    const finalValue = field === 'marginRate' || field === 'gstRate' 
      ? validatePercentage(parsed)
      : parsed;

    setCosts((prev) => ({
      ...prev,
      [field]: finalValue,
    }));
  }, []);

  // Print handler
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <>
      {/* Quote Calculator */}
      <QuoteCalculator
        costs={costs}
        calculations={calculations}
        onCostUpdate={updateCost}
      />

      {/* Export PDF Button */}
      <div className="mb-4 flex justify-end print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="
            inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5
            text-sm font-semibold text-white shadow-sm transition
            hover:bg-blue-700 focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:ring-offset-2
            active:bg-blue-800
          "
        >
          <Printer className="h-4 w-4" />
          Export PDF
        </button>
      </div>

      {/* Quote Document */}
      <QuoteDocument
        job={job}
        settings={settings}
        costs={costs}
        calculations={calculations}
      />

      {/* Print Styles */}
      <PrintStyles />
    </>
  );
}

export default QuoteTab;
