# Google Calendar Sync Setup

## Important: Permission Update Required

The Google Calendar integration has been updated to support **bidirectional sync** (read AND write). This means:

- ✅ **Pull events** from Google Calendar to local database
- ✅ **Push new events** created in the app to Google Calendar  
- ✅ **Update events** in Google Calendar when modified locally
- ✅ **Delete events** from Google Calendar when deleted locally

## Required Action: Update Google API Permissions

Since the scope has changed from `calendar.readonly` to `calendar` (full access), you need to regenerate your OAuth token:

### 1. Update Token Generation Script

The `backend/scripts/generateToken.py` has been updated to request full calendar permissions.

### 2. Regenerate OAuth Token

```bash
cd backend/scripts
python generateToken.py
```

This will:
- Open a browser for OAuth consent
- Request full calendar access (not just read-only)
- Generate a new `token.json` file

### 3. Replace Token File

Copy the new `token.json` to replace the existing one:

```bash
# From backend/scripts/ directory
cp token.json ../app/core/token.json
```

## How Bidirectional Sync Works

### Creating Events
1. User creates event in the web app
2. Event is saved to local database
3. Event is automatically pushed to Google Calendar
4. Google Calendar ID is stored in local database

### Updating Events
1. User updates event in the web app
2. Local database is updated
3. Changes are automatically pushed to Google Calendar

### Deleting Events
1. User deletes event in the web app
2. Event is removed from local database
3. Event is automatically deleted from Google Calendar

### Sync from Google
The existing `/google-sync/sync` endpoint continues to work:
- Pulls events from Google Calendar
- Updates or creates events in local database
- Removes locally stored events that were deleted in Google Calendar

## Error Handling

If Google Calendar operations fail:
- Local operations still succeed
- Errors are logged but don't block the user
- Manual sync can resolve any inconsistencies

## Benefits

- **Seamless Integration**: Events created in the app appear in Google Calendar
- **Universal Access**: Events can be viewed/edited in any Google Calendar client
- **Automatic Sync**: No manual sync required for new/updated events
- **Conflict Resolution**: Regular sync prevents data inconsistencies
