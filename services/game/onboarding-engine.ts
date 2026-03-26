// ─── Onboarding Engine ────────────────────────────────────────────────────
// Progressive disclosure state machine for the origin sequence.
// Unlocks UI features as the player progresses through origin cards.
//
// Card 2  -> authority meter unlocked
// Card 3  -> populace + treasury meters
// Card 4  -> military + stability meters
// Card 6  -> trait selection
// Card 7  -> court panel
// Card 8  -> map panel

export type OnboardingFeature =
  | 'authority'
  | 'populace'
  | 'treasury'
  | 'military'
  | 'stability'
  | 'trait'
  | 'court'
  | 'map';

interface OnboardingState {
  unlockedFeatures: Set<OnboardingFeature>;
  currentOriginCard: number;
}

const UNLOCK_SCHEDULE: Record<number, OnboardingFeature[]> = {
  2: ['authority'],
  3: ['populace', 'treasury'],
  4: ['military', 'stability'],
  6: ['trait'],
  7: ['court'],
  8: ['map'],
};

export function createOnboardingState(): OnboardingState {
  return {
    unlockedFeatures: new Set(),
    currentOriginCard: 0,
  };
}

/**
 * Advance the onboarding to a given origin card number.
 * Unlocks all features scheduled at or before that card.
 */
export function advanceOnboarding(
  state: OnboardingState,
  cardNumber: number,
): { state: OnboardingState; newUnlocks: OnboardingFeature[] } {
  const newUnlocks: OnboardingFeature[] = [];
  const next = new Set(state.unlockedFeatures);

  for (let i = state.currentOriginCard + 1; i <= cardNumber; i++) {
    const features = UNLOCK_SCHEDULE[i];
    if (features) {
      for (const f of features) {
        if (!next.has(f)) {
          next.add(f);
          newUnlocks.push(f);
        }
      }
    }
  }

  return {
    state: {
      unlockedFeatures: next,
      currentOriginCard: cardNumber,
    },
    newUnlocks,
  };
}

/** Check if a specific feature has been unlocked */
export function isFeatureUnlocked(state: OnboardingState, feature: OnboardingFeature): boolean {
  return state.unlockedFeatures.has(feature);
}

/** Get all unlocked features as an array */
export function getUnlockedFeatures(state: OnboardingState): OnboardingFeature[] {
  return Array.from(state.unlockedFeatures);
}

/** Check if the full onboarding is complete (all 8 origin cards played) */
export function isOnboardingComplete(state: OnboardingState): boolean {
  return state.currentOriginCard >= 8;
}
