// ─── Policy Helpers ───────────────────────────────────────────────────────
// Maps agency types to policy categories and provides display utilities.

import { AgencyType, PolicyCategory, PolicyRecord } from '../types';

/** Map each agency type to a policy category */
const AGENCY_TO_CATEGORY: Record<AgencyType, PolicyCategory> = {
  commerce: 'Economic Policies',
  infrastructure: 'Economic Policies',
  diplomacy: 'Economic Policies',
  military: 'Military Policies',
  espionage: 'Military Policies',
  decree: 'Social Policies',
  faith: 'Social Policies',
  culture: 'Social Policies',
  justice: 'Social Policies',
};

/** Category display order */
export const POLICY_CATEGORY_ORDER: PolicyCategory[] = [
  'Economic Policies',
  'Military Policies',
  'Social Policies',
];

/** Category icons for display */
export const POLICY_CATEGORY_ICONS: Record<PolicyCategory, string> = {
  'Economic Policies': '💰',
  'Military Policies': '⚔️',
  'Social Policies': '👥',
};

/** Get the policy category for a given agency type */
export function agencyToCategory(agency: AgencyType): PolicyCategory {
  return AGENCY_TO_CATEGORY[agency];
}

/** Group policies by category, preserving order */
export function groupPoliciesByCategory(
  policies: PolicyRecord[],
): Record<PolicyCategory, PolicyRecord[]> {
  const grouped: Record<PolicyCategory, PolicyRecord[]> = {
    'Economic Policies': [],
    'Military Policies': [],
    'Social Policies': [],
  };

  for (const policy of policies) {
    grouped[policy.category].push(policy);
  }

  return grouped;
}

/** Get a human-readable direction label */
export function directionLabel(direction: string): string {
  switch (direction) {
    case 'left': return 'Rejected';
    case 'right': return 'Accepted';
    case 'up': return 'Escalated';
    case 'down': return 'Delayed';
    default: return direction;
  }
}

/** Format meter effect as a display string (e.g., "+5 Treasury" or "-3 Military") */
export function formatMeterEffect(meter: string, delta: number): string {
  const sign = delta >= 0 ? '+' : '';
  const label = meter.charAt(0).toUpperCase() + meter.slice(1);
  return `${sign}${delta} ${label}`;
}
