from sqlalchemy import create_engine, text

eng = create_engine('sqlite:///./billets.db')
conn = eng.connect()

# Check room_images table
res = conn.execute(text('PRAGMA table_info(room_images)'))
print('room_images columns:')
for c in res.fetchall():
    print(f'  {c[1]} ({c[2]})')

# Check data
res = conn.execute(text('SELECT * FROM room_images LIMIT 5'))
print('room_images data:')
for r in res.fetchall():
    print(r)

# Check rooms with their images
res = conn.execute(text('''
    SELECT r.id, r.name, ri.image_url, ri.is_primary
    FROM rooms r
    LEFT JOIN room_images ri ON r.id = ri.room_id
    LIMIT 5
'''))
print('Room images:')
for r in res.fetchall():
    print(r)