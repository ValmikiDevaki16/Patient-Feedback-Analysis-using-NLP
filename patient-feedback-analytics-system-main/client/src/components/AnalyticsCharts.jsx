import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsCharts({ stats }) {
  console.log("AnalyticsCharts stats.emotionCounts =", stats?.emotionCounts);

  // --- Emotion distribution for pie chart ---
  const emotionCounts = stats?.emotionCounts || {};

  const emotionData = [
    { name: "Positive",    value: emotionCounts.positive || 0 },
    { name: "Relief",      value: emotionCounts.relief || 0 },
    { name: "Confusion",   value: emotionCounts.confusion || 0 },
    { name: "Frustration", value: emotionCounts.frustration || 0 },
    { name: "Anger",       value: emotionCounts.anger || 0 },
  ].filter((d) => d.value > 0); // drop empty slices

  // --- 7-day sentiment trend ---
  const rawTrend = stats?.trendData || [];
  const trendData = rawTrend.map((t) => ({
    date: t.date,
    positive: Number(t.positive ?? t.Positive ?? 0) || 0,
    neutral: Number(t.neutral ?? t.Neutral ?? 0) || 0,
    negative: Number(t.negative ?? t.Negative ?? 0) || 0,
  }));

  const colors = ["#10b981", "#22c55e", "#6366f1", "#f97316", "#ef4444"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Emotion distribution pie */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Emotion Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={emotionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              dataKey="value"
            >
              {emotionData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Sentiment trend over time */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          7-Day Sentiment Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis />
            <Tooltip
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="positive"
              stroke="#10b981"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="neutral"
              stroke="#6b7280"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="negative"
              stroke="#ef4444"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
