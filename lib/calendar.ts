// lib/calendar.ts
import { google } from 'googleapis';

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/calendar']
});

const calendar = google.calendar({ version: 'v3', auth });

export async function createCalendarEvent(event: {
  summary: string;
  description: string;
  start: string; // ISO format
  end: string;   // ISO format
}) {
  await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.start, timeZone: 'America/Toronto' },
      end: { dateTime: event.end, timeZone: 'America/Toronto' },
    },
  });
}
