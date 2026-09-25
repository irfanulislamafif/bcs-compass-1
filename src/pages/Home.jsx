import { Link } from "react-router-dom";
import {
  Sparkles,
  Target,
  BookOpen,
  Brain,
  TrendingUp,
  AlertTriangle,
  CalendarClock,
  ArrowRight,
  CheckCircle2,
  FileText,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Question Generator",
    text: "Turn your own study material into BCS-style MCQs, written questions, and flashcards.",
  },
  {
    icon: Target,
    title: "Mock Exams",
    text: "Timed exams with a real exam-style interface, navigation, and review.",
  },
  {
    icon: AlertTriangle,
    title: "Mistake Book",
    text: "Every wrong answer is recorded automatically so you can revisit it.",
  },
  {
    icon: TrendingUp,
    title: "Weak Topic Detection",
    text: "See which topics are actually holding your accuracy back.",
  },
  {
    icon: CalendarClock,
    title: "Revision System",
    text: "Day 0, 1, 3, 7, 14, 30 spaced revision schedule.",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    text: "Subject, topic, and exam-level charts to track real improvement.",
  },
];

const steps = [
  {
    n: "01",
    title: "Study",
    text: "Read topics and material across the BCS syllabus.",
  },
  {
    n: "02",
    title: "Practice",
    text: "Answer MCQs in practice mode with explanations.",
  },
  {
    n: "03",
    title: "Take Exam",
    text: "Attempt timed exams under real pressure.",
  },
  {
    n: "04",
    title: "Analyze Mistakes",
    text: "Review wrong answers and identify patterns.",
  },
  {
    n: "05",
    title: "Improve Weak Areas",
    text: "Practice targeted weak topics and retest.",
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="border-b border-ink-100">
        <div className="container-page py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="badge bg-brand-50 text-brand-700">
              <Sparkles className="h-3.5 w-3.5" /> Built for serious BCS
              aspirants
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Prepare for BCS with a system that learns from your performance.
            </h1>
            <p className="mt-6 text-lg text-ink-500 max-w-2xl">
              Study → Practice → Analyze → Improve. BCS Compass tracks every
              answer, detects weak topics, and builds a revision plan around
              your real progress.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary">
                Start Preparing <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/subjects" className="btn-secondary">
                Explore Subjects
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
              {[
                { k: "10", v: "Core subjects" },
                { k: "6", v: "AI tools" },
                { k: "4", v: "Practice modes" },
                { k: "∞", v: "Custom exams" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="text-2xl font-bold text-ink-900">{s.k}</div>
                  <div className="text-xs text-ink-500 mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container-page py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need in one place
          </h2>
          <p className="mt-3 text-ink-500">
            BCS Compass is a preparation system, not just an information site.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="card p-6 hover:shadow-card-hover transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
                <f.icon className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-500">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-ink-100/50 border-y border-ink-100">
        <div className="container-page py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 text-ink-500">
              A clear, repeatable preparation cycle.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-5">
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <div className="text-3xl font-extrabold text-brand-500/30">
                  {s.n}
                </div>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-ink-500">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI STUDY LAB */}
      <section className="container-page py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="badge bg-brand-50 text-brand-700">
              <Brain className="h-3.5 w-3.5" /> AI Study Lab
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">
              Turn your study material into a complete practice set.
            </h2>
            <p className="mt-4 text-ink-500">
              Paste or upload your notes. BCS Compass will help you analyze
              them, extract exam-relevant points, and generate practice material
              around them.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                {
                  icon: BookOpen,
                  t: "Generate MCQs in multiple BCS question styles",
                },
                {
                  icon: FileText,
                  t: "Generate written and descriptive questions",
                },
                {
                  icon: Sparkles,
                  t: "Generate flashcards, facts, and revision notes",
                },
                {
                  icon: CheckCircle2,
                  t: "AI-assisted written-answer feedback",
                },
              ].map((i) => (
                <li key={i.t} className="flex items-start gap-3">
                  <i.icon className="h-5 w-5 text-brand-600 mt-0.5" />
                  <span className="text-sm text-ink-700">{i.t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-ink-500">
              AI features arrive in later stages. This foundation is being built
              incrementally.
            </p>
          </div>

          <div className="card p-6">
            <div className="text-sm font-medium text-ink-500 mb-2">
              Paste your study material here…
            </div>
            <div className="rounded-lg border border-dashed border-ink-300 bg-ink-100/40 p-6 text-sm text-ink-500">
              Example: “The Constitution of Bangladesh was adopted on 4 November
              1972 and came into effect on 16 December 1972…”
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Analyze Material",
                "Generate MCQs",
                "Flashcards",
                "Revision Notes",
              ].map((b) => (
                <span key={b} className="badge bg-ink-100 text-ink-700">
                  {b} · coming soon
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-24">
        <div className="rounded-2xl bg-ink-900 text-white p-10 md:p-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Start building your preparation system today.
          </h2>
          <p className="mt-4 text-ink-300 max-w-2xl">
            Free to begin. No credit card required. Built incrementally so you
            can see real functionality at every stage.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="btn bg-white text-ink-900 hover:bg-ink-100">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/subjects"
              className="btn border border-white/20 text-white hover:bg-white/10">
              Browse Subjects
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
