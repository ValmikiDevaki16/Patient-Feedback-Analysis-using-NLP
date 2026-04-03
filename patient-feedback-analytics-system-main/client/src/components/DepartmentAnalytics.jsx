import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts";

export default function DepartmentAnalytics({ stats }) {
  if (!stats || !stats.departmentStats) {
    return (
      <div className="text-center text-gray-500 py-8">
        No department data available
      </div>
    );
  }

  const departmentData = Object.entries(stats.departmentStats).map(
    ([dept, data]) => ({
      name: dept,
      sentiment: data.sentimentScore,
      severity: data.severityScore,
      total: data.totalFeedback,
    })
  );

  const categoryData = stats.categoryDistribution || [];

  // Color scale for heatmap (severity 1-10)
  const getHeatmapColor = (severity) => {
    if (severity >= 8) return "#ef4444"; // Red - critical
    if (severity >= 6) return "#f97316"; // Orange - high
    if (severity >= 4) return "#eab308"; // Yellow - medium
    return "#10b981"; // Green - low
  };

  // Normalize heatmap data: accept either `stats.heatmapData` or `stats.heatmap`
  const rawHeatmap = stats.heatmapData || stats.heatmap || [];
  const heatmapData = (rawHeatmap || []).map((h) => ({
    department: (h.department || "").toString().trim(),
    category: (h.category || "").toString().trim(),
    severity: Number(h.severity) || 0,
    count: Number(h.count) || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Department Ratings */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Department Performance (Sentiment vs Severity)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={departmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip
              formatter={(value) => value.toFixed(2)}
              labelFormatter={(label) => `${label}`}
            />
            <Legend />
            <Bar
              dataKey="sentiment"
              fill="#3b82f6"
              name="Avg Sentiment Score"
            />
            <Bar dataKey="severity" fill="#ef4444" name="Avg Severity Score" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Issues by Category
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={categoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="category" type="category" width={120} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#667eea" name="Feedback Count" />
            <Bar dataKey="avgSeverity" fill="#f59e0b" name="Avg Severity" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap: Department x Category Severity */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Department × Category Heatmap (Severity Score)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 p-3 text-left font-semibold">
                  Department / Category
                </th>
                {[
                  "Wait Time",
                  "Staff Behavior",
                  "Cleanliness",
                  "Food Quality",
                  "Medical Care",
                  "Facilities",
                  "Cost",
                  "General",
                ].map((cat) => (
                  <th
                    key={cat}
                    className="border border-gray-200 p-2 text-center font-semibold text-xs"
                  >
                    {cat}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                "Emergency",
                "OPD",
                "IPD",
                "Surgery",
                "Pharmacy",
                "Laboratory",
                "Radiology",
                "General",
              ].map((dept) => (
                <tr key={dept}>
                  <td className="border border-gray-200 p-3 font-semibold text-gray-700">
                    {dept}
                  </td>
                  {[
                    "Wait Time",
                    "Staff Behavior",
                    "Cleanliness",
                    "Food Quality",
                    "Medical Care",
                    "Facilities",
                    "Cost",
                    "General",
                  ].map((cat) => {
                    const cell = heatmapData.find(
                      (h) =>
                        h.department.toLowerCase() === dept.toLowerCase() &&
                        h.category.toLowerCase() === cat.toLowerCase()
                    );
                    const severity = cell && cell.count > 0 ? cell.severity : 0;
                    const count = cell?.count || 0;
                    const bgColor = getHeatmapColor(severity);

                    return (
                      <td
                        key={`${dept}-${cat}`}
                        className="border border-gray-200 p-2 text-center text-white font-semibold"
                        style={{
                          backgroundColor: bgColor,
                          opacity: count > 0 ? 1 : 0.3,
                        }}
                        title={
                          count > 0
                            ? `Severity: ${severity.toFixed(
                                1
                              )} (${count} issues)`
                            : "No data"
                        }
                      >
                        {count > 0 ? severity.toFixed(1) : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6"
              style={{ backgroundColor: "#ef4444" }}
            ></div>
            <span>Critical (8-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6"
              style={{ backgroundColor: "#f97316" }}
            ></div>
            <span>High (6-8)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6"
              style={{ backgroundColor: "#eab308" }}
            ></div>
            <span>Medium (4-6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6"
              style={{ backgroundColor: "#10b981" }}
            ></div>
            <span>Low (1-4)</span>
          </div>
        </div>
      </div>

      {/* Department Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {departmentData.map((dept) => (
          <div
            key={dept.name}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100"
          >
            <h4 className="font-bold text-gray-800 mb-2">{dept.name}</h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-600">Total Feedback:</span>{" "}
                <span className="font-semibold">{dept.total}</span>
              </p>
              <p>
                <span className="text-gray-600">Sentiment Score:</span>{" "}
                <span
                  className={`font-semibold ${
                    dept.sentiment > 0.3
                      ? "text-green-600"
                      : dept.sentiment < -0.3
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {dept.sentiment.toFixed(2)}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Severity:</span>{" "}
                <span
                  className={`font-semibold ${
                    dept.severity > 7
                      ? "text-red-600"
                      : dept.severity > 5
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {dept.severity.toFixed(1)}/10
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
