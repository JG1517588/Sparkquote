import { Settings as SettingsIcon, Save, Check, RotateCcw } from 'lucide-react';
import type { Settings } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { Disclaimer } from '@/components/Disclaimer';

interface Props {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onReset: () => void;
}

export function SettingsView({ settings, onChange, onReset }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Business details used on quotes and defaults for new jobs."
        icon={<SettingsIcon className="h-5 w-5" />}
        actions={
          <button
            onClick={onReset}
            className="btn-secondary"
          >
            <RotateCcw className="h-4 w-4" /> Reset to Defaults
          </button>
        }
      />

      <SectionCard title="Business Details" description="Appears in the header of every generated quote.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Business Name">
            <input
              className="input"
              value={settings.businessName}
              onChange={(e) => onChange({ businessName: e.target.value })}
              placeholder="e.g. Sparky Electrical Pty Ltd"
            />
          </Field>
          <Field label="ABN">
            <input
              className="input"
              value={settings.abn}
              onChange={(e) => onChange({ abn: e.target.value })}
              placeholder="e.g. 12 345 678 901"
            />
          </Field>
          <Field label="Business Address">
            <input
              className="input"
              value={settings.businessAddress}
              onChange={(e) => onChange({ businessAddress: e.target.value })}
              placeholder="e.g. 1 Workshop St, Sydney NSW 2000"
            />
          </Field>
          <div className="hidden sm:block" />
          <Field label="Business Phone">
            <input
              className="input"
              value={settings.businessPhone}
              onChange={(e) => onChange({ businessPhone: e.target.value })}
              placeholder="e.g. 02 9876 5432"
            />
          </Field>
          <Field label="Business Email">
            <input
              type="email"
              className="input"
              value={settings.businessEmail}
              onChange={(e) => onChange({ businessEmail: e.target.value })}
              placeholder="e.g. info@sparky.com.au"
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Quote Defaults" description="Default values applied to new jobs.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Default Margin (%)">
            <input
              type="number"
              min={0}
              step="0.1"
              className="input"
              value={settings.defaultMargin}
              onChange={(e) => onChange({ defaultMargin: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field label="Default GST Rate (%)">
            <input
              type="number"
              min={0}
              step="0.1"
              className="input"
              value={settings.defaultGstRate}
              onChange={(e) => onChange({ defaultGstRate: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field label="Quote Validity (days)">
            <input
              type="number"
              min={1}
              className="input"
              value={settings.quoteValidityDays}
              onChange={(e) => onChange({ quoteValidityDays: parseInt(e.target.value, 10) || 30 })}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        title="Terms & Conditions"
        description="Included at the bottom of every generated quote."
      >
        <textarea
          className="input min-h-[220px] resize-y text-sm leading-relaxed"
          value={settings.termsAndConditions}
          onChange={(e) => onChange({ termsAndConditions: e.target.value })}
        />
      </SectionCard>

      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
        <Check className="h-4 w-4" />
        Settings are saved automatically as you type.
      </div>

      <Disclaimer />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
