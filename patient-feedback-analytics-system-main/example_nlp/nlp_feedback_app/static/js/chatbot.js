/**
 * Frontend-only Chatbot
 * Collects feedback using client-side NLP analysis and stores in allFeedback array
 * Data format matches CSV: feedback_text, department
 */

const feedbackForm = document.getElementById("feedbackForm");
const chatMessages = document.getElementById("chatMessages");
const submitBtn = document.getElementById("submitBtn");
const submitText = document.getElementById("submitText");
const submitSpinner = document.getElementById("submitSpinner");

feedbackForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const feedbackText = document.getElementById("feedback").value.trim();
  const department = document.getElementById("department").value || "General";

  if (!feedbackText) {
    alert("Please enter your feedback");
    return;
  }

  submitBtn.disabled = true;
  submitText.textContent = "Analyzing...";
  submitSpinner.classList.remove("d-none");

  // Display user message
  const userMessage = document.createElement("div");
  userMessage.className = "message user-message";
  userMessage.innerHTML = `
        <div class="message-content">
            <p><strong>Department:</strong> ${department}</p>
            <p>${feedbackText}</p>
        </div>
    `;
  chatMessages.appendChild(userMessage);

  // Simulate brief processing delay for better UX
  setTimeout(() => {
    try {
      // Analyze feedback using client-side NLP processor
      const analysis = feedbackProcessor.analyzeFeedback(feedbackText);

      // Create entry matching CSV format (feedback_text, department, analysis results)
      const entry = {
        id: allFeedback.length + 1,
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

      // Store in global allFeedback array (synced with dashboard)
      allFeedback.push(entry);

      // Display analysis results
      const botMessage = document.createElement("div");
      botMessage.className = "message bot-message";
      botMessage.innerHTML = `
                <div class="message-content">
                    <p><strong>✓ Feedback Analyzed Successfully</strong></p>
                    <hr>
                    <p><strong>Analysis Summary:</strong></p>
                    <ul class="mb-0">
                        <li>Sentiment: <span class="badge bg-${getSentimentColor(
                          analysis.sentiment
                        )}">${analysis.sentiment}</span></li>
                        <li>Emotion: <span class="badge bg-secondary">${
                          analysis.emotion
                        }</span></li>
                        <li>Category: <span class="badge bg-info">${
                          analysis.category
                        }</span></li>
                        <li>Severity Score: <span class="badge bg-${getSeverityColor(
                          analysis.severity_score
                        )}">${analysis.severity_score}/10</span></li>
                        <li>Keywords: ${analysis.keywords.join(", ")}</li>
                    </ul>
                </div>
            `;
      chatMessages.appendChild(botMessage);

      chatMessages.scrollTop = chatMessages.scrollHeight;

      feedbackForm.reset();

      setTimeout(() => {
        const thankYouMessage = document.createElement("div");
        thankYouMessage.className = "message bot-message";
        thankYouMessage.innerHTML = `
                    <div class="message-content">
                        <p>Your feedback has been recorded and is now available in the analytics dashboard. Thank you for helping us improve!</p>
                    </div>
                `;
        chatMessages.appendChild(thankYouMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 500);
    } catch (error) {
      console.error("Error analyzing feedback:", error);

      const errorMessage = document.createElement("div");
      errorMessage.className = "message bot-message";
      errorMessage.innerHTML = `
                <div class="message-content">
                    <p class="text-danger">Sorry, there was an error analyzing your feedback. Please try again.</p>
                </div>
            `;
      chatMessages.appendChild(errorMessage);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } finally {
      submitBtn.disabled = false;
      submitText.textContent = "Submit Feedback";
      submitSpinner.classList.add("d-none");
    }
  }, 500);
});

function getSentimentColor(sentiment) {
  switch (sentiment) {
    case "Positive":
      return "success";
    case "Negative":
      return "danger";
    case "Neutral":
      return "warning";
    default:
      return "secondary";
  }
}

function getSeverityColor(score) {
  if (score >= 7) return "danger";
  if (score >= 5) return "warning";
  return "success";
}

function downloadCsvFromChatbot() {
  if (allFeedback.length === 0) {
    alert("No feedback to download. Please submit feedback first.");
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

  alert("Feedback downloaded successfully!");
}

// Add download button listener
document.addEventListener("DOMContentLoaded", () => {
  const chatDownloadBtn = document.getElementById("chatDownloadCsvBtn");
  if (chatDownloadBtn) {
    chatDownloadBtn.addEventListener("click", downloadCsvFromChatbot);
  }
});
