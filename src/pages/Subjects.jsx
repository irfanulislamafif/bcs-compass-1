import { Link } from 'react-router-dom';
import { demoSubjects } from '../data/demoData.jsx';
import { BookOpen, ArrowRight } from 'lucide-react';
import AccuracyBadge from '../components/AccuracyBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

export default function Subjects() {
  return (
    <div className="container-page py-12 md:py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Subjects</h1>
        <p className="mt-3 text-ink-500">
          Explore the BCS syllabus by subject. Practice questions, track accuracy,
          and jump into topic-level preparation.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {demoSubjects.map((s) => (
          <div key={s.id} className="card p-6 flex flex-col">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-brand-600" />
              </div>
              <AccuracyBadge value={s.accuracy} />
            </div>

            <h3 className="mt-4 font-semibold text-lg">{s.name}</h3>
            <p className="mt-2 text-sm text-ink-500 flex-1">{s.description}</p>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-ink-500 mb-1.5">
                <span>Progress</span>
                <span>{s.progress}%</span>
              </div>
              <ProgressBar value={s.progress} />
              <div className="mt-2 text-xs text-ink-500">
                {s.questionsAttempted} questions attempted · {s.topics.length} topics
              </div>
            </div>

            <Link to={`/subjects/${s.id}`} className="btn-secondary mt-5 w-full">
              View Subject <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold">Ready to start practicing?</h3>
          <p className="text-sm text-ink-500 mt-1">
            The MCQ practice engine arrives in Stage 3. Create an account to be ready.
          </p>
        </div>
        <Link to="/register" className="btn-primary">
          Start Preparing <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}