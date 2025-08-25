# app/routers/events.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.event import Event
from app.schemas.event import EventCreate, EventRead, EventUpdate
from app.core import google

router = APIRouter()

# Replace with your family calendar ID
FAMILY_CALENDAR_ID = "family02176623069150856419@group.calendar.google.com"

# ------------------------------
# Create Event
# ------------------------------
@router.post("/", response_model=EventRead)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    # Create event in local database first
    db_event = Event(
        title=event.title,
        description=event.description,
        start_time=event.start_time,
        end_time=event.end_time,
        all_day=event.all_day
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    # Try to sync to Google Calendar
    try:
        event_data = {
            "title": db_event.title,
            "description": db_event.description,
            "start_time": db_event.start_time,
            "end_time": db_event.end_time,
            "all_day": db_event.all_day
        }
        google_event_id = google.create_event(FAMILY_CALENDAR_ID, event_data)
        
        # Update the event with the Google ID
        db_event.google_id = google_event_id
        db.commit()
        db.refresh(db_event)
        
    except Exception as e:
        # Log the error but don't fail the request
        print(f"Failed to sync event to Google Calendar: {e}")
        # Event is still created locally, just not synced to Google
    
    return db_event

# ------------------------------
# Get single Event
# ------------------------------
@router.get("/{event_id}", response_model=EventRead)
def read_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event

# ------------------------------
# List Events (optional filter by year/month)
# ------------------------------
@router.get("/", response_model=List[EventRead])
def list_events(
    year: Optional[int] = Query(None, description="Filter by year"),
    month: Optional[int] = Query(None, description="Filter by month"),
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    if year and month:
        start = datetime(year, month, 1)
        if month == 12:
            end = datetime(year + 1, 1, 1)
        else:
            end = datetime(year, month + 1, 1)
        query = query.filter(Event.start_time >= start, Event.start_time < end)
    events = query.order_by(Event.start_time).all()
    return events

# ------------------------------
# Update Event
# ------------------------------
@router.put("/{event_id}", response_model=EventRead)
def update_event(event_id: int, event: EventUpdate, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Update local event
    for field, value in event.dict().items():
        setattr(db_event, field, value)

    db.commit()
    db.refresh(db_event)
    
    # Try to sync changes to Google Calendar if it has a google_id
    if db_event.google_id:
        try:
            event_data = {
                "title": db_event.title,
                "description": db_event.description,
                "start_time": db_event.start_time,
                "end_time": db_event.end_time,
                "all_day": db_event.all_day
            }
            google.update_event(FAMILY_CALENDAR_ID, db_event.google_id, event_data)
        except Exception as e:
            print(f"Failed to sync event update to Google Calendar: {e}")
            # Continue anyway - local update succeeded

    return db_event

# ------------------------------
# Delete Event
# ------------------------------
@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Try to delete from Google Calendar if it has a google_id
    if db_event.google_id:
        try:
            google.delete_event(FAMILY_CALENDAR_ID, db_event.google_id)
        except Exception as e:
            print(f"Failed to delete event from Google Calendar: {e}")
            # Continue anyway - we'll still delete locally

    # Delete from local database
    db.delete(db_event)
    db.commit()
    return {"detail": "Event deleted successfully"}
