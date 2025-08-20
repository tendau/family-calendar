# app/main.py
from fastapi import FastAPI
from app.database import engine, Base
from app.routers import events

# Create tables (if they don’t exist yet)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Family Calendar Backend", version="0.1")

# Include routers
app.include_router(events.router, prefix="/events", tags=["events"])


@app.get("/")
def root():
    return {"message": "Family Calendar Backend is running"}
