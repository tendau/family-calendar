# backend/app/core/google.py
import datetime
from typing import List, Dict, Any
import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

# Scopes for read/write access (change to readonly if you only want to fetch)
SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]

# Path to your credentials JSON downloaded from Google Cloud
CREDENTIALS_FILE = os.environ.get("GOOGLE_CREDS", "app/core/credentials.json")

# Path to your saved token (from offline OAuth flow)
TOKEN_FILE = os.environ.get("GOOGLE_TOKEN", "app/core/token.json")


def get_credentials() -> Credentials:
    """
    Returns valid Google API credentials loaded from token.json.
    The token must have been generated manually on a machine with a browser.
    """
    if not os.path.exists(TOKEN_FILE):
        raise FileNotFoundError(
            f"Token file not found at {TOKEN_FILE}. Generate token.json locally first."
        )

    creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    if not creds.valid:
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            raise RuntimeError(
                "Credentials are invalid. Re-generate token.json via offline OAuth flow."
            )

    return creds


def fetch_events(calendar_id: str, max_results: int = 50) -> List[Dict[str, Any]]:
    """
    Fetch upcoming events from the specified Google Calendar.
    Returns a list of dicts with event details.
    """
    creds = get_credentials()
    service = build("calendar", "v3", credentials=creds)

    now = datetime.datetime.utcnow().isoformat() + "Z"
    events_result = (
        service.events()
        .list(
            calendarId=calendar_id,
            timeMin=now,
            maxResults=max_results,
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )
    events = events_result.get("items", [])

    formatted_events = []
    for e in events:
        # Handle datetime parsing for both date and dateTime fields
        start_time = e["start"].get("dateTime", e["start"].get("date"))
        end_time = e["end"].get("dateTime", e["end"].get("date"))
        all_day = "date" in e["start"]

        # Convert to datetime objects
        if all_day:
            start_time = datetime.datetime.strptime(start_time, "%Y-%m-%d")
            end_time = datetime.datetime.strptime(end_time, "%Y-%m-%d")
        else:
            start_time = datetime.datetime.fromisoformat(start_time.replace("Z", "+00:00")).replace(tzinfo=None)
            end_time = datetime.datetime.fromisoformat(end_time.replace("Z", "+00:00")).replace(tzinfo=None)

        formatted_events.append(
            {
                "title": e.get("summary", "No Title"),
                "description": e.get("description", ""),
                "start_time": start_time,
                "end_time": end_time,
                "all_day": all_day,
                "google_id": e.get("id"),
            }
        )

    return formatted_events
