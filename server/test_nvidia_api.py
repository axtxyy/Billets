#!/usr/bin/env python3
"""
NVIDIA API Connection Test Script
Run: python test_nvidia_api.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

# Load env from server/.env
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

API_KEY = os.getenv("NVIDIA_API_KEY")

def test_api_key():
    """Test if NVIDIA API key is valid and working."""
    if not API_KEY:
        print("❌ NVIDIA_API_KEY not found in .env")
        return False
    
    if API_KEY == "your_nvidia_api_key_here" or API_KEY == "your_actual_nvidia_api_key_here":
        print("❌ Using placeholder key - replace with real key")
        return False
    
    print(f"[OK] API Key found: {API_KEY[:15]}...{API_KEY[-4:]}")
    
    client = OpenAI(
        api_key=API_KEY,
        base_url="https://integrate.api.nvidia.com/v1",
    )
    
    try:
        # Test 1: Simple completion
        print("\n[TEST] Testing basic completion...")
        response = client.chat.completions.create(
            model="meta/llama-3.1-70b-instruct",
            messages=[{"role": "user", "content": "Reply with just: OK"}],
            temperature=0.1,
            max_tokens=10,
        )
        result = response.choices[0].message.content.strip()
        print(f"[OK] Basic test: {result}")
        
        # Test 2: Resume analysis prompt
        print("\n[TEST] Testing resume analysis prompt...")
        test_resume = """
John Doe
Software Engineer
Python, JavaScript, React, AWS
5 years experience
"""
        prompt = f"""Analyze this resume and return JSON:
{{
  "ats_score": 85,
  "summary": "Test summary",
  "technical_skills": ["Python"],
  "soft_skills": ["Communication"],
  "missing_keywords": ["Docker"],
  "strengths": ["Experience"],
  "weaknesses": ["No cloud certs"],
  "suggestions": ["Add certifications"]
}}"""
        
        response = client.chat.completions.create(
            model="meta/llama-3.1-70b-instruct",
            messages=[
                {"role": "system", "content": "Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=500,
        )
        content = response.choices[0].message.content
        print(f"[OK] Analysis test received ({len(content)} chars)")
        print(f"   Preview: {content[:100]}...")
        
        # Verify JSON parsing
        import json
        import re
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", content, re.DOTALL)
        if match:
            content = match.group(1)
        parsed = json.loads(content)
        print(f"[OK] JSON parsing works - ATS Score: {parsed.get('ats_score')}")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] API Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("NVIDIA API Connection Test")
    print("=" * 50)
    
    success = test_api_key()
    
    print("\n" + "=" * 50)
    if success:
        print("[SUCCESS] ALL TESTS PASSED - API is ready!")
        sys.exit(0)
    else:
        print("[FAIL] TESTS FAILED - Check configuration")
        sys.exit(1)