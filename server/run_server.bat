@echo off
cd /d C:\Users\asus\billets\server
python -c "import uvicorn; from main import app; uvicorn.run(app, host='127.0.0.1', port=8000, log_level='debug', reload=False)"
pause