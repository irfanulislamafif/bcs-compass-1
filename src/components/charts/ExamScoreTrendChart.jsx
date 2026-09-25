import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ExamScoreTrendChart({ data }) {
  if (!data || data.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-ink-500">
        Complete at least two exams to see your trend.
      </div>
    );
  }

  // data: [{ completedAt, accuracy, title }]
  const chartData = data
    .slice()
    .reverse() // oldest → newest
    .map((e, i) => ({
      name: `#${i + 1}`,
      accuracy: e.accuracy,
      score: e.score,
    }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={35}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(v) => [`${v}%`, "Accuracy"]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#2347db"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#2347db" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
