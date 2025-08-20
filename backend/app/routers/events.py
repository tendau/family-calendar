# app/routers/events.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.event import Event
from app.schemas.event import EventCreate, EventRead, EventUpdate

router = APIRouter()

# ------------------------------
# Create Event
# ------------------------------
@router.post("/", response_model=EventRead)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
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

    for field, value in event.dict().items():
        setattr(db_event, field, value)

    db.commit()
    db.refresh(db_event)
    return db_event

# ------------------------------
# Delete Event
# ------------------------------
@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(db_event)
    db.commit()
    return {"detail": "Event deleted successfully"}
