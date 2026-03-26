# Sovereign — AI Agent Guide

## Overview
Sovereign is a F2P card-swiping kingdom management game built with React Native / Expo Router. Think "Reigns" meets political intrigue with AI-enhanced narratives.

## Tech Stack
- **Framework:** React Native + Expo SDK 55 + Expo Router
- **State:** Zustand (no Redux, no Context for global state)
- **AI:** OpenAI + Anthropic via tiered LLM router (template/budget/premium)
- **Persistence:** AsyncStorage
- **Animation:** PanResponder (NOT react-native-reanimated)
- **Styling:** StyleSheet.create (no styled-components, no NativeWind)

## Project Structure
```
sovereign/
├── app/                  # Expo Router file-based routes
├── components/           # React Native components
├── config/               # AI config, feature flags
├── data/                 # Static game data (meters, cards, NPCs, etc.)
│   └── cards/            # Card pools by type
├── hooks/                # Custom React hooks
├── services/             # AI service layer, storage
├── stores/               # Zustand stores
├── theme/                # Colors, spacing, typography
├── types/                # TypeScript type definitions
└── utils/                # Pure utility functions
```

## Key Rules

### DO
- Use **relative imports** everywhere (e.g., `../types/cards`)
- Use **PanResponder** for swipe gestures
- Use **Zustand** for all global state
- Use **StyleSheet.create** for all styles
- Keep all card IDs **unique** across all card pools
- Use **dark theme** by default (#0a0a1a background)
- Make AI calls optional (game works fully offline with templates)

### DO NOT
- Use `@/` path aliases (breaks metro bundler)
- Use `react-native-reanimated` (causes build issues)
- Use `react-native-gesture-handler` for card swiping (use PanResponder)
- Import from `expo-constants` without null-checking `.expoConfig`
- Commit API keys or .env files
- Use Context API for global state (Zustand only)

## Architecture

### Game Flow
1. **Title** → 2. **Origin** (8 cards) → 3. **Gameplay** (swipe loop) → 4. **Death/Summary**
- Interludes appear between gameplay rounds
- Crisis cards interrupt normal flow when conditions are met
- Conversations are multi-beat NPC dialogues

### Meter System
5 meters (authority, populace, treasury, military, stability) range 0-100.
- Hitting 0 or 100 on ANY meter = death
- Each meter has unique low/high death narratives

### Card System
Cards have options mapped to swipe directions (left/right/up/down).
Each option has meter effects. Some have dice checks.
Card types: origin, base, crisis, district, interlude, conversation, followup.

### LLM Router
Three tiers:
1. **Template** ($0) — string templates with variable substitution
2. **Budget** — GPT-4o-mini for basic generation
3. **Premium** — GPT-4o or Claude for complex narratives

## Testing
```bash
npx expo start --web --port 8083    # Dev server
npx tsc --noEmit                     # Type check
```

## Common Patterns

### Adding a new card
1. Create card object in appropriate `data/cards/*.ts` file
2. Ensure ID is unique (prefix with type: `base_`, `crisis_`, etc.)
3. Card is auto-included via barrel exports
4. Add condition function if card should only appear under certain circumstances

### Adding a new NPC
1. Add VoiceProfile to `data/npcs.ts`
2. Add NPCDef to RECRUITABLE_NPCS or NON_RECRUITABLE_NPCS
3. Create conversation cards in `data/cards/conversation-cards.ts`
