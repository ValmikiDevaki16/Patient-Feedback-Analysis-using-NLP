// Dashboard runs in public/local mode without Clerk authentication by default.
function initializeClerk() {
  showDashboard();
  loadAnalytics();
}

function showDashboard() {
  document.getElementById("authCheck").classList.add("d-none");
  document.getElementById("loginRequired").classList.add("d-none");
  document.getElementById("dashboardContent").classList.remove("d-none");
}

function showLoginRequired() {
  document.getElementById("authCheck").classList.add("d-none");
  document.getElementById("loginRequired").classList.remove("d-none");
  document.getElementById("dashboardContent").classList.add("d-none");
}

// Sign-in / logout buttons are no-ops in local mode; keep handlers to avoid errors.
document.getElementById("signInBtn")?.addEventListener("click", () => {
  alert("Sign-in is disabled in local testing mode.");
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  alert("Logout is disabled in local testing mode.");
});

async function loadAnalytics() {
  try {
    const response = await fetch("/api/analytics");
    const data = await response.json();

    document.getElementById("totalFeedback").textContent = data.total_feedback;
    document.getElementById("avgSentiment").textContent =
      data.avg_sentiment_score.toFixed(1);
    document.getElementById("criticalIssues").textContent =
      data.critical_issues;

    createSentimentChart(data.sentiment_distribution);
    createCategoryChart(data.category_distribution);
    createDepartmentChart(data.department_ratings);
    displayRecommendations(data.recommendations);
    displayRecentFeedback(data.recent_feedback);

    loadHeatmap();
  } catch (error) {
    console.error("Error loading analytics:", error);
  }
}

function createSentimentChart(sentimentData) {
  const data = [
    {
      values: Object.values(sentimentData),
      labels: Object.keys(sentimentData),
      type: "pie",
      marker: {
        colors: ["#10b981", "#6b7280", "#ef4444"],
      },
      textinfo: "label+percent",
      hoverinfo: "label+value+percent",
    },
  ];

  const layout = {
    height: 350,
    margin: { t: 0, b: 0, l: 0, r: 0 },
    showlegend: true,
    legend: {
      orientation: "h",
      y: -0.1,
    },
  };

  Plotly.newPlot("sentimentChart", data, layout, { responsive: true });
}

function createCategoryChart(categoryData) {
  const data = [
    {
      values: Object.values(categoryData),
      labels: Object.keys(categoryData),
      type: "pie",
      marker: {
        colors: ["#667eea", "#764ba2", "#f59e0b", "#06b6d4", "#8b5cf6"],
      },
      textinfo: "label+percent",
      hoverinfo: "label+value+percent",
    },
  ];

  const layout = {
    height: 350,
    margin: { t: 0, b: 0, l: 0, r: 0 },
    showlegend: true,
    legend: {
      orientation: "h",
      y: -0.1,
    },
  };

  Plotly.newPlot("categoryChart", data, layout, { responsive: true });
}

function createDepartmentChart(departmentData) {
  const departments = Object.keys(departmentData);
  const ratings = Object.values(departmentData);

  const data = [
    {
      x: departments,
      y: ratings,
      type: "bar",
      marker: {
        color: ratings.map((r) =>
          r >= 7 ? "#10b981" : r >= 5 ? "#f59e0b" : "#ef4444"
        ),
      },
      text: ratings.map((r) => r.toFixed(1)),
      textposition: "outside",
    },
  ];

  const layout = {
    height: 400,
    margin: { t: 20, b: 80, l: 60, r: 20 },
    xaxis: {
      title: "Department",
      tickangle: -45,
    },
    yaxis: {
      title: "Average Sentiment Score",
      range: [0, 10],
    },
  };

  Plotly.newPlot("departmentChart", data, layout, { responsive: true });
}

async function loadHeatmap() {
  try {
    const response = await fetch("/api/severity-heatmap");
    const data = await response.json();

    if (data.length === 0) {
      document.getElementById("heatmapChart").innerHTML =
        '<p class="text-muted">No data available for heatmap</p>';
      return;
    }

    const departments = [...new Set(data.map((d) => d.department))];
    const categories = [...new Set(data.map((d) => d.category))];

    const zData = categories.map((cat) =>
      departments.map((dept) => {
        const item = data.find(
          (d) => d.department === dept && d.category === cat
        );
        return item ? item.avg_severity : 0;
      })
    );

    const heatmapData = [
      {
        z: zData,
        x: departments,
        y: categories,
        type: "heatmap",
        colorscale: [
          [0, "#10b981"],
          [0.5, "#f59e0b"],
          [1, "#ef4444"],
        ],
        hoverongaps: false,
        hovertemplate:
          "Department: %{x}<br>Category: %{y}<br>Severity: %{z:.1f}<extra></extra>",
      },
    ];

    const layout = {
      height: 400,
      margin: { t: 20, b: 100, l: 150, r: 20 },
      xaxis: {
        title: "Department",
        tickangle: -45,
      },
      yaxis: {
        title: "Category",
      },
    };

    Plotly.newPlot("heatmapChart", heatmapData, layout, { responsive: true });
  } catch (error) {
    console.error("Error loading heatmap:", error);
  }
}

function displayRecommendations(recommendations) {
  const container = document.getElementById("recommendationsList");

  if (recommendations.length === 0) {
    container.innerHTML =
      '<p class="text-muted">No recommendations available</p>';
    return;
  }

  container.innerHTML = recommendations
    .map(
      (rec) => `
        <div class="recommendation-item ${
          rec.severity === "High" ? "high-severity" : ""
        }">
            <h6>
                <span class="badge bg-${
                  rec.severity === "High" ? "danger" : "success"
                }">${rec.severity}</span>
                ${rec.category}
            </h6>
            <p>${rec.recommendation}</p>
        </div>
    `
    )
    .join("");
}

function displayRecentFeedback(feedbacks) {
  const tbody = document.getElementById("recentFeedbackBody");

  if (feedbacks.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center text-muted">No feedback available</td></tr>';
    return;
  }

  tbody.innerHTML = feedbacks
    .reverse()
    .map(
      (fb) => `
        <tr>
            <td>${new Date(fb.created_at).toLocaleDateString()}</td>
            <td>${fb.department}</td>
            <td><span class="badge bg-${getSentimentColor(fb.sentiment)}">${
        fb.sentiment
      }</span></td>
            <td>${fb.category}</td>
            <td><span class="badge bg-${getSeverityColor(fb.severity_score)}">${
        fb.severity_score
      }/10</span></td>
            <td>${fb.feedback_text.substring(0, 100)}${
        fb.feedback_text.length > 100 ? "..." : ""
      }</td>
        </tr>
    `
    )
    .join("");
}

function getSentimentColor(sentiment) {
  switch (sentiment) {
    case "Positive":
      return "success";
    case "Negative":
      return "danger";
    default:
      return "secondary";
  }
}

function getSeverityColor(severity) {
  if (severity >= 7) return "danger";
  if (severity >= 5) return "warning";
  return "success";
}

document.getElementById("refreshBtn").addEventListener("click", () => {
  loadAnalytics();
});

document.addEventListener("DOMContentLoaded", () => {
  initializeClerk();
});
