import { Link } from "react-router-dom";
import { Compass, Code, Send, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

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
              {t("footer.tagline")}
            </p>
            <p className="mt-4 text-xs text-ink-500 max-w-md">
              {t("footer.disclaimer")}
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
                aria-label="Source code">
                <Code className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg text-ink-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                aria-label="Contact">
                <Send className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">
              {t("footer.product")}
            </h4>
            <ul className="space-y-2 text-sm text-ink-600 dark:text-ink-400">
              <li>
                <Link
                  to="/features"
                  className="hover:text-brand-600 transition-colors">
                  {t("footer.features")}
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="hover:text-brand-600 transition-colors">
                  {t("footer.howItWorks")}
                </Link>
              </li>
              <li>
                <Link
                  to="/subjects"
                  className="hover:text-brand-600 transition-colors">
                  {t("footer.subjects")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">
              {t("footer.account")}
            </h4>
            <ul className="space-y-2 text-sm text-ink-600 dark:text-ink-400">
              <li>
                <Link
                  to="/login"
                  className="hover:text-brand-600 transition-colors">
                  {t("footer.login")}
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-brand-600 transition-colors">
                  {t("footer.register")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-ink-200/70 dark:border-ink-800/70 flex flex-col sm:flex-row justify-between gap-3 text-xs text-ink-500">
          <span>
            © {new Date().getFullYear()} BCS Compass. {t("footer.rights")}
          </span>
          <span>{t("footer.builtWith")}</span>
        </div>
      </div>
    </footer>
  );
}
