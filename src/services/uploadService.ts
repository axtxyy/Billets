export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export interface AnalysisResult {
  ats_score: number;
  summary: string;
  technical_skills: string[];
  soft_skills: string[];
  missing_keywords: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface UploadResponse {
  success: boolean;
  filename: string;
  content_type: string;
  message: string;
  size: number;
  saved_to: string;
  text_length: number;
  analysis: AnalysisResult;
}

export async function uploadResume(
  file: File
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Upload failed");
  }

  return response.json();
}