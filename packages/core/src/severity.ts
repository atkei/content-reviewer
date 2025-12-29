type SeverityConfig = Readonly<{
  priority: number;
}>;

const SEVERITIES = {
  error: { priority: 3 },
  warning: { priority: 2 },
  suggestion: { priority: 1 },
} as const satisfies Record<string, SeverityConfig>;

type SeverityKey = keyof typeof SEVERITIES;

const DEFAULT: SeverityKey = 'warning';

export type IssueSeverity = SeverityKey;

export const SEVERITY_LEVELS: { [K in IssueSeverity]: number } = Object.fromEntries(
  Object.entries(SEVERITIES).map(([k, v]) => [k, v.priority])
) as { [K in IssueSeverity]: number };

export const DEFAULT_SEVERITY_LEVEL: IssueSeverity = DEFAULT;
