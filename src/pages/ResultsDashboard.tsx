import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Target, FileText, Star, AlertTriangle, Lightbulb, Brain, Heart, Zap } from "lucide-react";
import Button from "../components/ui/Button";
import type { LucideIcon } from "lucide-react";

interface AnalysisResult {
  ats_score: number;
  summary: string;
  technical_skills: string[];
  soft_skills: string[];
  missing_keywords: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface UploadResponse {
  success: boolean;
  filename: string;
  content_type: string;
  message: string;
  size: number;
  saved_to: string;
  text_length: number;
  analysis: AnalysisResult;
}

const sectionConfig = [
  { key: "technical_skills" as keyof AnalysisResult, title: "Technical Skills", icon: Brain, color: "blue", description: "Hard skills and technologies identified" },
  { key: "soft_skills" as keyof AnalysisResult, title: "Soft Skills", icon: Heart, color: "pink", description: "Interpersonal and behavioral skills" },
  { key: "strengths" as keyof AnalysisResult, title: "Strengths", icon: Star, color: "green", description: "Strong points of your resume" },
  { key: "weaknesses" as keyof AnalysisResult, title: "Weaknesses", icon: AlertTriangle, color: "orange", description: "Areas that need improvement" },
  { key: "missing_keywords" as keyof AnalysisResult, title: "Missing Keywords", icon: Zap, color: "purple", description: "Important keywords to add for ATS" },
  { key: "suggestions" as keyof AnalysisResult, title: "Suggestions", icon: Lightbulb, color: "indigo", description: "Actionable recommendations" },
];

function SectionCard({ title, icon: Icon, color, description, items }: { title: string; icon: LucideIcon; color: string; description: string; items: string[] }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    pink: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800",
    green: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    orange: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
    purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
  };

  const cls = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  if (!items || items.length === 0) {
    return (
      <div className={`rounded-xl border ${cls} p-5`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${cls} flex items-center justify-center`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm opacity-80 mt-0.5">{description}</p>
            <p className="text-sm italic mt-2 opacity-60">No items found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${cls} p-5`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${cls} flex items-center justify-center`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm opacity-80">{description}</p>
        </div>
      </div>
      <ul className="space-y-2" role="list">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2 bg-current opacity-50" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResultsDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [data] = useState<UploadResponse | null>(() => {
    const stored = sessionStorage.getItem(`resume-analysis-${id}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });
  
  const [error] = useState<string | null>(() => {
    const stored = sessionStorage.getItem(`resume-analysis-${id}`);
    return stored ? null : "No analysis data found. Please upload a resume first.";
  });

  if (error || !data) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center py-16">
          <AlertTriangle className="mx-auto h-14 w-14 text-yellow-500 mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Analysis</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
          <Button onClick={() => navigate("/")}>Upload Another Resume</Button>
        </div>
      </section>
    );
  }

  const { analysis, filename } = data;
  const score = Math.round(analysis.ats_score);
  const scoreColor = score >= 80 ? "green" : score >= 60 ? "yellow" : "red";

  return (
    <section className="mx-auto max-w-5xl px-6 py-8 pb-16">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resume Analysis</h1>
          <p className="text-gray-600 dark:text-gray-400">{filename}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Professional Summary</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">AI-generated overview of your resume</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className={`text-4xl font-bold text-${scoreColor}-600 dark:text-${scoreColor}-400`}>{score}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">ATS Score</div>
              </div>
            </div>
            <div className="mt-6 h-3 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-800" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label="ATS Score">
              <div className={`h-full bg-${scoreColor}-500 transition-all duration-1000`} style={{ width: `${score}%` }} />
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p className="whitespace-pre-wrap">{analysis.summary}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {sectionConfig.map(({ key, title, icon: Icon, color, description }) => (
              <SectionCard
                key={key}
                title={title}
                icon={Icon}
                color={color}
                description={description}
                items={analysis[key] as string[]}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" aria-hidden="true" />
              Resume Details
            </h3>
            <dl className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between"><dt>Filename</dt><dd className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{filename}</dd></div>
              <div className="flex justify-between"><dt>File Size</dt><dd>{(data.size / 1024).toFixed(1)} KB</dd></div>
              <div className="flex justify-between"><dt>Text Length</dt><dd>{data.text_length.toLocaleString()} characters</dd></div>
              <div className="flex justify-between"><dt>ATS Score</dt><dd className={`font-bold text-${scoreColor}-600 dark:text-${scoreColor}-400`}>{score}%</dd></div>
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary-600" aria-hidden="true" />
              Next Steps
            </h3>
            <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center text-xs font-bold">1</span>Add missing keywords to improve ATS matching</li>
              <li className="flex items-start gap-2"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center text-xs font-bold">2</span>Address weaknesses in your resume structure</li>
              <li className="flex items-start gap-2"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center text-xs font-bold">3</span>Highlight strengths more prominently</li>
              <li className="flex items-start gap-2"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center text-xs font-bold">4</span>Implement suggested improvements</li>
              <li className="flex items-start gap-2"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 flex items-center justify-center text-xs font-bold">5</span>Re-upload to verify score improvement</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}