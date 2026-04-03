#!/usr/bin/env node
/**
 * Script: generate_test_feedbacks.js
 * Purpose: Generate synthetic test feedbacks across all department x category combinations
 * for perfect analytics visualization.
 *
 * Usage from repository root:
 *   node server/scripts/generate_test_feedbacks.js
 *
 * This script will:
 * 1. Clear existing feedbacks
 * 2. Generate realistic test feedbacks for each dept x category (8x8 = 64 cells)
 * 3. Ensure proper sentiment distribution (40% positive, 35% neutral, 25% negative)
 * 4. Vary severity scores to create interesting heatmap patterns
 */

import {
  readFeedbackList,
  deleteAllFeedbacks,
  addFeedback,
  readStaffList,
} from "../utils/csvStore.js";

const departments = [
  "Emergency",
  "OPD",
  "IPD",
  "Surgery",
  "Pharmacy",
  "Laboratory",
  "Radiology",
  "General",
];

const categories = [
  "Wait Time",
  "Staff Behavior",
  "Cleanliness",
  "Food Quality",
  "Medical Care",
  "Facilities",
  "Cost",
  "General",
];

// Sample feedback templates
const feedbackTemplates = {
  positive: {
    "Wait Time": [
      "The waiting time was very short. Excellent service!",
      "Quick check-in process, hardly any wait at all.",
      "Very efficient, saw the doctor right away.",
    ],
    "Staff Behavior": [
      "The staff was incredibly friendly and attentive.",
      "Excellent bedside manner. Made me feel comfortable.",
      "Staff were professional and caring throughout.",
    ],
    Cleanliness: [
      "Facility was spotlessly clean and well-maintained.",
      "Excellent hygiene standards throughout.",
      "The environment was very clean and pleasant.",
    ],
    "Food Quality": [
      "The food was delicious and nutritious.",
      "Meals were hot and tasty with good variety.",
      "Food options were excellent and well-prepared.",
    ],
    "Medical Care": [
      "Excellent medical treatment and diagnosis.",
      "Doctor was very knowledgeable and thorough.",
      "Received top-quality healthcare.",
    ],
    Facilities: [
      "Modern facilities and comfortable environment.",
      "Equipment is state-of-the-art.",
      "Excellent infrastructure and amenities.",
    ],
    Cost: [
      "Very reasonable and transparent pricing.",
      "Good value for the services provided.",
      "Affordable and fair charges.",
    ],
    General: [
      "Overall excellent experience. Highly recommend!",
      "Very satisfied with the entire visit.",
      "Great hospital, will come back.",
    ],
  },
  neutral: {
    "Wait Time": [
      "Wait time was average, nothing special.",
      "Took some time but it was acceptable.",
      "Standard waiting period as expected.",
    ],
    "Staff Behavior": [
      "Staff were professional and did their job.",
      "Polite but somewhat distant.",
      "Standard professional behavior.",
    ],
    Cleanliness: [
      "The facility was adequately clean.",
      "Cleanliness was acceptable overall.",
      "Standard hygiene levels maintained.",
    ],
    "Food Quality": [
      "Food was okay, nothing exceptional.",
      "Meals were standard hospital fare.",
      "Food was adequate and acceptable.",
    ],
    "Medical Care": [
      "Medical care was standard and appropriate.",
      "Doctor provided adequate treatment.",
      "Healthcare was satisfactory.",
    ],
    Facilities: [
      "Facilities were adequate for the services.",
      "Infrastructure was reasonable.",
      "Amenities were standard.",
    ],
    Cost: [
      "Pricing was acceptable.",
      "Costs seemed reasonable.",
      "Charges were fair.",
    ],
    General: [
      "Experience was satisfactory overall.",
      "Average visit, nothing remarkable.",
      "Adequate service provided.",
    ],
  },
  negative: {
    "Wait Time": [
      "Had to wait for a very long time.",
      "Extremely long waiting period, very frustrating.",
      "Waited hours to see the doctor.",
    ],
    "Staff Behavior": [
      "Staff were rude and unhelpful.",
      "Very poor customer service and attitude.",
      "Staff seemed indifferent to patient needs.",
    ],
    Cleanliness: [
      "Facility was dirty and unhygienic.",
      "Poor cleanliness standards observed.",
      "The place was not clean at all.",
    ],
    "Food Quality": [
      "Food was cold and tasteless.",
      "Very poor quality meals served.",
      "Food was inedible and unappetizing.",
    ],
    "Medical Care": [
      "Medical care was inadequate.",
      "Doctor seemed inexperienced.",
      "Poor treatment and diagnosis.",
    ],
    Facilities: [
      "Facilities are outdated and poorly maintained.",
      "Equipment seems broken or non-functional.",
      "Very poor infrastructure.",
    ],
    Cost: [
      "Charges were extremely high and unfair.",
      "Overcharged significantly.",
      "Very expensive with hidden costs.",
    ],
    General: [
      "Very unsatisfactory experience overall.",
      "Would not recommend this hospital.",
      "Terrible experience from start to finish.",
    ],
  },
};

