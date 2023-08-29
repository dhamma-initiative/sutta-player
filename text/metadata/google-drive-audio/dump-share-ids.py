from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow

# Define the scopes you need
SCOPES = ['https://www.googleapis.com/auth/drive']

# Set up the flow to obtain credentials
flow = InstalledAppFlow.from_client_secrets_file(
    '<replace_secret_file>', SCOPES)

# Authenticate and obtain credentials
creds = flow.run_local_server(port=0)

drive_service = build('drive', 'v3', credentials=creds)

# Function to recursively list files and get their sharing links
def list_files(parent_name, folder_id, mime_type):
    query = f"parents ='{folder_id}'"
    results = drive_service.files().list(q=query).execute()
    items = results.get('files')

    nextPageToken = results.get('nextPageToken')
    while nextPageToken:
        nextPageResults = drive_service.files().list(q=query, pageToken=nextPageToken).execute()
        items.extend(nextPageResults.get('files'))
        nextPageToken = nextPageResults.get('nextPageToken')
    
    for item in items:
        item_name = item['name']
        if item['mimeType'] == mime_type:  # Adjust MIME type based on your files
            file_id = item['id']
            file_path = parent_name + item_name 
            flattened_path = file_path.replace("./audio/suttas/", "")
            extles_path = flattened_path.replace(".wav.mp3", "")
            print(f'\t"{extles_path}": "{file_id}",')

        if 'folder' in item['mimeType']:
            list_files(parent_name + item_name + '/', item['id'], mime_type)  # Recurse into subfolders


def main():
    print("{")
    # Call the function with your root folder's ID
    list_files('./audio/', '<replace_folder_id>', 'audio/mpeg') 
    print("}")

main()