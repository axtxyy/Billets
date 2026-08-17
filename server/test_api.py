from main import app
from fastapi.testclient import TestClient
client = TestClient(app)
r = client.get('/rooms/featured?limit=2')
print('Status:', r.status_code)
if r.status_code == 200:
    data = r.json()
    items = data.get('data', {}).get('items', [])[:2] if data.get('data') else None
    if items:
        for item in items:
            print('Room:', item.get('id'), item.get('name'))
            print('primary_image:', item.get('primary_image'))
            print('---')