import { useState } from "react";
import {
  KeyRound,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { authApi } from "../lib/api.js";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

export default function Settings() {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError(t("auth.passwordTooShort"));
      return;
    }
    if (newPassword !== confirm) {
      setError(t("auth.passwordsMismatch"));
      return;
    }
    if (currentPassword === newPassword) {
      setError(t("common.error"));
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      setSuccess(data.message || t("common.save"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: t("nav.home"), to: "/" },
          { label: t("settings.title") },
        ]}
      />

      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("settings.title")}
            </h1>
            <p className="text-sm text-ink-500">{t("settings.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 max-w-2xl card p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-brand-600" />
          <h2 className="font-semibold">{t("settings.changePassword")}</h2>
        </div>

        {success && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-green-800 dark:text-green-300 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("settings.currentPassword")}
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("settings.newPassword")}
            </label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              placeholder={t("auth.passwordHint")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("settings.confirmNewPassword")}
            </label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />{" "}
                {t("settings.updating")}
              </>
            ) : (
              t("settings.updatePassword")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
