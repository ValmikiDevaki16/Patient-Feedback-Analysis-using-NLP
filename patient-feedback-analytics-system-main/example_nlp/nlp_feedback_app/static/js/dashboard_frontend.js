/**
 * Frontend-only Dashboard Analytics
 * Processes feedback data entirely in-browser using CSV uploads
 */

let allFeedback = [];

// Initialize dashboard on page load
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  displayEmptyState();
});

function setupEventListeners() {
  document
    .getElementById("uploadCsvBtn")
    .addEventListener("click", handleCsvUpload);
  document
    .getElementById("refreshBtn")
    .addEventListener("click", loadAnalytics);
  document
    .getElementById("csvFileInput")
    .addEventListener("change", handleFileSelect);

  // Add download button listener
  const downloadBtn = document.getElementById("downloadCsvBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadCsv);
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Show file name feedback
  const fileName = file.name;
  console.log("Selected file:", fileName);
}

function handleCsvUpload() {
  const fileInput = document.getElementById("csvFileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a CSV file");
    return;
  }

  Papa.parse(file, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: true,
    complete: (results) => {
      try {
        processCsvData(results.data);
        // Close modal and refresh analytics
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("csvUploadModal")
        );
        modal.hide();
        fileInput.value = "";
        alert("CSV uploaded and analyzed successfully!");
      } catch (error) {
        alert("Error processing CSV: " + error.message);
      }
    },
    error: (error) => {
      alert("Error parsing CSV: " + error.message);
    },
  });
}

function processCsvData(rows) {
  allFeedback = [];

  rows.forEach((row, index) => {
    // Skip empty rows
    if (!row.feedback_text || row.feedback_text.trim() === "") return;

    const feedbackText = row.feedback_text.trim();
    const department = row.department ? row.department.trim() : "General";

    // Analyze feedback using processor
    const analysis = feedbackProcessor.analyzeFeedback(feedbackText);

    const entry = {
      id: index + 1,
      feedback_text: feedbackText,
      department: department,
      sentiment: analysis.sentiment,
      sentiment_score: analysis.sentiment_score,
      emotion: analysis.emotion,
      category: analysis.category,
      severity_score: analysis.severity_score,
      keywords: analysis.keywords,
      created_at: new Date().toISOString(),
    };

    allFeedback.push(entry);
  });

  // Load and display analytics
  loadAnalytics();
}

function loadAnalytics() {
  if (allFeedback.length === 0) {
    displayEmptyState();
    return;
  }

  const analytics = generateAnalytics();

  // Update stat cards
  document.getElementById("totalFeedback").textContent =
    analytics.total_feedback;
  document.getElementById("avgSentiment").textContent =
    analytics.avg_sentiment_score.toFixed(1);
  document.getElementById("criticalIssues").textContent =
    analytics.critical_issues;

  // Create charts
  createSentimentChart(analytics.sentiment_distribution);
  createCategoryChart(analytics.category_distribution);
  createDepartmentChart(analytics.department_ratings);
  displayRecommendations(analytics.recommendations);
  displayRecentFeedback(analytics.recent_feedback);
  createHeatmap(analytics.heatmap_data);
}

