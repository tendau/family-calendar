#!/usr/bin/env python3
"""
Migration script to add google_id column to events table.
Run this script to update your existing database with the new google_id column.
"""

import sqlite3
import os

# Path to your database
DATABASE_PATH = "./data/calendar.db"

def migrate_database():
    """Add google_id column to events table if it doesn't exist."""
    
    if not os.path.exists(DATABASE_PATH):
        print(f"Database not found at {DATABASE_PATH}")
        return
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if google_id column already exists
        cursor.execute("PRAGMA table_info(events)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'google_id' in columns:
            print("google_id column already exists in events table")
        else:
            # Add google_id column
            cursor.execute("ALTER TABLE events ADD COLUMN google_id TEXT")
            print("Added google_id column to events table")
            
            # Create index on google_id for performance
            cursor.execute("CREATE INDEX idx_events_google_id ON events (google_id)")
            print("Created index on google_id column")
        
        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
