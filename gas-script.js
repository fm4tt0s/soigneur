// config
const API_KEY    = 'your_intervals_api_key';
const NTFY_TOPIC = 'your_ntfy_topic';
const ATHLETES   = [
  { name: 'Athlete A', id: '12345' },
  { name: 'Athlete B', id: '67890' },
];

// do not change anything beyond this point. or change. I'm just a JS comment, not a police officer
// main polling function, bound to time-based trigger
function monitorAthletes() {
  const props = PropertiesService.getScriptProperties();

  ATHLETES.forEach(athlete => {
    try {
      const url = `https://intervals.icu/api/v1/athlete/${athlete.id}/activities?limit=1`;
      const response = UrlFetchApp.fetch(url, {
        headers: {
          'Authorization': 'Basic ' + Utilities.base64Encode('apiKey:' + API_KEY)
        },
        muteHttpExceptions: true
      });

      if (response.getResponseCode() !== 200) {
        throw new Error(`HTTP ${response.getResponseCode()}`);
      }

      const activities = JSON.parse(response.getContentText());
      if (!activities || activities.length === 0) return;

      const latestId   = String(activities[0].id);
      const lastSeenId = props.getProperty(`last_id_${athlete.id}`);

      if (lastSeenId === null) {
        props.setProperty(`last_id_${athlete.id}`, latestId);
        console.log(`Bootstrap: seeded ${athlete.name} → ${latestId}`);
        return;
      }

      if (latestId !== lastSeenId) {
        sendNtfy(athlete.name, athlete.id, activities[0].id);
        props.setProperty(`last_id_${athlete.id}`, latestId);
      }

    } catch (e) {
      console.error(`[${athlete.name}] ${e.message}`);
    }
  });
}

// notification helper
function sendNtfy(athleteName, athleteId, activityId) {
  UrlFetchApp.fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
    method: 'POST',
    payload: athleteName,
    headers: {
      'Title': 'New Activity',
      'Click': `https://intervals.icu/athlete/${athleteId}/activities/${activityId}`
    }
  });
}