import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, ListChecks, FileText, Brain, CalendarClock,
  Sparkles, PenLine, Target,
} from 'lucide-react';
import { getTopicById } from '../data/demoData.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import AccuracyBadge from '../components/AccuracyBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

function ActionCard({ icon: Icon, title, description, comingSoon }) {
  return (
    <div className="card p-5 flex flex-col">
      <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
        <Icon className="h-5 w-5 text-brand-600" />
      </div>
      <h3 className="mt-4 font-semibold text-sm">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-500 flex-1">{description}</p>
      <button
        type="button"
        disabled
        className="btn-secondary mt-4 w-full cursor-not-allowed opacity-70"
      >
        {comingSoon}
      </button>
    </div>
  );
}

export default function TopicDetail() {
  const { subjectId, topicId } = useParams();
  const found = getTopicById(subjectId, topicId);

  if (!found) {
    return <Navigate to="/subjects" replace />;
  }

  const { subject, topic } = found;

  // Demo "previous question count" — later this will come from the backend.
  const previousQuestionCount = Math.round(topic.questions * 0.6);

  const actions = [
    {
      icon: BookOpen,
      title: 'Study',
      description: 'Read structured material for this topic.',
      comingSoon: 'Coming in Stage 3',
    },
    {
      icon: ListChecks,
      title: 'Practice MCQ',
      description: 'Answer MCQs in practice mode with instant feedback.',
      comingSoon: 'Coming in Stage 3',
    },
    {
      icon: Target,
      title: 'Take Test',
      description: 'Attempt a timed, exam-style test on this topic.',
      comingSoon: 'Coming in Stage 4',
    },
    {
      icon: PenLine,
      title: 'Written Practice',
      description: 'Generate and answer written questions for this topic.',
      comingSoon: 'Coming in Stage 12',
    },
    {
      icon: CalendarClock,
      title: 'Revision',
      description: 'Add this topic to your spaced revision schedule.',
      comingSoon: 'Coming in Stage 8',
    },
    {
      icon: Sparkles,
      title: 'AI Generate Questions',
      description: 'Generate new questions from your own study material.',
      comingSoon: 'Coming in Stage 10',
    },
  ];

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Subjects', to: '/subjects' },
          { label: subject.name, to: `/subjects/${subject.id}` },
          { label: topic.name },
        ]}
      />

      <Link
        to={`/subjects/${subject.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {subject.name}
      </Link>

      {/* Header */}
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
              {subject.name} · Topic
            </p>
          </div>
          <AccuracyBadge value={topic.accuracy} />
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-4">
          <div>
            <div className="text-xs text-ink-500">Progress</div>
            <div className="mt-1 text-xl font-semibold">{topic.progress}%</div>
            <ProgressBar value={topic.progress} className="mt-2" />
          </div>
          <div>
            <div className="text-xs text-ink-500">Accuracy</div>
            <div className="mt-1 text-xl font-semibold">{topic.accuracy}%</div>
          </div>
          <div>
            <div className="text-xs text-ink-500">Questions</div>
            <div className="mt-1 text-xl font-semibold">{topic.questions}</div>
          </div>
          <div>
            <div className="text-xs text-ink-500">Previous Questions</div>
            <div className="mt-1 text-xl font-semibold">{previousQuestionCount}</div>
          </div>
        </div>
      </div>

      {/* Importance / info */}
      <div className="mt-8 card p-6">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-ink-500 mt-0.5 shrink-0" />
          <div>
            <h2 className="font-semibold">Importance</h2>
            <p className="mt-1.5 text-sm text-ink-500">
              This topic is marked as{' '}
              <span className="font-medium text-ink-900">
                {topic.priority === 'high'
                  ? 'High Priority'
                  : topic.priority === 'medium'
                  ? 'Study'
                  : 'Low Priority'}
              </span>{' '}
              based on its coverage in the BCS syllabus. This is a guideline only —
              the platform does not recommend skipping any topic.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-5">What you can do</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((a) => (
            <ActionCard key={a.title} {...a} />
          ))}
        </div>
      </div>
    </div>
  );
}