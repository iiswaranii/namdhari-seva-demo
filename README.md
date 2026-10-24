# Namdhari Seva & Community — mobile demo

A clickable, installable PWA demo of the Namdhari Seva & Community app (spec v1.0, Oct 2026).
No backend: all data is sample data stored on your own device.

**Live demo:** https://iiswaranii.github.io/namdhari-seva-demo/

## Install on your phone
- **iPhone:** open the link in Safari → Share → **Add to Home Screen** → Add.
- **Android:** open in Chrome → ⋮ menu → **Install app** / **Add to Home screen**.

## What to try
1. Join the invited group, enter your name (try "Under 18" to see the guardian-approval state).
2. **Seva tab:** open a seva, join a role, join a waitlist when full, tap *Can't make it* to see auto-offer to the waitlist.
3. **Calendar / WhatsApp** buttons on any seva or event.
4. **Community:** Local vs Worldwide stories, three positive reactions (one per post).
5. **Profile:** Seva Passport stamps, private intention ring, thank-you notes, test a reminder notification (works once installed).
6. Switch **Demo view as → Team Lead:** needs-attention queue, attendance roster, check-in QR, under-a-minute completion form with auto recap → story drafted and garden grows.
7. Switch to **Main Admin:** KPIs with region filter, story review queue, CSV export.

Use *Profile → Reset demo* to start over.

## New in v2
- **Personal garden:** every seva unlocks plants and pieces (marigolds → bench → lotus pond → peacock → banyan). Tap *Design* to lay out paths and plants, tap any plant to see it up close, or *Walk in 3D* for a blocky first-person stroll (3D engine loads only when opened).
- **Home:** seva rings (seva, hours, sangat), happening-now, up next, new-for-you.
- **Alerts:** urgent = red, changes = amber, new seva = green; NEW badges stay until you open the item.
- **Community:** only seva successes (green), events (blue) and important alerts (orange), with filters.
- **Themes:** System / Light / Dark plus Forest, Ocean, Dusk, Earth colour themes.

## Stack
Plain HTML/CSS/JS, no build step. `manifest.webmanifest` + `sw.js` for installability and offline shell.
