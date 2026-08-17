from sqlalchemy import create_engine, text

eng = create_engine('sqlite:///./billets.db')
conn = eng.connect()

# Check what the featured rooms query returns
res = conn.execute(text('''
    SELECT r.id, r.name, ri.image_url, ri.is_primary
    FROM rooms r
    LEFT JOIN room_images ri ON r.id = ri.room_id
    WHERE r.is_featured = 1
    LIMIT 2
'''))
print('Featured rooms with images:')
for r in res.fetchall():
    print(r)