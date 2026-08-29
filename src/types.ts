export type JobType =
  | 'New Build'
  | 'Renovation'
  | 'Extension'
  | 'Maintenance'
  | 'Fault Finding'
  | 'Switchboard'
  | 'Lighting'
  | 'Other';

export const JOB_TYPES: JobType[] = [
  'New Build',
  'Renovation',
  'Extension',
  'Maintenance',
  'Fault Finding',
  'Switchboard',
  'Lighting',
  'Other',
];

export interface JobFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: 'Site Photos' | 'PDF Plans' | 'Other Documents';
  uploadedAt: string;
}

export interface ParsedSections {
  scope: string;
  materials: string;
  verification: string;
  safety: string;
  assumptions: string;
  review: string;
}

export interface Quote {
  labour: number;
  materials: number;
  subcontractors: number;
  otherCosts: number;
  marginPercent: number;
  gstRate: number;
}

export interface Job {
  id: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  jobAddress: string;
  jobType: JobType;
  jobDescription: string;
  files: JobFile[];
  aiPrompt: string;
  aiResponse: string;
  parsed: ParsedSections;
  quote: Quote;
  notes: string;
  status: 'Draft' | 'Prompted' | 'Analysed' | 'Quoted';
}

export interface Settings {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  abn: string;
  termsAndConditions: string;
  quoteValidityDays: number;
  defaultGstRate: number;
  defaultMargin: number;
}

export const DEFAULT_SETTINGS: Settings = {
  businessName: '',
  businessAddress: '',
  businessPhone: '',
  businessEmail: '',
  abn: '',
  termsAndConditions:
    '1. This quote is valid for 30 days from the date of issue.\n2. A 50% deposit may be required to secure the booking.\n3. Final payment is due within 7 days of completion.\n4. All work is carried out in accordance with AS/NZS 3000 and relevant Australian Standards.\n5. Any variations to the agreed scope of works will be quoted separately.\n6. The electrician holds a current Australian electrical licence and appropriate insurance.',
  quoteValidityDays: 30,
  defaultGstRate: 10,
  defaultMargin: 20,
};

export const EMPTY_PARSED: ParsedSections = {
  scope: '',
  materials: '',
  verification: '',
  safety: '',
  assumptions: '',
  review: '',
};

export function emptyQuote(settings: Settings): Quote {
  return {
    labour: 0,
    materials: 0,
    subcontractors: 0,
    otherCosts: 0,
    marginPercent: settings.defaultMargin,
    gstRate: settings.defaultGstRate,
  };
}
