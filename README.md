# Namdhari Seva & Community — prototype (v7: Member + Team Lead)

Live demo: https://iiswaranii.github.io/namdhari-seva-demo/ — open it on your phone and use **Add to Home Screen**.

This is a clickable prototype for the **Member** and **Team Lead** roles. Switch between them in Profile → "Viewing as". There is no backend; the sample data lives on your device.

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

## Team Lead (v7)
- **Stories, Instagram-style composer:** text on gradient backgrounds (8 options, including grey) or on a photo. You can change the font, alignment and colour, drag the text to move it, and link a seva.
  - Max 2 stories per lead per day.
  - Stories disappear after 24 h.
  - You can delete your own story; it shows "Seen by".
- **Today at Delhi Central:** live seva, attendance due, tasks with no one, join requests.
- **Manage seva:** Live / Upcoming / Attendance / Done.
  - Create a seva with templates and tasks; it can repeat weekly.
  - Edit details, add, edit or delete tasks, ask for help, invite and remind members, post updates, cancel, and end a seva.
  - Every change notifies the people in that seva.
- **Attendance:** after a seva, mark Present or Absent, add walk-ins and set points (1–5). Sevadars get garden points and a notification.
- **Team:** members (search; filter by active, new or inactive; remind inactive members) and member details (message, invite, remove). Join requests can be approved or declined. Leads list. Invite link.
- **Insights (Team → Insights):** four health tiles (seva held, places filled, turn-up, started on time), each marked On target / Watch / Behind.
  - A "What needs attention" list with one-tap actions.
  - Simple charts: seva per week against the target, places filled by seva type, came vs said going, start delays, and active members over time. Tap any bar or dot for details.
- **Fixes:** the story progress bar and the move to the next story now run on one clock, so they always match. Story composer options apply in place: no flicker, and the keyboard stays open.

## v8
- **Stories:** when a lead posts a new story, the group's ring lights up again and moves to the front. Unseen groups come first, newest first. Each viewer has their own "seen" state. The header shows "Posted by <lead>", and tapping the name opens their profile. View counts are removed.
- **Profiles:** tap any member's name (team list, seva team, story poster, lead's people list) to see their profile and their garden, view-only, in 2D or 3D.
- **Garden as a 6×6 plot of boxes:** the 2D view is an isometric board of squares; 3D uses the same layout.
  - **Arrange:** tap an item to move it or put it away; pick from your items to place them; lay stone paths for free.
  - **Preview before you buy:** "Try" puts a ghost item in your garden. "Add to cart" keeps that spot, and after purchase the item lands there.
  - New purchases are placed automatically. Anything without a free box waits in storage.
- **Day by default:** 2D and 3D gardens stay in daylight whatever the app theme. A sun/moon button switches to night.

## v8.1
- **Pull down to refresh** on any screen: a spinner appears, the app re-reads the latest data, and you see "Up to date".
- **Real-time notifications:**
  - New alerts slide in as a banner at the top (tap to open). The bell and tab badges update instantly without reloading.
  - When the app is in the background and notifications are allowed, a phone notification is shown too.
  - **Live across tabs:** open the app in two tabs, one as Team Lead and one as Member (role is per tab). Anything the lead posts appears in the member tab immediately.
  - **One-phone demo:** while a seva you joined is live, your lead "sends" a few updates. Toggle this in App Settings.
- **For production:** true real-time between phones needs a backend push channel. Options are Supabase Realtime or Firebase (Firestore listeners + Cloud Messaging), plus Web Push for the installed PWA (iOS 16.4+ supports it from the Home Screen).

## v9 — Super Admin (Seva HQ)
Switch in Profile → "Viewing as" → **Admin**. Tabs: Stats · Seva · Feed · People · Profile. There is no garden for the admin.
- **Stats:**
  - **Filters:** one sticky row with period (7 days / 30 days / 3 months / 12 months), country, group and seva type.
  - **Live strip:** how many seva are running now.
  - **"Needs your attention":** red items need action, amber items are worth watching.
  - **Six KPI tiles:** seva held, places filled, turn-up, active members, started on time, attendance on time. Each shows On track / Watch / Needs action and the change vs the previous period; tap a tile for its detailed report.
  - **Charts:** seva over time, places filled with a target band, countries, team-lead performance (score + sparkline), seva types, a day-by-day heatmap, and blockers reported by leads.
- **Reports:** big number with the change vs the previous period, trend, a by-country and by-group breakdown (worst first, target line), and "what we see".
- **Group page:** lead score, KPIs, seva per week, team leads (assign / remove), recent seva, blockers.
- **Seva:** live, upcoming and needs-attention across all groups. "New seva" can target the whole sangat (HQ seva, auto-posted to the feed) or one group.
- **Feed:** "New post" with designed card types (Thought, Hukam, Alert, Information, Appreciation, Event) or plain long text, with a live preview. Admins can delete posts.
- **People:** groups by country, a searchable member list, and team leads. Make any member a team lead, or remove the role.
- Colours: red = needs action, amber = watch, green = on track, always with an icon and a word. Charts use the app indigo.

