import { useRef } from "react";
import Button from "../components/ui/Button";
import ResumeUpload from "../components/upload/ResumeUpload";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";

export default function HomePage() {
  const uploadSection = useRef<HTMLDivElement>(null);

  const scrollToUpload = () => {
    uploadSection.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFeatures = () => {
    const el = document.getElementById("features");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Subtle decorative blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-200/30 blur-3xl dark:bg-primary-900/20" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl dark:bg-purple-900/20" />
      </div>

      {/* Hero */}
      <header className="mx-auto max-w-7xl px-6 pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-32">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 mb-6">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>New AI‑Powered Resume Analysis</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
            Build a Resume That <span className="text-primary-600 dark:text-primary-400">Gets More Interviews</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload your résumé and receive instant AI‑powered feedback, ATS scoring, keyword suggestions, and personalized improvements — all in seconds.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" className="group w-full sm:w-auto" onClick={scrollToUpload}>
              Upload Resume
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={scrollToFeatures}>
              Learn More
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            {["ATS Optimized", "AI Powered", "Instant Results", "Secure & Private"].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Resume Upload Section */}
      <div ref={uploadSection} id="resume-upload" className="mx-auto max-w-7xl px-6 pb-20">
        <ResumeUpload />
      </div>
    </section>
  );
}