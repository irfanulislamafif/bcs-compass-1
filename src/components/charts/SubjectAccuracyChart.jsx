import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function SubjectAccuracyChart({ data }) {
  const filtered = data.filter((d) => d.total > 0);

  if (filtered.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-ink-500">
        No practice data yet. Answer some questions to see this chart.
      </div>
    );
  }

  function color(v) {
    if (v >= 70) return "#16a34a";
    if (v >= 55) return "#f59e0b";
    return "#dc2626";
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={filtered}
          margin={{ top: 10, right: 10, bottom: 30, left: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748b" }}
            angle={-25}
            textAnchor="end"
            interval={0}
            height={60}
          />
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
          <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
            {filtered.map((entry, i) => (
              <Cell key={i} fill={color(entry.accuracy)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
