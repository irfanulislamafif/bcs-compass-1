const steps = [
  { n: 1, title: 'Study', text: 'Explore subjects and topics, read the material, and mark what you have covered.' },
  { n: 2, title: 'Practice', text: 'Answer MCQs in practice mode. See correct answers and explanations immediately.' },
  { n: 3, title: 'Take Exam', text: 'Attempt timed exams in a realistic interface with navigation and review flags.' },
  { n: 4, title: 'Analyze Mistakes', text: 'After submission, review wrong answers and see subject and topic performance.' },
  { n: 5, title: 'Improve Weak Areas', text: 'Practice detected weak topics again, revise, and retest to confirm improvement.' },
];

export default function HowItWorks() {
  return (
    <div className="container-page py-12 md:py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">How it works</h1>
        <p className="mt-3 text-ink-500">
          A repeatable cycle that turns practice into measurable improvement.
        </p>
      </div>

      <ol className="mt-12 space-y-6 max-w-3xl">
        {steps.map((s) => (
          <li key={s.n} className="flex gap-5">
            <div className="shrink-0 h-10 w-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold">
              {s.n}
            </div>
            <div className="pt-1">
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-500">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}