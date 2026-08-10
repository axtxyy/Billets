from pathlib import Path

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from pdf_parser import extract_text_from_pdf
from ai_service import analyze_resume

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174",
        "https://ai-resume-coach-iota.vercel.app",
        "https://ai-resume-coach-*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload folder
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.get("/")
def root():
    return {"message": "AI Resume Coach API is running 🚀"}


@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    # Validate file type
    if file.content_type != "application/pdf":
        return {
            "success": False,
            "message": "Only PDF files are allowed."
        }

    # Read uploaded file
    contents = await file.read()

    # Validate file size (5 MB)
    if len(contents) > 5 * 1024 * 1024:
        return {
            "success": False,
            "message": "File size must be less than 5 MB."
        }

    # Save PDF
    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    # Extract text from PDF
    resume_text = extract_text_from_pdf(str(file_path))

    print("\n========== RESUME TEXT ==========\n")
    print(resume_text)
    print("\n=================================\n")

    # Send resume text to NVIDIA LLM
    ai_response = analyze_resume(resume_text)

    return {
        "success": True,
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents),
        "saved_to": str(file_path),
        "text_length": len(resume_text),
        "analysis": ai_response,
        "message": "Resume analyzed successfully!"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )