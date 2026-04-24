# The Soigneur - Intervals.icu Coach Activity Monitor

A lightweight Google Apps Script that polls the [Intervals.icu](https://intervals.icu) API and sends a push notification via [ntfy.sh](https://ntfy.sh) whenever a coached athlete uploads a new activity.

---

## How It Works

A time-based trigger runs the script every 15–30 minutes. For each athlete in your list, it fetches their latest activity from the Intervals.icu API and compares its ID against the last known one stored in GAS's `PropertiesService`. If a new activity is detected, a notification is pushed to your ntfy topic. No database, no server, no third-party dependencies.

---

## Prerequisites

- A Google account (to use Google Apps Script)
- An [Intervals.icu](https://intervals.icu) account with API access
- A [ntfy.sh](https://ntfy.sh) topic (free, no account required)
- The athlete IDs you want to monitor (your athletes must grant you coach access on Intervals.icu)

---

## Step 1 — Get Your Intervals.icu API Key

1. Log in to [intervals.icu](https://intervals.icu)
2. Go to **Settings** → [https://intervals.icu/settings](https://intervals.icu/settings)
3. Scroll down to the **API Key** section
4. Copy your key — it will be used as the value of `API_KEY` in the script

> **Note:** The Intervals.icu API uses `apiKey` as a fixed username for Basic Auth. The script handles this automatically — you only need to supply the key itself.

---

## Step 2 — Choose Your ntfy Topic

ntfy.sh works on a pub/sub model with no account required. You publish to a topic and subscribe to it on any device.

**Pick a topic name** that is hard to guess (it acts as a shared secret since topics are public by default), eg:

```
my-coaching-alerts-x7k2
```

Set this as the value of `NTFY_TOPIC` in the script.

> I recommend installed the progressive web app thru Google Chrome.

> Subscribtion options:

### Subscribe via Browser

1. Go to [https://ntfy.sh/your_ntfy_topic](https://ntfy.sh/your_ntfy_topic) (replace with your actual topic name)
2. Click **Subscribe**
3. Allow browser notifications when prompted
4. Leave the tab open, or pin it — notifications will arrive even if the tab is in the background

### Subscribe via Unofficial NTFY Browser extension

> You've already done some work on previous steps

- [ntfy-browser](https://github.com/johman10/ntfy-browser)
- [Google Chrome](https://chromewebstore.google.com/detail/ntfy-chrome-extension/cdfpbcjnffgfghoglkbhlpmhigokobam?hl=en)
- [Mozilla Firefox](https://addons.mozilla.org/en-US/firefox/addon/ntfy/)


### Subscribe via Mobile App

| Platform | Link |
|----------|------|
| Android | [Google Play](https://play.google.com/store/apps/details?id=io.heckel.ntfy) |
| iOS | [App Store](https://apps.apple.com/us/app/ntfy/id1625396347) |

1. Install the ntfy app
2. Tap **+** to add a subscription
3. Enter your topic name (e.g. `my-coaching-alerts-x7k2`)
4. Tap **Subscribe**

Notifications will now arrive as standard push notifications on your device.

> **Privacy tip:** Anyone who knows your topic name can subscribe to it. Use a random or hard-to-guess name. For stronger security, ntfy.sh supports [access control](https://docs.ntfy.sh/config/#access-control) on self-hosted instances.

---

## Step 3 — Deploy the `gas-script.js` on Google Apps Script

### 3.1 — Create the Project

1. Go to [https://script.google.com](https://script.google.com)
2. Click **New project**
3. Delete the placeholder code in the editor
4. Paste the full `gas-script.js` 

### 3.2 — Configure Your Values

Edit the top of the script:

```javascript
const API_KEY    = 'your_intervals_api_key';   // from Step 1
const NTFY_TOPIC = 'your_ntfy_topic';           // from Step 2
const ATHLETES   = [
  { name: 'Athlete Name', id: 'ATHLETE_ID' },  // repeat for each athlete
];
```

To find an athlete's ID on Intervals.icu, open their profile page — the ID is the number in the URL:
```
https://intervals.icu/athlete/12345/activities
                                ^^^^^
```

### 3.3 — Run Once to Bootstrap

Before setting up the trigger, do a manual first run to seed the state (so you don't get notified for already-existing activities):

1. In the GAS editor, select `monitorAthletes` from the function dropdown
2. Click **Run**
3. Approve any permission prompts (the script needs access to external URLs)
4. Check the **Execution log** — you should see a `Bootstrap: seeded ...` line for each athlete

### 3.4 — Set Up the Time-Based Trigger

1. In the GAS editor, click the **clock icon** (Triggers) in the left sidebar, or go to **Extensions → Apps Script → Triggers**
2. Click **+ Add Trigger** (bottom right)
3. Configure as follows:

| Setting | Value |
|--------|-------|
| Function to run | `monitorAthletes` |
| Deployment | Head |
| Event source | Time-driven |
| Type | Minutes timer |
| Interval | Every 60 minutes should be fine |

> I don't recommend triggering it on a higher frequency due to GAS fetch rate limits.

4. Click **Save**

The script will now run automatically on your chosen interval.

---

## Limitations

- **Polling delay:** Notifications are not real-time. The maximum delay equals your trigger interval (15–30 min).
- **GAS execution limit:** Google Apps Script has a 6-minute hard timeout per execution. The script handles one athlete per loop iteration sequentially — if your roster grows beyond ~30 athletes, consider optimizing with `UrlFetchApp.fetchAll()`.
- **Strava-sourced activities:** Intervals.icu may not expose full metadata for activities synced via Strava through its API. This script only checks for the presence of a new activity ID, so detection still works regardless of the sync source.
- **ntfy.sh topic privacy:** Default topics on ntfy.sh are public. Use a non-guessable topic name.

---

## Todo

- Implement Signal/Telegram/Whatsapp webhooks for notifications - c'mon I've made this on 40min 🙂

---

## License

MIT