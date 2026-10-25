# Namdhari Seva & Community — member prototype

Clickable, installable PWA prototype of the **Member** experience, following the *Product Experience Redesign V2.0* brief.
No backend: all data is sample data stored on your own device.

**Live:** https://iiswaranii.github.io/namdhari-seva-demo/

## Install on your phone
- **iPhone:** open the link in Safari → Share → **Add to Home Screen**.
- **Android:** open in Chrome → ⋮ menu → **Install app**.

## What's in it
- **Home** (in this order): header with inbox, share and profile; one **priority card** chosen by a fixed ranking (Happening now → Needs your action → Coming up → Invitation → Your next opportunity); the **My Seva mosaic** (Completed this month · Upcoming next 30 days · Needs action) with the latest verified seva; **Next up**, never repeating the priority card; one **Together this week** community moment.
- **Seva tab:** Explore (seva and events, NEW badges until opened) · My Seva (Needs action · Upcoming · Ongoing · Completed) · History timeline.
- **Live seva page:** your role, meeting point, task checklist, check-in, message lead, directions, and progress (Scheduled → In progress → Submitted → Verified). Completed counts only after the lead verifies.
- **Check-in button** (round button beside the nav): scan the lead's QR, or enter a code.
- **Events** are separate from seva: RSVP, agenda, linked volunteer roles. They never count as completed seva.
- **Community:** Local / Worldwide official stories (seva stories, events, important updates), the collective group garden, and three positive reactions. No comments or member posts.
- **Profile:** private journey stats, appearance (System/Light/Dark plus accent colours), notification settings.
- **Share cards:** "This month" or a single verified seva as an image (dark, light, transparent) for WhatsApp status or stories.

## Try the three member states
Profile → *Prototype: try member states* → **New**, **Active** or **Less active**.
On a live seva, use *Prototype controls* to end it, then verify it. This shows the "Awaiting verification" step.

## Stack
Plain HTML/CSS/JS, no build step. `manifest.webmanifest` + `sw.js` provide installability and an offline shell.
