# ForgetMeNot AI — architecture notes

## Current first-build approach

This first build is a local, frontend-first Expo experience. Navigation is kept intentionally small: a single root route owns the product surface and switches between the nine focused views. That keeps the prototype fast in Expo Go while still making the product interactions feel complete.

Captured signals live in component state for this version. The capture screen writes a new signal and routes the user to the Signal Map so the new context is immediately visible.

## Navigation model

The primary navigation exposes Home, Events, Capture, Chat, and You. Home links into the secondary focused screens:

- Omission radar
- Prevent the omission
- Signal map
- Talk to us

The focused screens use a shared back affordance and hide the bottom navigation so the user can stay in the thought they opened.

## Domain model

The current UI uses three small client-side models:

- `CapturedItem` — a signal title, supporting detail, source tag, and accent color.
- `Prediction` — an inferred possible omission with explanation, metadata, and confidence score.
- `Event` — an upcoming contextual event with time, category, and accent.

When persistence is introduced, these models should move behind a local storage context first, then a server API when cross-device intelligence is needed.

## Next production seams

1. Add an `AsyncStorage` context for captured signals, action completion, and user preferences.
2. Replace prediction seed data with a prediction endpoint that returns an explanation trace safe for the user to inspect.
3. Add native camera, microphone, calendar, contacts, and location permission flows around the Capture and Profile surfaces.
4. Keep the privacy notice and source visibility present when integrating external context providers.

## Design principles

- Predict, explain, then offer one small preventive action.
- Use color as semantic signal language: pink for personal attention, cyan for context, green for completed/prevented, gold for practical care.
- Avoid making the product feel like a calendar or task manager.
- Keep the F-in-globe mark present as a quiet visual reminder of the personal signal orbit.