## v9.1
- **Stats filter:** one "Where" filter (countries with their groups inside; tick a whole country or any number of groups) next to period and seva type. All three fit in one row, with no sideways scrolling.
- **People filter:** the same "Where" filter plus name search on Groups, Members and Team leads.
- **New seva types:** Nasha Mukti, Donation, Langar stall, Clothes for needy, Social service (with templates for leads and admin).
- **Gender:** members choose Male or Female when joining (changeable in settings). Stats shows the male/female split for members, for people who came to seva, and by seva type.
- **Admin stories:** the Super Admin can post stories under "Seva HQ" (up to 5 a day).
- **Alert cards** are now clearly red.
- **Admin seva list (v9.2):** every seva card shows a location strip (🇮🇳 India › Delhi › Delhi Central), with an "HQ · all sangat" tag on HQ seva. The list is grouped by country with counts. Needs-attention items and the seva detail also show country · state · group.

## v10
- **Yes / No only:** "Maybe" is gone. "Yes, I'll come" asks for your arrival and leaving time (required), with quick picks for the whole seva or either half.
- **Hours:** members check in and check out at a live seva. Team leads (or the creator, or the admin) set or correct each person's in/out times when marking attendance, and total hours are recorded.
- **Live "Who's here":** live seva show who is here (since when, until when) and who is still coming, for members, leads and admin.
- **Post-seva report:** after attendance, the lead writes a short report: 🟢 good things, 🟡 feedback, 🔴 challenges, plus tags. It stays on record and is editable by the creator/leads.
- **Tags:** every seva has tags, picked when it is created and in the report.
- **Main events:** Darshan, a big mela or gathering. They get a glowing animated outline and a "✨ MAIN EVENT" ribbon on seva cards, events, feed posts and the detail page, plus a banner on Home. The admin can mark a seva or post as a main event.
- **Admin:**
  - The Stats top row shows Live now · Pending · Next 7 days. Pending opens a list of reported challenges, attendance due and reports due.
  - **Seva → Past:** every past seva, with who came (with times), hours, the team lead and the report.
  - **Seva → Reports:** every good thing, feedback and challenge, filtered by state and tag, with a by-tag chart.
- Editing a seva is limited to the creator, that area's team leads and the Main Admin.

## v11 — Clean start
- The app now starts **empty**: no seva, posts, stories, history or points. Only 13 people in 4 groups (Delhi Central, Ludhiana Jatha, Sri Bhaini Sahib, London Southall).
- **No team leads at first.** Super Admin › People › Members › tap a name › *Make team lead*. You can make yourself a lead too; until then the Team Lead switch is locked.
- Team Lead creates seva → members say Yes and pick times → after it ends the lead marks attendance and writes the report → Admin stats, Past and Reports fill from that real data.
- Admin Stats shows a 4-step *Get started* checklist until the first seva is closed.
- Profile › Settings › Prototype data: *Clean* (start from scratch) or the old demo data (*Demo new / busy / quiet*). *Reset prototype* also starts clean.

## v12 — Create: Seva / Event / Meeting
- One **Create** button stays at the bottom on every Seva tab (Manage, My Sevas, All · Live, Upcoming, Past, Reports) for team leads and admin.
- Create starts with **Seva · Event · Meeting**.
- Type is a **dropdown** with colour + icon. Seva types: Langar, Cleaning, Donation, Nasha Mukti, Social service, Education, Medical camp, Gau seva, Tree planting, Relief, Clothes for needy, Langar stall.
- **Main events** sit in their own gold section at the top: Satguru Ji Darshan, Hola Mohalla Mela, Basant Panchami Mela, Parkash Purab, Jyoti Jyot Diwas, Shaheedi Samagam, Main Samagam. The name is fixed (so HQ can group them) with an optional extra line, e.g. "Delhi visit". For a main seva you also pick what seva happens at it.
- Meetings can be **Team leads only** or **Everyone**; members never see leads-only meetings. Events and meetings show in lead Upcoming and admin Upcoming.

## v13 — Special + Urgent
- The fixed main-event list is gone. Each kind has **one highlighted special type** at the top of the type dropdown: *Special program* (seva), *Special event*, *Special meeting*. It glows everywhere; the **name is typed freely** by whoever creates it.
- New **Urgent / important** toggle on seva, events and meetings: red frame + red URGENT tag on cards and detail pages, a red banner on Home and admin Stats, and red notifications.
- Titles are always editable.

## v14 — Profile photos + profile peek
- Add/change your photo from Profile (camera button on your picture). The phone crops it square and shrinks it to 320×320 WebP before saving (~15–40 KB for a real photo).
- Tapping any name or face opens a **profile peek** from the bottom: photo, role, group, **member ID**, seva done, Full profile, Message, **Share profile link** (`#user=Name~group`).
- Same names: the peek warns when more than one person has the name and lists the other one(s) with group + ID. Admin member lists show the ID when names repeat. Clean data now has two *Harpreet Kaur* (Delhi and Ludhiana) to try it.
- Production note: photos belong in object storage (Supabase Storage / Cloudflare R2) behind a CDN; the database keeps only the URL.
