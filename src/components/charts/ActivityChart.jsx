import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ActivityChart({ data }) {
  const hasData = data.some((d) => d.attempts > 0);

  if (!hasData) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-ink-500">
        No activity yet. Your daily practice will appear here.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={30} />
          <Tooltip
            formatter={(v) => [v, "Questions"]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Bar dataKey="attempts" fill="#5a82ff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
