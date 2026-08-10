import { GitBranch, MessageSquare, User, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-gray-950 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">AI Resume Coach</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Build resumes that pass ATS and land interviews using AI‑powered feedback.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <MessageSquare className="h-5 w-5" aria-hidden="true" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <User className="h-5 w-5" aria-hidden="true" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <GitBranch className="h-5 w-5" aria-hidden="true" />
              </a>
              <a href="mailto:hello@airc.com" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <nav className="space-y-3" aria-label="Product">
            <h3 className="font-semibold">Product</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#features" className="hover:text-gray-900 dark:hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-gray-900 dark:hover:text-white">Pricing</a></li>
              <li><a href="#integrations" className="hover:text-gray-900 dark:hover:text-white">Integrations</a></li>
              <li><a href="#changelog" className="hover:text-gray-900 dark:hover:text-white">Changelog</a></li>
            </ul>
          </nav>

          <nav className="space-y-3" aria-label="Company">
            <h3 className="font-semibold">Company</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#about" className="hover:text-gray-900 dark:hover:text-white">About</a></li>
              <li><a href="#blog" className="hover:text-gray-900 dark:hover:text-white">Blog</a></li>
              <li><a href="#careers" className="hover:text-gray-900 dark:hover:text-white">Careers</a></li>
              <li><a href="#contact" className="hover:text-gray-900 dark:hover:text-white">Contact</a></li>
            </ul>
          </nav>

          <nav className="space-y-3" aria-label="Legal">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#privacy" className="hover:text-gray-900 dark:hover:text-white">Privacy</a></li>
              <li><a href="#terms" className="hover:text-gray-900 dark:hover:text-white">Terms</a></li>
              <li><a href="#security" className="hover:text-gray-900 dark:hover:text-white">Security</a></li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} AI Resume Coach. All rights reserved.
        </div>
      </div>
    </footer>
  );
}