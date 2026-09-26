import { Link } from 'react-router-dom';
import {
  Sparkles, Target, BookOpen, Brain, TrendingUp, AlertTriangle,
  CalendarClock, ArrowRight, CheckCircle2, FileText, BarChart3,
  Zap, Shield, Clock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const features = [
  {
    icon: Sparkles,
    title: 'AI Question Generator',
    text: 'Turn your notes into BCS-style MCQs, flashcards, and revision notes in seconds.',
    accent: 'from-violet-500 to-indigo-500',
  },
  {
    icon: Target,
    title: 'Real Mock Exams',
    text: 'Timed, exam-style interface with question navigation, review flags, and instant scoring.',
    accent: 'from-brand-500 to-blue-500',
  },
  {
    icon: AlertTriangle,
    title: 'Automatic Mistake Book',
    text: 'Every wrong answer is recorded so you can revisit, re-attempt, and finally master it.',
    accent: 'from-rose-500 to-pink-500',
  },
  {
    icon: TrendingUp,
    title: 'Weak Topic Detection',
    text: 'See which topics are silently dragging your accuracy down — with real numbers.',
    accent: 'from-amber-500 to-orange-500',
  },
  {
    icon: CalendarClock,
    title: 'Spaced Revision',
    text: 'Day 0, 1, 3, 7, 14, 30. A proven schedule that makes you remember what you learn.',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    text: 'Subject, topic, and exam-level charts that show your real improvement over time.',
    accent: 'from-cyan-500 to-blue-500',
  },
];

const steps = [
  { n: '01', title: 'Study', text: 'Read topics and materials across the full BCS syllabus.' },
  { n: '02', title: 'Practice', text: 'Answer MCQs with instant feedback and clear explanations.' },
  { n: '03', title: 'Take Exam', text: 'Test yourself under real time pressure.' },
  { n: '04', title: 'Analyze', text: 'See exactly which topics are holding you back.' },
  { n: '05', title: 'Improve', text: 'Target weak areas and retest. Measure the change.' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-ink-200/70 dark:border-ink-800/70">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] opacity-60 pointer-events-none" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-brand-200/40 via-violet-200/30 to-transparent dark:from-brand-900/30 dark:via-violet-900/20 blur-3xl rounded-full pointer-events-none" />

        <div className="container-page relative py-20 md:py-28">
          <div className="max-w-3xl animate-slide-up">
            <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 ring-1 ring-brand-200 dark:ring-brand-800">
              <Sparkles className="h-3.5 w-3.5" />
              Built for serious BCS aspirants
            </span>

            <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Prepare for BCS with a system that{' '}
              <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
                learns from your performance.
              </span>
            </h1>

            <p className="mt-6 text-lg text-ink-600 dark:text-ink-400 max-w-2xl leading-relaxed">
              Study → Practice → Analyze → Improve. BCS Compass tracks every answer,
              detects weak topics, and builds a revision plan around your real
              progress.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn-primary text-base px-5 py-3">
                {isAuthenticated ? 'Go to Dashboard' : 'Start Preparing'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/subjects" className="btn-secondary text-base px-5 py-3">
                Explore Subjects
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
              {[
                { k: '10', v: 'Core subjects' },
                { k: '7', v: 'AI study tools' },
                { k: '4', v: 'Practice modes' },
                { k: '∞', v: 'Custom exams' },
              ].map((s) => (
                <div key={s.v}>
                  <div className="text-3xl font-bold text-ink-900 dark:text-white">
                    {s.k}
                  </div>
                  <div className="text-xs text-ink-500 dark:text-ink-400 mt-1">
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container-page py-20">
        <div className="max-w-2xl">
          <h2 className="h2">Everything you need in one place</h2>
          <p className="mt-3 muted text-lg">
            BCS Compass is a preparation system, not just an information site.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="card p-6 card-hover group"
            >
              <div
                className={`h-11 w-11 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
              >
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 font-semibold text-base">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-400 leading-relaxed">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-ink-100/60 dark:bg-ink-900/40 border-y border-ink-200/70 dark:border-ink-800/70">
        <div className="container-page py-20">
          <div className="max-w-2xl">
            <h2 className="h2">How it works</h2>
            <p className="mt-3 muted text-lg">
              A clear, repeatable preparation cycle.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-5">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="text-3xl font-extrabold bg-gradient-to-br from-brand-400 to-violet-400 bg-clip-text text-transparent">
                  {s.n}
                </div>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">
                  {s.text}
                </p>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-4 -right-3 h-4 w-4 text-ink-300 dark:text-ink-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI STUDY LAB */}
      <section className="container-page py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
              <Brain className="h-3.5 w-3.5" /> AI Study Lab
            </span>
            <h2 className="mt-4 h2">
              Turn your study material into a complete practice set.
            </h2>
            <p className="mt-4 text-ink-500 dark:text-ink-400 text-lg leading-relaxed">
              Paste or upload your notes. BCS Compass extracts exam-relevant
              facts, generates questions, and answers questions about your own
              material.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                { icon: Zap, t: 'MCQs in multiple BCS question styles' },
                { icon: FileText, t: 'Written questions with expected points' },
                { icon: Sparkles, t: 'Flashcards, facts, and revision notes' },
                { icon: Shield, t: 'AI-evaluated written answers' },
              ].map((i) => (
                <li key={i.t} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0">
                    <i.icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <span className="text-sm text-ink-700 dark:text-ink-300 pt-1.5">
                    {i.t}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to={isAuthenticated ? '/ai-lab' : '/register'}
              className="btn-primary mt-8"
            >
              {isAuthenticated ? 'Open AI Study Lab' : 'Try it Free'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="card p-6 shadow-lg">
            <div className="text-sm font-medium text-ink-500 mb-3">
              Paste your study material here…
            </div>
            <div className="rounded-xl border border-dashed border-ink-300 dark:border-ink-700 bg-ink-50/60 dark:bg-ink-900/60 p-5 text-sm text-ink-500 dark:text-ink-400 leading-relaxed">
              <span className="text-ink-700 dark:text-ink-300">
                The Constitution of Bangladesh was adopted on 4 November 1972
                and came into effect on 16 December 1972...
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Analyze', 'Generate MCQs', 'Flashcards', 'Notes'].map((b) => (
                <span
                  key={b}
                  className="badge bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 ring-1 ring-brand-200 dark:ring-brand-800"
                >
                  {b}
                </span>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-ink-200/70 dark:border-ink-800/70 flex items-center gap-2 text-xs text-ink-500">
              <Clock className="h-3.5 w-3.5" />
              Output in under 5 seconds
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 dark:bg-ink-800 p-10 md:p-16 text-white">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-500/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-violet-500/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Start building your preparation system today.
            </h2>
            <p className="mt-4 text-ink-300 text-lg">
              Free to begin. No credit card required. Built to be honest about
              what you actually need to improve.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="btn bg-white text-ink-900 hover:bg-ink-100 text-base px-5 py-3"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/subjects"
                className="btn border border-white/20 text-white hover:bg-white/10 text-base px-5 py-3"
              >
                Browse Subjects
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm">
              {['No credit card', 'Free forever tier', 'Open data export'].map((t) => (
                <span key={t} className="inline-flex items-center gap-2 text-ink-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}