# ForgetMeNot AI

ForgetMeNot AI is a mobile-first personal omission prediction engine. Instead of only reminding someone about tasks they already know, it looks for the likely gaps between their plans, places, people, and everyday context.

## Product surface

- **AI Home** — a daily signal overview with emerging omissions and recent context.
- **AI Events** — a week view that treats events as context, not just a checklist.
- **AI Capture** — add a note, photo signal, or voice signal for future inference.
- **AI Chat** — talk through a thought with the second-brain assistant.
- **AI Profile** — manage the signal sources and personal sensitivity.
- **AI Prediction** — review likely omissions with confidence and explanation.
- **AI List of Actions** — turn a prediction into a small preventive action.
- **AI ForgetMeNot** — browse the personal signal map and captured context.
- **Contact Us** — send product feedback to the team.

## Run

Use the `artifacts/forgetmenot-ai: expo` workflow. The app is frontend-first and runs in Expo Go. The first build uses local state so every core interaction is available without a server or account.

## Visual language

The app uses a black canvas with bright pink, electric cyan, fluorescent green, and soft gold accents. The globe with an “F” is the recurring visual anchor: it represents a personal orbit of context and the intelligence looking between signals.

## File map

- `app/index.tsx` — all initial screens and product interactions.
- `constants/colors.ts` — semantic ForgetMeNot palette.
- `assets/images/` — generated app icon and AI artwork.
- `docs/ARCHITECTURE.md` — implementation and evolution notes.