const sentiments = ["Positive", "Neutral", "Negative"];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate severity based on sentiment
function generateSeverityScore(sentiment) {
  if (sentiment === "Positive") {
    return getRandomInt(1, 3); // Low severity for positive
  } else if (sentiment === "Neutral") {
    return getRandomInt(4, 6); // Medium severity for neutral
  } else {
    return getRandomInt(7, 10); // High severity for negative
  }
}

// Generate polarity score based on sentiment
function generatePolarityScore(sentiment) {
  if (sentiment === "Positive") {
    return Number((Math.random() * 0.5 + 0.5).toFixed(2)); // 0.5 to 1.0
  } else if (sentiment === "Neutral") {
    return Number(((Math.random() - 0.5) * 0.2).toFixed(2)); // -0.1 to 0.1
  } else {
    return Number((Math.random() * -0.5 - 0.5).toFixed(2)); // -1.0 to -0.5
  }
}

async function generateTestFeedbacks() {
  console.log("🧹 Clearing existing feedbacks...");
  await deleteAllFeedbacks();

  console.log(
    "📝 Generating test feedbacks for all department x category combinations..."
  );

  const staffList = await readStaffList();
  const staffIds = staffList
    .filter((s) => s.staffId)
    .slice(0, 10)
    .map((s) => ({ staffId: s.staffId, staffName: s.name }));

  let feedbackCount = 0;

  // For each department x category combination
  for (const dept of departments) {
    for (const category of categories) {
      // Generate 3-5 feedbacks per cell for variety
      const numFeedbacks = getRandomInt(3, 5);

      for (let i = 0; i < numFeedbacks; i++) {
        // Sentiment distribution: 40% positive, 35% neutral, 25% negative
        let sentiment;
        const rand = Math.random();
        if (rand < 0.4) {
          sentiment = "Positive";
        } else if (rand < 0.75) {
          sentiment = "Neutral";
        } else {
          sentiment = "Negative";
        }

        const severity = generateSeverityScore(sentiment);
        const polarity = generatePolarityScore(sentiment);

        const staff = staffIds.length ? getRandomElement(staffIds) : {};
        const patientId = `PAT_${dept.replace(/ /g, "")}_${i}`;
        const patientName = `Patient ${i + 1}`;

        const feedbackText =
          feedbackTemplates[sentiment.toLowerCase()][category][
            getRandomInt(0, 2)
          ];

        const feedback = await addFeedback({
          text: feedbackText,
          patientName,
          patientId,
          department: dept,
          staffId: staff.staffId || "",
          staffName: staff.staffName || "",
          sentiment,
          polarityScore: polarity,
          sentimentScore: polarity,
          emotion: sentiment.toLowerCase(),
          category,
          severityScore: severity,
          keywords: [category.toLowerCase()],
          doctorRating: getRandomInt(1, 5),
        });

        feedbackCount++;
        console.log(
          `✅ [${feedbackCount}] ${dept} - ${category} - ${sentiment}`
        );
      }
    }
  }

  console.log("\n🎉 Test feedback generation complete!");
  console.log(`Total feedbacks generated: ${feedbackCount}`);
  console.log("📊 Run the admin dashboard to view analytics and heatmap.");
}

generateTestFeedbacks().catch((err) => {
  console.error("❌ Error generating test feedbacks:", err);
  process.exit(1);
});