function generateAnalytics() {
  const total = allFeedback.length;

  if (total === 0) {
    return {
      total_feedback: 0,
      avg_sentiment_score: 0,
      critical_issues: 0,
      sentiment_distribution: {},
      category_distribution: {},
      department_ratings: {},
      recent_feedback: [],
      recommendations: [],
      heatmap_data: [],
    };
  }

  const sentiment_counts = { Positive: 0, Neutral: 0, Negative: 0 };
  const category_counts = {};
  const department_scores = {};
  let critical_count = 0;
  let total_score = 0;
  const heatmap_map = {};

  allFeedback.forEach((fb) => {
    sentiment_counts[fb.sentiment] = (sentiment_counts[fb.sentiment] || 0) + 1;
    category_counts[fb.category] = (category_counts[fb.category] || 0) + 1;

    if (!department_scores[fb.department]) {
      department_scores[fb.department] = [];
    }
    department_scores[fb.department].push(fb.sentiment_score);

    if (fb.severity_score >= 7) {
      critical_count++;
    }

    total_score += fb.sentiment_score;

    // Heatmap data
    const key = `${fb.department}_${fb.category}`;
    if (!heatmap_map[key]) {
      heatmap_map[key] = {
        department: fb.department,
        category: fb.category,
        severities: [],
      };
    }
    heatmap_map[key].severities.push(fb.severity_score);
  });

  const department_ratings = {};
  for (const [dept, scores] of Object.entries(department_scores)) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    department_ratings[dept] = Math.round(avg * 100) / 100;
  }

  const heatmap_data = Object.values(heatmap_map).map((item) => ({
    department: item.department,
    category: item.category,
    avg_severity:
      Math.round(
        (item.severities.reduce((a, b) => a + b) / item.severities.length) * 100
      ) / 100,
  }));

  const recommendations =
    feedbackProcessor.generateRecommendations(allFeedback);

  return {
    total_feedback: total,
    avg_sentiment_score:
      total > 0 ? Math.round((total_score / total) * 100) / 100 : 0,
    critical_issues: critical_count,
    sentiment_distribution: sentiment_counts,
    category_distribution: category_counts,
    department_ratings: department_ratings,
    recent_feedback: allFeedback.slice(-10),
    recommendations: recommendations,
    heatmap_data: heatmap_data,
  };
}

function displayEmptyState() {
  document.getElementById("totalFeedback").textContent = "0";
  document.getElementById("avgSentiment").textContent = "0.0";
  document.getElementById("criticalIssues").textContent = "0";

  const charts = [
    "sentimentChart",
    "categoryChart",
    "departmentChart",
    "heatmapChart",
  ];
  charts.forEach((chart) => {
    const elem = document.getElementById(chart);
    if (elem) {
      elem.innerHTML =
        '<p class="text-muted text-center py-4">No data - Upload a CSV file to get started</p>';
    }
  });

  document.getElementById("recommendationsList").innerHTML =
    '<p class="text-muted">Upload feedback data to receive recommendations</p>';
  document.getElementById("recentFeedbackBody").innerHTML =
    '<tr><td colspan="6" class="text-center text-muted">No feedback data</td></tr>';
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

function createHeatmap(heatmapData) {
  if (heatmapData.length === 0) {
    document.getElementById("heatmapChart").innerHTML =
      '<p class="text-muted">No heatmap data available</p>';
    return;
  }

  const departments = [...new Set(heatmapData.map((d) => d.department))];
  const categories = [...new Set(heatmapData.map((d) => d.category))];

  const zData = categories.map((cat) =>
    departments.map((dept) => {
      const item = heatmapData.find(
        (d) => d.department === dept && d.category === cat
      );
      return item ? item.avg_severity : 0;
    })
  );

  const data = [
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

  Plotly.newPlot("heatmapChart", data, layout, { responsive: true });
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

function downloadCsv() {
  if (allFeedback.length === 0) {
    alert(
      "No feedback data to download. Please upload a CSV or submit feedback first."
    );
    return;
  }

  // Prepare CSV headers
  const headers = [
    "id",
    "feedback_text",
    "department",
    "sentiment",
    "sentiment_score",
    "emotion",
    "category",
    "severity_score",
    "keywords",
    "created_at",
  ];

  // Prepare CSV rows
  const rows = allFeedback.map((fb) => [
    fb.id,
    `"${fb.feedback_text.replace(/"/g, '""')}"`, // Escape quotes in feedback
    fb.department,
    fb.sentiment,
    fb.sentiment_score,
    fb.emotion,
    fb.category,
    fb.severity_score,
    `"${Array.isArray(fb.keywords) ? fb.keywords.join(", ") : fb.keywords}"`, // Convert keywords array to string
    fb.created_at,
  ]);

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `feedback_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Also send data to backend to save in feedback.csv
  saveFeedbackToServer();
}

function saveFeedbackToServer() {
  // Send feedback data to backend to persist in feedback.csv
  fetch("/api/save-feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(allFeedback),
  }).catch((err) => {
    // Fail silently - frontend CSV download already works
    console.log("Backend save not available (frontend-only mode)");
  });
}
