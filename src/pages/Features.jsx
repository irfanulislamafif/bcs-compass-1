import {
  Sparkles,
  Target,
  AlertTriangle,
  TrendingUp,
  CalendarClock,
  BarChart3,
  Brain,
  FileText,
} from "lucide-react";

const items = [
  {
    icon: Sparkles,
    title: "AI Question Generator",
    text: "Generate BCS-style MCQs from your own study material.",
  },
  {
    icon: Target,
    title: "Mock Exams",
    text: "Timed, exam-style interface with navigation and review.",
  },
  {
    icon: AlertTriangle,
    title: "Automatic Mistake Book",
    text: "Wrong answers recorded automatically for later review.",
  },
  {
    icon: TrendingUp,
    title: "Weak Topic Detection",
    text: "Find topics with accuracy below your own average.",
  },
  {
    icon: CalendarClock,
    title: "Spaced Revision",
    text: "Day 0, 1, 3, 7, 14, 30 revision schedule.",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    text: "Charts for accuracy, study time, and exam scores.",
  },
  {
    icon: Brain,
    title: "AI Written Evaluation",
    text: "AI-assisted feedback on written answers.",
  },
  {
    icon: FileText,
    title: "PDF Analysis (later)",
    text: "Ask questions about your uploaded PDF material.",
  },
];

export default function Features() {
  return (
    <div className="container-page py-12 md:py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Features
        </h1>
        <p className="mt-3 text-ink-500">
          BCS Compass is designed as a full preparation and examination system.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <div key={i.title} className="card p-5">
            <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <i.icon className="h-5 w-5 text-brand-600" />
            </div>
            <h3 className="mt-4 font-semibold text-sm">{i.title}</h3>
            <p className="mt-1.5 text-sm text-ink-500">{i.text}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-xs text-ink-500">
        Features are being implemented in stages. Some features are marked as
        arriving later.
      </p>
    </div>
  );
}
