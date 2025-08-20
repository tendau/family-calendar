from google_auth_oauthlib.flow import InstalledAppFlow
import json

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

flow = InstalledAppFlow.from_client_secrets_file(
    '../app/core/credentials.json', SCOPES)
creds = flow.run_local_server(port=0)

# Save the credentials for server use
with open('token.json', 'w') as token_file:
    token_file.write(creds.to_json())
