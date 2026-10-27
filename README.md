# Namdhari Seva & Community — member prototype (v6.1)

Live demo: https://iiswaranii.github.io/namdhari-seva-demo/ — open it on your phone and use **Add to Home Screen**.

This is a clickable prototype for the **Member** role only. There is no backend; the sample data lives on your device.

## What's inside
- **Home (Instagram-style)**
  - **Stories row:** only team leads can post stories, at most 2 per lead per day. Each story appears under the group's name (Delhi, Ludhiana, Sri Bhaini Sahib…), never the lead's. Stories from several leads queue inside one group ring.
  - **Story viewer, Instagram-style:** tap right for the next story, which moves on to the next group when the current one ends; tap left to go back. Swipe left/right to switch groups with a cube turn. Hold to pause (the controls hide), swipe down to close.
  - **Live seva cards** at the top, in a swipeable carousel with dots when several are live.
  - **Official feed:** only the Super Admin posts here, text only. It loads 3 posts at a time as you scroll.
  - **HQ seva:** a seva the Main Admin creates (e.g. at Sri Bhaini Sahib) appears in the feed and in Seva → All Opportunities. It is pinned on top and highlighted as "not your area", and stays in the feed as a record after it ends. Posts appear as designed cards: Thought of the Day, Satguru Ji's Hukam, Alert, Information, Appreciation, and Event (with RSVP).
  - **Reactions:** 🙏 Gratitude and 🤝 Support. Double-tap a card to say 🙏.
- **Seva**
  - My Sevas / All Opportunities, filtered by Ongoing / Upcoming / Completed.
  - A coloured date block replaces the image on every card.
  - Live seva gets a big **LIVE** label, and a LIVE tag appears on the bottom-bar Seva icon.
  - Calendar view.
  - **Seva detail:** hero, "You're Participating", and tabs for Overview / Tasks / Team / Updates. It also shows Seva progress, Tasks for You, Mark Task Complete, task picking (unclaimed tasks are highlighted), and Message lead.
  - **Tab badges** stay until dealt with: tasks still to tick (amber), new tasks and unread updates (red), and "!" when you haven't picked a task.
- **Garden**
  - A scenic animated garden.
  - Every verified seva is one contribution and +3 points. Each contribution unlocks the next item.
  - Special items need conditions, e.g. the Cherry blossom needs 2 Langar seva.
  - Shop with a cart, a confirmation step, points deducted, and the remaining balance shown.
  - Optional 3D view.
- **Profile**
  - Contributions, Unlocked and Points. Seva hours are not shown.
  - My Seva Journey, My Garden, My Commitments, **My Team** (Delhi Central members, leads, search), Notifications, and App Settings (theme and prototype member state).

Plain HTML/CSS/JS, no build step. `garden3d.js` and three.js load only when you open the 3D view.
