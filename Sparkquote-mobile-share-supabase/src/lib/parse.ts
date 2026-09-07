import type { ParsedSections } from '@/types';
import { EMPTY_PARSED } from '@/types';

const HEADINGS: { key: keyof ParsedSections; patterns: RegExp[] }[] = [
  {
    key: 'scope',
    patterns: [/electrical\s+scope\s+of\s+works/i, /^scope\s+of\s+works/i, /^scope/i],
  },
  {
    key: 'materials',
    patterns: [/preliminary\s+materials\s+list/i, /^materials\s+list/i, /^materials/i],
  },
  {
    key: 'verification',
    patterns: [/site\s+verification\s+required/i, /^site\s+verification/i, /^verification/i],
  },
  {
    key: 'safety',
    patterns: [/safety\s*\/\s*compliance\s+considerations/i, /^safety/i, /^compliance/i],
  },
  {
    key: 'assumptions',
    patterns: [/^assumptions/i],
  },
  {
    key: 'review',
    patterns: [/items\s+requiring\s+electrician\s+review/i, /^items\s+requiring\s+review/i, /^electrician\s+review/i, /^review/i],
  },
];

export function parseResponse(raw: string): ParsedSections {
  const result: ParsedSections = { ...EMPTY_PARSED };
  if (!raw.trim()) return result;

  const lines = raw.split('\n');
  const sections: { key: keyof ParsedSections; start: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Detect markdown headings or lines that look like headings (short, no trailing punctuation, possibly numbered)
    const headingText = line.replace(/^#{1,6}\s+/, '').replace(/^\d+\.?\s+/, '').replace(/[:\-–—]\s*$/, '').trim();
    for (const h of HEADINGS) {
      if (sections.some((s) => s.key === h.key)) continue;
      if (h.patterns.some((p) => p.test(headingText)) && headingText.length < 80) {
        sections.push({ key: h.key, start: i + 1 });
        break;
      }
    }
  }

  const ordered = [...sections].sort((a, b) => a.start - b.start);

  for (let idx = 0; idx < ordered.length; idx++) {
    const { key, start } = ordered[idx];
    const end = idx + 1 < ordered.length ? ordered[idx + 1].start : lines.length;
    const content = lines
      .slice(start, end)
      .join('\n')
      .replace(/\s+$/, '')
      .trim();
    result[key] = content;
  }

  // Fallback: if nothing matched at all, dump everything into scope so the user sees it.
  if (!Object.values(result).some((v) => v.length > 0)) {
    result.scope = raw.trim();
  }

  return result;
}
