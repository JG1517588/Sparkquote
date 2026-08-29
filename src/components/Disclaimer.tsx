import { AlertTriangle } from 'lucide-react';

export function Disclaimer() {
  return (
    <div className="rounded-lg bg-amber-50 p-4 ring-1 ring-amber-200">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-xs leading-relaxed text-amber-800">
          AI-generated information is provided as an administrative and planning aid only. All
          electrical design, installation, testing and compliance decisions must be verified by the
          appropriately licensed electrician and performed in accordance with applicable Australian
          requirements.
        </p>
      </div>
    </div>
  );
}
