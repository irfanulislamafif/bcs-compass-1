import { Link } from 'react-router-dom';
import { ArrowRight, ListChecks } from 'lucide-react';
import ProgressBar from './ProgressBar.jsx';
import PriorityBadge from './PriorityBadge.jsx';

export default function TopicCard({ subjectId, topic }) {
  return (
    <div className="card p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">{topic.name}</h3>
        <PriorityBadge priority={topic.priority} />
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-ink-500 mb-1.5">
          <span>Progress</span>
          <span>{topic.progress}%</span>
        </div>
        <ProgressBar value={topic.progress} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-ink-500">
        <span className="inline-flex items-center gap-1">
          <ListChecks className="h-3.5 w-3.5" /> {topic.questions} questions
        </span>
        <span>{topic.accuracy}% accuracy</span>
      </div>

      <div className="mt-5 flex gap-2">
        <Link
          to={`/topics/${subjectId}/${topic.id}`}
          className="btn-secondary flex-1 text-sm"
        >
          View Topic
        </Link>
        <Link
          to={`/practice/topic/${subjectId}/${topic.id}`}
          className="btn-primary flex-1 text-sm"
        >
          Practice <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}