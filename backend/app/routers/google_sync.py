# backend/app/api/google_sync.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core import google
from app.database import get_db
from app.models.event import Event

router = APIRouter()

# Replace with your family calendar ID
FAMILY_CALENDAR_ID = "family02176623069150856419@group.calendar.google.com"


@router.post("/sync")
def sync_google_calendar(db: Session = Depends(get_db)):
    """
    Fetch events from Google Calendar and sync them with the local DB.
    This includes adding new events, updating existing ones, and removing deleted events.
    """
    try:
        events = google.fetch_events(FAMILY_CALENDAR_ID)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Google events: {e}")

    synced_count = 0
    deleted_count = 0
    
    # Get all Google IDs from the fetched events
    google_event_ids = {e["google_id"] for e in events}
    
    # Process each event from Google Calendar
    for e in events:
        # Check if event already exists in DB by google_id
        existing_event = db.query(Event).filter(Event.google_id == e["google_id"]).first()
        if existing_event:
            # Update existing event
            existing_event.title = e["title"]
            existing_event.description = e["description"]
            existing_event.start_time = e["start_time"]
            existing_event.end_time = e["end_time"]
            existing_event.all_day = e["all_day"]
        else:
            # Insert new event
            new_event = Event(
                title=e["title"],
                description=e["description"],
                start_time=e["start_time"],
                end_time=e["end_time"],
                all_day=e["all_day"],
                google_id=e["google_id"],
            )
            db.add(new_event)
        synced_count += 1

    # Find and delete local events that no longer exist in Google Calendar
    # Only delete events that have a google_id (i.e., were synced from Google)
    local_google_events = db.query(Event).filter(Event.google_id.isnot(None)).all()
    
    for local_event in local_google_events:
        if local_event.google_id not in google_event_ids:
            db.delete(local_event)
            deleted_count += 1

    db.commit()
    return {
        "status": "ok", 
        "synced": synced_count, 
        "deleted": deleted_count,
        "message": f"Synced {synced_count} events, deleted {deleted_count} events"
    }
