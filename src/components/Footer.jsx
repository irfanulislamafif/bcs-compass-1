import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-ink-100/40 mt-16">
      <div className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <Compass className="h-6 w-6 text-brand-600" />
              <span className="font-bold">BCS Compass</span>
            </div>
            <p className="mt-3 text-sm text-ink-500 max-w-md">
              Study Smarter. Practice Better. Know What to Improve.
            </p>
            <p className="mt-4 text-xs text-ink-500">
              BCS Compass is an independent preparation platform. It is not
              affiliated with the Bangladesh Public Service Commission.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-ink-700">
              <li>
                <Link to="/features" className="hover:text-brand-600">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-brand-600">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/subjects" className="hover:text-brand-600">
                  Subjects
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-ink-700">
              <li>
                <Link to="/login" className="hover:text-brand-600">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-600">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-ink-200 flex flex-col sm:flex-row justify-between gap-3 text-xs text-ink-500">
          <span>© {new Date().getFullYear()} BCS Compass.</span>
          <span>Built for serious BCS aspirants.</span>
        </div>
      </div>
    </footer>
  );
}
