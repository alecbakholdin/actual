import type { FeatureFlag } from 'loot-core/types/prefs';

import { useSyncedPref } from './useSyncedPref';

const DEFAULT_FEATURE_FLAG_STATE: Record<FeatureFlag, boolean> = {
  goalTemplatesEnabled: false,
  goalTemplatesUIEnabled: false,
  actionTemplating: false,
  contextMenus: false,
  openidAuth: false,
  pluggyAiBankSync: false,
  pendingTransactionsEnabled: false,
};

export function useFeatureFlag(name: FeatureFlag): boolean {
  const [value] = useSyncedPref(`flags.${name}`);

  return value === undefined
    ? DEFAULT_FEATURE_FLAG_STATE[name] || false
    : String(value) === 'true';
}
