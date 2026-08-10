import os
import json
import re
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("NVIDIA_API_KEY"),
    base_url="https://integrate.api.nvidia.com/v1",
)

DEFAULT_RESPONSE = {
    "ats_score": 0,
    "summary": "Analysis unavailable",
    "technical_skills": [],
    "soft_skills": [],
    "missing_keywords": [],
    "strengths": [],
    "weaknesses": [],
    "suggestions": [],
}

def _extract_json(text: str) -> dict:
    """Extract JSON from LLM response, handling markdown code blocks."""
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        text = match.group(1)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        try:
            return json.loads(text[start:end+1])
        except json.JSONDecodeError:
            pass
    return DEFAULT_RESPONSE

def analyze_resume(resume_text: str) -> dict:
    prompt = f"""
You are an expert ATS Resume Reviewer.

Analyze the resume below and return ONLY valid JSON in this exact format:

{{
  "ats_score": 0,
  "summary": "",
  "technical_skills": [],
  "soft_skills": [],
  "missing_keywords": [],
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}}

Resume:

{resume_text}
"""

    try:
        response = client.chat.completions.create(
            model="meta/llama-3.1-70b-instruct",
            messages=[
                {"role": "system", "content": "You are a professional ATS Resume Reviewer. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=800,
        )

        content = response.choices[0].message.content or ""
        return _extract_json(content)

    except Exception as e:
        return {**DEFAULT_RESPONSE, "summary": f"Error: {str(e)}"}