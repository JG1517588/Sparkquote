import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { Job, Settings } from '@/types';
import { Printer } from 'lucide-react';

interface Props {
  job: Job;
  settings: Settings;
  onChange: (patch: Partial<Job>) => void;
}

interface QuoteCostData {
  labour: number;
  materials: number;
  subcontractors: number;
  otherCosts: number;
  marginRate: number;
  gstRate: number;
}

export function QuoteTab({ job, settings, onChange }: Props) {
  const issueDate = new Date();
  const validUntil = new Date(issueDate);
  validUntil.setDate(validUntil.getDate() + 30);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const dateStr = formatDate(issueDate);
  const validUntilStr = formatDate(validUntil);

  /*
   * =========================================
   * QUOTE COST DATA
   * =========================================
   */
  const storedJob = job as Job & Partial<QuoteCostData>;

  const [costs, setCosts] = useState<QuoteCostData>(() => ({
    labour: Number(storedJob.labour ?? 0),
    materials: Number(storedJob.materials ?? 0),
    subcontractors: Number(storedJob.subcontractors ?? 0),
    otherCosts: Number(storedJob.otherCosts ?? 0),
    marginRate: Number(storedJob.marginRate ?? 20),
    gstRate: Number(storedJob.gstRate ?? 10),
  }));

  // 防止子组件初始化和父级渲染导致的死循环
  const isInitialMount = useRef(true);

  /*
   * =========================================
   * SYNC WHEN JOB ID CHANGES (ONLY ON SWITCHING JOBS)
   * =========================================
   */
  useEffect(() => {
    setCosts({
      labour: Number(storedJob.labour ?? 0),
      materials: Number(storedJob.materials ?? 0),
      subcontractors: Number(storedJob.subcontractors ?? 0),
      otherCosts: Number(storedJob.otherCosts ?? 0),
      marginRate: Number(storedJob.marginRate ?? 20),
      gstRate: Number(storedJob.gstRate ?? 10),
    });
  }, [job.id]);

  /*
   * =========================================
   * CALCULATIONS
   * =========================================
   */
  const costSubtotal =
    (costs.labour || 0) +
    (costs.materials || 0) +
    (costs.subcontractors || 0) +
    (costs.otherCosts || 0);

  const marginAmount = costSubtotal * ((costs.marginRate || 0) / 100);
  const netTotal = costSubtotal + marginAmount;
  const gstAmount = netTotal * ((costs.gstRate || 0) / 100);
  const totalQuote = netTotal + gstAmount;

  /*
   * =========================================
   * SAVE CALCULATED VALUES TO JOB (PREVENT INFINITE LOOP)
   * =========================================
   */
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
      subtotal: netTotal,
      gst: gstAmount,
      total: totalQuote,
    });
  }, [
    costs.labour,
    costs.materials,
    costs.subcontractors,
    costs.otherCosts,
    costs.marginRate,
    costs.gstRate,
    netTotal,
    gstAmount,
    totalQuote,
  ]);

  /*
   * =========================================
   * UPDATE INPUT HANDLER
   * =========================================
   */
  const updateCost = (field: keyof QuoteCostData, value: string) => {
    if (value === '') {
      setCosts((prev) => ({ ...prev, [field]: 0 }));
      return;
    }
    const parsed = parseFloat(value);
    setCosts((prev) => ({
      ...prev,
      [field]: isNaN(parsed) ? 0 : parsed,
    }));
  };

  /*
   * =========================================
   * QUOTE INFORMATION
   * =========================================
   */
  const quoteNumber = job.id || '1391';
  const businessName = settings?.businessName || 'MY ELECTRICAL BUSINESS';
  const businessAddress = settings?.address || '[Business Address]';
  const businessPhone = settings?.phone || '[Phone Number]';
  const businessABN = settings?.abn || '[ABN]';
  const businessACN = settings?.acn || '[ACN]';
  const bankName = settings?.bankName || '[Bank Name]';
  const bsb = settings?.bsb || '[BSB]';
  const accountNumber = settings?.accountNumber || '[Account Number]';

  const customerName = job.customerName || '[Customer Name]';
  const customerAddress = job.jobAddress || '[Job Address]';
  const customerEmail = job.customerEmail || '-';
  const customerPhone = job.customerPhone || '-';

  const description =
    job.jobDescription ||
    job.scopeOfWork ||
    'Electrical installation, testing and related services';

  /*
   * =========================================
   * PRINT
   * =========================================
   */
  const handlePrint = () => {
    window.print();
  };

  /*
   * =========================================
   * COST INPUT COMPONENT
   * =========================================
   */
  const CostInput = ({
    label,
    field,
    percentage = false,
  }: {
    label: string;
    field: keyof QuoteCostData;
    percentage?: boolean;
  }) => {
    const currentValue = costs[field];

    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
        <div className="relative">
          {!percentage && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              $
            </span>
          )}
          <input
            type="number"
            min="0"
            step="any"
            value={currentValue === 0 ? '' : currentValue}
            onChange={(e) => updateCost(field, e.target.value)}
            placeholder="0"
            className={`
              w-full rounded-lg border border-slate-300 bg-white py-2.5
              ${percentage ? 'pl-3' : 'pl-8'}
              ${percentage ? 'pr-9' : 'pr-3'}
              text-sm font-medium text-slate-800 outline-none transition
              focus:border-blue-500 focus:ring-2 focus:ring-blue-100
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

  return (
    <>
      {/* =========================================
          QUOTE CALCULATOR (WEB ONLY - HIDDEN IN PRINT)
      ========================================== */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:hidden">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Quote Calculator</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter your costs. The subtotal, margin, GST and total are calculated automatically.
          </p>
        </div>

        {/* COST INPUTS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CostInput label="Labour" field="labour" />
          <CostInput label="Materials" field="materials" />
          <CostInput label="Subcontractors" field="subcontractors" />
          <CostInput label="Other Costs" field="otherCosts" />
        </div>

        {/* MARGIN / GST */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CostInput label="Margin (%)" field="marginRate" percentage />
          <CostInput label="GST Rate (%)" field="gstRate" percentage />
        </div>

        {/* CALCULATION SUMMARY */}
        <div className="mt-6 border-t border-slate-200 pt-6">
          <div className="ml-auto w-full max-w-md space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Cost Subtotal</span>
              <span className="font-semibold text-slate-800">
                ${costSubtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Margin ({costs.marginRate}%)</span>
              <span className="font-semibold text-slate-800">
                ${marginAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
              <span className="font-medium text-slate-600">Net Total</span>
              <span className="font-bold text-slate-900">
                ${netTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">GST ({costs.gstRate}%)</span>
              <span className="font-semibold text-slate-800">
                ${gstAmount.toFixed(2)}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-800 px-4 py-4">
              <span className="text-sm font-bold uppercase tracking-wide text-white">
                Total Quote (incl. GST)
              </span>
              <span className="text-xl font-bold text-white">
                ${totalQuote.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          EXPORT PDF BUTTON (WEB ONLY - HIDDEN IN PRINT)
      ========================================== */}
      <div className="mb-4 flex justify-end print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="
            inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5
            text-sm font-semibold text-white shadow-sm transition
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          "
        >
          <Printer className="h-4 w-4" />
          Export PDF
        </button>
      </div>

      {/* =========================================
          A4 QUOTE DOCUMENT
      ========================================== */}
      <div
        id="quote-document"
        className="
          mx-auto w-full max-w-[794px] bg-white text-slate-800 shadow-lg
          print:max-w-none print:shadow-none
        "
      >
        {/* =========================================
            HEADER WITH SPARKQUOTE SVG LOGO
        ========================================== */}
        <header className="border-b-4 border-slate-800 px-8 py-7 md:px-10">
          <div className="flex items-start justify-between gap-6">
            {/* NEW SPARKQUOTE LOGO (PURE SVG) */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1d5bd8] shadow-sm print:shadow-none">
                <svg
                  className="h-6 w-6 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-lg font-bold leading-tight text-slate-900">
                  SparkQuote
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Electrical Quote Assistant
                </span>
              </div>
            </div>

            {/* QUOTE NUMBER */}
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Electrical Quote
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                #{quoteNumber}
              </h2>
            </div>
          </div>
        </header>

        {/* BUSINESS / CUSTOMER */}
        <section className="px-8 py-7 md:px-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <div className="mb-3 border-b border-slate-200 pb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  From
                </h3>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-bold text-slate-900">{businessName}</p>
                <p className="text-slate-600">{businessAddress}</p>
                <p className="text-slate-600">ABN: {businessABN}</p>
                <p className="text-slate-600">ACN: {businessACN}</p>
                <p className="text-slate-600">Phone: {businessPhone}</p>
              </div>
            </div>

            <div>
              <div className="mb-3 border-b border-slate-200 pb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Bill To
                </h3>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-bold text-slate-900">{customerName}</p>
                <p className="text-slate-600">{customerAddress}</p>
                <p className="text-slate-600">Email: {customerEmail}</p>
                <p className="text-slate-600">Phone: {customerPhone}</p>
              </div>
            </div>
          </div>

          {/* DATE */}
          <div className="mt-7 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 md:grid-cols-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quote Number
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                #{quoteNumber}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Issue Date
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {dateStr}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Valid Until
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {validUntilStr}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Status
              </p>
              <p className="mt-1 text-sm font-semibold text-blue-600">QUOTE</p>
            </div>
          </div>
        </section>

        {/* SCOPE OF WORK */}
        <section className="px-8 md:px-10">
          <div className="mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
              Scope of Work
            </h3>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
              {description}
            </p>
          </div>
        </section>

        {/* QUOTE TABLE */}
        <section className="px-8 py-7 md:px-10">
          <div className="overflow-hidden rounded-lg border border-slate-300">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="w-[46%] px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Description
                  </th>
                  <th className="w-[10%] px-2 py-3 text-center font-semibold uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="w-[16%] px-3 py-3 text-right font-semibold uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="w-[16%] px-3 py-3 text-right font-semibold uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th className="w-[12%] px-3 py-3 text-right font-semibold uppercase tracking-wider">
                    GST
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="align-top">
                  <td className="border-t border-slate-300 px-4 py-4">
                    <p className="whitespace-pre-line font-medium leading-5 text-slate-800">
                      {description}
                    </p>
                  </td>
                  <td className="border-l border-t border-slate-300 px-2 py-4 text-center text-slate-700">
                    1
                  </td>
                  <td className="border-l border-t border-slate-300 px-3 py-4 text-right text-slate-700">
                    ${netTotal.toFixed(2)}
                  </td>
                  <td className="border-l border-t border-slate-300 px-3 py-4 text-right font-medium text-slate-800">
                    ${netTotal.toFixed(2)}
                  </td>
                  <td className="border-l border-t border-slate-300 px-3 py-4 text-right text-slate-700">
                    ${gstAmount.toFixed(2)}
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

        {/* TOTALS */}
        <section className="px-8 md:px-10">
          <div className="flex justify-end">
            <div className="w-full max-w-sm">
              <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
                <span className="font-medium text-slate-500">Cost Subtotal</span>
                <span className="font-semibold text-slate-800">
                  ${costSubtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
                <span className="font-medium text-slate-500">
                  Margin ({costs.marginRate}%)
                </span>
                <span className="font-semibold text-slate-800">
                  ${marginAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
                <span className="font-medium text-slate-500">Net Total</span>
                <span className="font-semibold text-slate-800">
                  ${netTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
                <span className="font-medium text-slate-500">
                  GST ({costs.gstRate}%)
                </span>
                <span className="font-semibold text-slate-800">
                  ${gstAmount.toFixed(2)}
                </span>
              </div>
              <div className="mt-1 flex justify-between rounded-lg bg-slate-800 px-4 py-3">
                <span className="text-sm font-bold uppercase tracking-wider text-white">
                  Total Quote (incl. GST)
                </span>
                <span className="text-lg font-bold text-white">
                  ${totalQuote.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* PAYMENT DETAILS */}
        <section className="px-8 py-8 md:px-10">
          <div className="grid grid-cols-1 gap-6 border-t border-slate-200 pt-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Payment Details
              </h3>
              <div className="space-y-1 text-xs text-slate-600">
                <p>
                  <span className="font-semibold text-slate-800">Bank:</span>{' '}
                  {bankName}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">BSB:</span> {bsb}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Account:</span>{' '}
                  {accountNumber}
                </p>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Payment Terms
              </h3>
              <p className="text-xs leading-5 text-slate-600">
                Payment is due within 7 days of completion unless otherwise agreed in writing.
              </p>
            </div>
          </div>
        </section>

        {/* TERMS */}
        <section className="border-t border-slate-200 px-8 py-7 md:px-10">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
            Terms & Conditions
          </h3>
          <ol className="list-decimal space-y-1.5 pl-4 text-[10px] leading-4 text-slate-500">
            <li>
              This quotation is valid for 30 days from the issue date unless otherwise stated.
            </li>
            <li>
              All electrical work will be carried out by appropriately licensed electrical workers and in accordance with applicable Australian legislation, regulations and relevant standards.
            </li>
            <li>
              Electrical installation work will be carried out in accordance with AS/NZS 3000 where applicable.
            </li>
            <li>
              Any additional work outside the agreed scope of work may be charged separately and will require approval where reasonably practicable.
            </li>
            <li>
              Access to the work area, existing services and suitable working conditions are to be provided by the customer.
            </li>
            <li>
              Any concealed defects, hazardous conditions or non-compliant existing electrical installations discovered during the work may require additional rectification work.
            </li>
            <li>
              Final payment is due within 7 days of completion unless different payment terms have been agreed in writing.
            </li>
          </ol>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 px-8 py-5 text-center md:px-10">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Thank you for your business
          </p>
          <p className="mt-1 text-[9px] text-slate-400">
            Generated with SparkQuote — Electrical Quote Assistant
          </p>
        </footer>
      </div>

      {/* =========================================
          STRICT EXPORT PDF / PRINT STYLES
      ========================================== */}
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

          /* 隐藏页面上除了报价单的所有顶栏、导航栏、计算器 */
          body > *:not(#quote-document) {
            display: none !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          /* 将报价单完美定位到 A4 顶部 */
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
          table, tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}
