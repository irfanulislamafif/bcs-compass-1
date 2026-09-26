import { Link } from "react-router-dom";
import { Compass, Github, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-ink-200/70 dark:border-ink-800/70 bg-white/50 dark:bg-ink-950/50 mt-20">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <Compass className="h-6 w-6 text-brand-600" />
              <span className="font-bold text-lg">BCS Compass</span>
            </div>
            <p className="mt-3 text-sm text-ink-500 dark:text-ink-400 max-w-md">
              Study Smarter. Practice Better. Know What to Improve.
            </p>
            <p className="mt-4 text-xs text-ink-500 dark:text-ink-500 max-w-md">
              BCS Compass is an independent preparation platform. It is not
              affiliated with the Bangladesh Public Service Commission.
            </p>

            <div className="mt-5 flex items-center gap-2">
              <a
                href="mailto:hello@bcscompass.site"
                className="p-2 rounded-lg text-ink-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                aria-label="Email">
                <Mail className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg text-ink-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg text-ink-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-ink-600 dark:text-ink-400">
              <li>
                <Link
                  to="/features"
                  className="hover:text-brand-600 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="hover:text-brand-600 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/subjects"
                  className="hover:text-brand-600 transition-colors">
                  Subjects
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-ink-600 dark:text-ink-400">
              <li>
                <Link
                  to="/login"
                  className="hover:text-brand-600 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-brand-600 transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-ink-200/70 dark:border-ink-800/70 flex flex-col sm:flex-row justify-between gap-3 text-xs text-ink-500">
          <span>
            © {new Date().getFullYear()} BCS Compass. All rights reserved.
          </span>
          <span>Built with ❤️ for serious BCS aspirants.</span>
        </div>
      </div>
    </footer>
  );
}
