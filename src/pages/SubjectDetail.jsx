import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getSubjectById } from "../data/demoData.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import AccuracyBadge from "../components/AccuracyBadge.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import TopicCard from "../components/TopicCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const { t } = useTranslation();
  const subject = getSubjectById(subjectId);

  if (!subject) {
    return <Navigate to="/subjects" replace />;
  }

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: t("nav.home"), to: "/" },
          { label: t("subjects.title"), to: "/subjects" },
          { label: subject.name },
        ]}
      />

      <Link
        to="/subjects"
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 mb-6">
        <ArrowLeft className="h-4 w-4" /> {t("subjectDetail.backToSubjects")}
      </Link>

      <div className="card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {subject.name}
              </h1>
            </div>
            <p className="mt-3 text-ink-500 max-w-2xl">{subject.description}</p>
          </div>
          <AccuracyBadge value={subject.accuracy} />
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div>
            <div className="text-xs text-ink-500">
              {t("subjectDetail.progress")}
            </div>
            <div className="mt-1 text-xl font-semibold">
              {subject.progress}%
            </div>
            <ProgressBar value={subject.progress} className="mt-2" />
          </div>
          <div>
            <div className="text-xs text-ink-500">
              {t("subjectDetail.questionsAttempted")}
            </div>
            <div className="mt-1 text-xl font-semibold">
              {subject.questionsAttempted}
            </div>
          </div>
          <div>
            <div className="text-xs text-ink-500">
              {t("subjectDetail.topics")}
            </div>
            <div className="mt-1 text-xl font-semibold">
              {subject.topics.length}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center gap-2 mb-5">
          <Layers className="h-5 w-5 text-ink-500" />
          <h2 className="text-lg font-semibold">{t("subjectDetail.topics")}</h2>
        </div>

        {subject.topics.length === 0 ? (
          <EmptyState
            icon={Layers}
            title={t("subjectDetail.noTopics")}
            description={t("subjectDetail.noTopicsSub")}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {subject.topics.map((tt) => (
              <TopicCard key={tt.id} subjectId={subject.id} topic={tt} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 card p-6">
        <h3 className="font-semibold">{t("subjectDetail.studyMaterial")}</h3>
        <p className="mt-2 text-sm text-ink-500">
          {t("subjectDetail.studyMaterialSub")}
        </p>
      </div>
    </div>
  );
}
