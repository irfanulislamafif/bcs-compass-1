import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ListChecks,
  FileText,
  CalendarClock,
  Sparkles,
  PenLine,
  Target,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getTopicById } from "../data/demoData.jsx";
import { getQuestionsByTopic } from "../data/demoQuestions.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import AccuracyBadge from "../components/AccuracyBadge.jsx";
import PriorityBadge from "../components/PriorityBadge.jsx";
import ProgressBar from "../components/ProgressBar.jsx";

function ActionCard({ icon: Icon, title, description, to, comingSoon }) {
  return (
    <div className="card p-5 flex flex-col">
      <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
        <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
      </div>
      <h3 className="mt-4 font-semibold text-sm">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-500 flex-1">{description}</p>
      {to ? (
        <Link to={to} className="btn-primary mt-4 w-full">
          {title} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="btn-secondary mt-4 w-full cursor-not-allowed opacity-70">
          {comingSoon}
        </button>
      )}
    </div>
  );
}

export default function TopicDetail() {
  const { subjectId, topicId } = useParams();
  const { t } = useTranslation();
  const found = getTopicById(subjectId, topicId);

  if (!found) {
    return <Navigate to="/subjects" replace />;
  }

  const { subject, topic } = found;
  const availableQuestions = getQuestionsByTopic(subject.id, topic.id).length;
  const previousQuestionCount = Math.round(topic.questions * 0.6);

  const priorityLabel =
    topic.priority === "high"
      ? t("topicDetail.highPriority")
      : topic.priority === "medium"
        ? t("topicDetail.study")
        : t("topicDetail.lowPriority");

  const actions = [
    {
      icon: ListChecks,
      title: t("topicDetail.practiceMcq"),
      description: t("topicDetail.practiceDesc", { count: availableQuestions }),
      to: `/practice/topic/${subject.id}/${topic.id}`,
    },
    {
      icon: PenLine,
      title: t("topicDetail.writtenPractice"),
      description: t("topicDetail.writtenDesc"),
      to: "/written-practice",
    },
    {
      icon: Target,
      title: t("topicDetail.takeTest"),
      description: t("topicDetail.testDesc"),
      to: `/exam?subjectId=${subject.id}&topicId=${topic.id}`,
    },
    {
      icon: BookOpen,
      title: t("topicDetail.studyTitle"),
      description: t("topicDetail.studyDesc"),
      comingSoon: t("common.comingSoon"),
    },
    {
      icon: CalendarClock,
      title: t("topicDetail.revisionTitle"),
      description: t("topicDetail.revisionDesc"),
      comingSoon: t("common.comingSoon"),
    },
    {
      icon: Sparkles,
      title: t("topicDetail.aiGenerate"),
      description: t("topicDetail.aiGenerateDesc"),
      to: "/ai-lab",
    },
  ];

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: t("nav.home"), to: "/" },
          { label: t("subjects.title"), to: "/subjects" },
          { label: subject.name, to: `/subjects/${subject.id}` },
          { label: topic.name },
        ]}
      />

      <Link
        to={`/subjects/${subject.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 mb-6">
        <ArrowLeft className="h-4 w-4" />{" "}
        {t("topicDetail.backTo", { subject: subject.name })}
      </Link>

      <div className="card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {topic.name}
              </h1>
              <PriorityBadge priority={topic.priority} />
            </div>
            <p className="mt-3 text-sm text-ink-500">
              {t("topicDetail.topicLabel", { subject: subject.name })}
            </p>
          </div>
          <AccuracyBadge value={topic.accuracy} />
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-4">
          <div>
            <div className="text-xs text-ink-500">
              {t("topicDetail.progress")}
            </div>
            <div className="mt-1 text-xl font-semibold">{topic.progress}%</div>
            <ProgressBar value={topic.progress} className="mt-2" />
          </div>
          <div>
            <div className="text-xs text-ink-500">
              {t("topicDetail.accuracy")}
            </div>
            <div className="mt-1 text-xl font-semibold">{topic.accuracy}%</div>
          </div>
          <div>
            <div className="text-xs text-ink-500">
              {t("topicDetail.availableQuestions")}
            </div>
            <div className="mt-1 text-xl font-semibold">
              {availableQuestions}
            </div>
          </div>
          <div>
            <div className="text-xs text-ink-500">
              {t("topicDetail.previousQuestions")}
            </div>
            <div className="mt-1 text-xl font-semibold">
              {previousQuestionCount}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 card p-6">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-ink-500 mt-0.5 shrink-0" />
          <div>
            <h2 className="font-semibold">{t("topicDetail.importance")}</h2>
            <p className="mt-1.5 text-sm text-ink-500">
              {t("topicDetail.importanceText", { priority: priorityLabel })}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-5">
          {t("topicDetail.whatYouCanDo")}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((a) => (
            <ActionCard key={a.title} {...a} />
          ))}
        </div>
      </div>
    </div>
  );
}
