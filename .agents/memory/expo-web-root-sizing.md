---
name: Expo web root sizing
description: A web-preview layout constraint for Expo apps using gesture-handler providers.
---

When an Expo Router app boots with a healthy Metro workflow but the web preview is a blank white page, check that the `GestureHandlerRootView` wrapper explicitly has `flex: 1`.

**Why:** The web implementation can otherwise fail to claim the viewport even though the React tree is mounted and there is no useful runtime error.

**How to apply:** Keep the root provider wrapper sized explicitly in first-build Expo apps and validate the proxied web preview after restarting the managed workflow.