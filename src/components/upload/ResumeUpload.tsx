import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume } from "../../services/uploadService";
import useFileUpload from "../../hooks/useFileUpload";
import Button from "../ui/Button";
import { FileText, Upload, CheckCircle, AlertCircle } from "lucide-react";

type UploadResponse = {
  success: boolean;
  filename: string;
  content_type: string;
  message: string;
  size: number;
  saved_to: string;
  text_length: number;
  analysis: {
    ats_score: number;
    summary: string;
    technical_skills: string[];
    soft_skills: string[];
    missing_keywords: string[];
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
};

export default function ResumeUpload() {
  const navigate = useNavigate();
  const {
    selectedFile,
    error,
    isDragging,
    inputRef,
    handleChooseFile,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useFileUpload();

  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleUpload() {
    if (!selectedFile) {
      alert("Please select a PDF first.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      const response = await uploadResume(selectedFile);
      setUploadResult(response);

      const analysisId = Date.now().toString();
      sessionStorage.setItem(`resume-analysis-${analysisId}`, JSON.stringify(response));
      navigate(`/results/${analysisId}`);
    } catch (err) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl border transition-all duration-300 ${
        isDragging
          ? "border-primary-400 bg-primary-50 dark:border-primary-900/30 dark:bg-primary-900/10"
          : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
      }`}
      aria-label="Resume upload area"
    >
      <div className="mx-auto max-w-3xl p-8 sm:p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 mb-6">
          <FileText className="h-8 w-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Upload Your Resume
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Drag & drop a PDF or click to browse. We'll analyse it instantly and give you actionable feedback.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          id="resume-upload"
        />

        <label
          htmlFor="resume-upload"
          className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 transition-colors ${
            isDragging
              ? "border-primary-400 bg-primary-50 dark:border-primary-900/30 dark:bg-primary-900/10"
              : "border-gray-300 hover:border-primary-400 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-primary-600 dark:hover:bg-gray-800/50"
          }`}
        >
          <div className="space-y-4">
            <Upload className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">Drag & drop your resume here</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">or click to select a PDF file</p>
            </div>
            <Button type="button" variant="outline" onClick={handleChooseFile} className="w-full sm:w-auto">
              Choose File
            </Button>
          </div>
        </label>

        {selectedFile && (
          <div className="mt-6 text-left">
            <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                loading={isUploading}
                size="sm"
                className="flex-shrink-0"
              >
                {isUploading ? "Analyzing…" : "Analyze Resume"}
              </Button>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-300" role="alert">
                <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {uploadError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-300" role="alert">
                <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <p className="text-sm">{uploadError}</p>
              </div>
            )}

            {uploadResult && !isUploading && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20" role="status">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">Upload Successful</h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      {uploadResult.message}
                    </p>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <div><strong>Filename:</strong></div>
                  <dd>{uploadResult.filename}</dd>
                  <div><strong>Type:</strong></div>
                  <dd>{uploadResult.content_type}</dd>
                  <div><strong>ATS Score:</strong></div>
                  <dd className="font-bold text-primary-600 dark:text-primary-400">{Math.round(uploadResult.analysis.ats_score)}%</dd>
                </dl>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}