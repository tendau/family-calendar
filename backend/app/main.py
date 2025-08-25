# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import events
from app.routers import google_sync  # import the Google sync router

# Create tables (if they don’t exist yet)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Family Calendar Backend", version="0.1")

# Allow your frontend origin
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:5174",  # Vite dev server (alternative port)
    "http://10.0.0.201:3000", # VM IP if you access it externally
    "http://10.0.0.201:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(events.router, prefix="/events", tags=["events"])
app.include_router(google_sync.router, prefix="/google", tags=["Google Calendar"])

@app.get("/")
def root():
    return {"message": "Family Calendar Backend is running"}
