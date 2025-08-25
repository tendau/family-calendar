# backend/app/core/google.py
import datetime
from typing import List, Dict, Any
import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

# Scopes for read/write access to Google Calendar
SCOPES = ["https://www.googleapis.com/auth/calendar"]

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


def create_event(calendar_id: str, event_data: Dict[str, Any]) -> str:
    """
    Create a new event in Google Calendar.
    Returns the Google event ID of the created event.
    """
    creds = get_credentials()
    service = build("calendar", "v3", credentials=creds)

    # Format the event for Google Calendar API
    google_event = {
        "summary": event_data["title"],
        "description": event_data.get("description", ""),
    }

    # Handle all-day vs timed events
    if event_data.get("all_day", False):
        # For all-day events, use date format
        start_date = event_data["start_time"]
        end_date = event_data["end_time"]
        
        if isinstance(start_date, datetime.datetime):
            start_date = start_date.date()
        if isinstance(end_date, datetime.datetime):
            end_date = end_date.date()
            
        google_event["start"] = {"date": start_date.isoformat()}
        google_event["end"] = {"date": end_date.isoformat()}
    else:
        # For timed events, use dateTime format
        start_datetime = event_data["start_time"]
        end_datetime = event_data["end_time"]
        
        if isinstance(start_datetime, datetime.datetime):
            start_datetime = start_datetime.isoformat() + "Z"
        if isinstance(end_datetime, datetime.datetime):
            end_datetime = end_datetime.isoformat() + "Z"
            
        google_event["start"] = {"dateTime": start_datetime}
        google_event["end"] = {"dateTime": end_datetime}

    # Create the event
    event = service.events().insert(calendarId=calendar_id, body=google_event).execute()
    return event.get("id")


def update_event(calendar_id: str, google_event_id: str, event_data: Dict[str, Any]) -> str:
    """
    Update an existing event in Google Calendar.
    Returns the Google event ID of the updated event.
    """
    creds = get_credentials()
    service = build("calendar", "v3", credentials=creds)

    # Format the event for Google Calendar API
    google_event = {
        "summary": event_data["title"],
        "description": event_data.get("description", ""),
    }

    # Handle all-day vs timed events
    if event_data.get("all_day", False):
        # For all-day events, use date format
        start_date = event_data["start_time"]
        end_date = event_data["end_time"]
        
        if isinstance(start_date, datetime.datetime):
            start_date = start_date.date()
        if isinstance(end_date, datetime.datetime):
            end_date = end_date.date()
            
        google_event["start"] = {"date": start_date.isoformat()}
        google_event["end"] = {"date": end_date.isoformat()}
    else:
        # For timed events, use dateTime format
        start_datetime = event_data["start_time"]
        end_datetime = event_data["end_time"]
        
        if isinstance(start_datetime, datetime.datetime):
            start_datetime = start_datetime.isoformat() + "Z"
        if isinstance(end_datetime, datetime.datetime):
            end_datetime = end_datetime.isoformat() + "Z"
            
        google_event["start"] = {"dateTime": start_datetime}
        google_event["end"] = {"dateTime": end_datetime}

    # Update the event
    event = service.events().update(
        calendarId=calendar_id, 
        eventId=google_event_id, 
        body=google_event
    ).execute()
    return event.get("id")


def delete_event(calendar_id: str, google_event_id: str) -> bool:
    """
    Delete an event from Google Calendar.
    Returns True if successful, False otherwise.
    """
    try:
        creds = get_credentials()
        service = build("calendar", "v3", credentials=creds)
        
        service.events().delete(calendarId=calendar_id, eventId=google_event_id).execute()
        return True
    except Exception as e:
        print(f"Error deleting event {google_event_id}: {e}")
        return False
