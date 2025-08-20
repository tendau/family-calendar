# backend/app/core/google.py
import datetime
from typing import List, Dict, Any
import os
import pickle

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# Scopes for read/write access (change to readonly if you only want to fetch)
SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]

# Path to your credentials JSON downloaded from Google Cloud
CREDENTIALS_FILE = os.environ.get("GOOGLE_CREDS", "app/core/credentials.json")

# Path to store user tokens locally
TOKEN_FILE = os.path.join(os.path.dirname(__file__), "token.pickle")


def get_credentials() -> Credentials:
    """
    Returns valid Google API credentials. If no token exists, it triggers OAuth flow.
    """
    creds = None
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "rb") as token:
            creds = pickle.load(token)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)

        # Save the credentials for next run
        with open(TOKEN_FILE, "wb") as token:
            pickle.dump(creds, token)

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
            # For all-day events, date is in YYYY-MM-DD format
            start_time = datetime.datetime.strptime(start_time, "%Y-%m-%d")
            end_time = datetime.datetime.strptime(end_time, "%Y-%m-%d")
        else:
            # For timed events, dateTime is in ISO format
            # Remove timezone info and parse
            if start_time.endswith('Z'):
                start_time = datetime.datetime.fromisoformat(start_time[:-1])
            else:
                # Handle timezone offset (e.g., +00:00)
                start_time = datetime.datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                start_time = start_time.replace(tzinfo=None)  # Remove timezone for simplicity
            
            if end_time.endswith('Z'):
                end_time = datetime.datetime.fromisoformat(end_time[:-1])
            else:
                # Handle timezone offset (e.g., +00:00)
                end_time = datetime.datetime.fromisoformat(end_time.replace('Z', '+00:00'))
                end_time = end_time.replace(tzinfo=None)  # Remove timezone for simplicity
        
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
