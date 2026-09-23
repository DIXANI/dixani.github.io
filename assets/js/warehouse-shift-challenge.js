(() => {
  "use strict";

  const scenarios = [
    {
      category: "WAREHOUSE CAPACITY",
      icon: "🚚",
      title: "Unexpected inbound volume",
      description:
        "Your warehouse is already operating at high occupancy when an unexpected inbound shipment arrives. The receiving team needs a decision before unloading begins.",
      data: [
        ["Current occupancy", "91%"],
        ["Incoming volume", "120 pallets"],
        ["Expected dispatch", "70 pallets today"]
      ],
      choices: [
        {
          title: "Use dispatch staging as temporary storage",
          detail:
            "Unload immediately and place the incoming pallets in the dispatch staging area until locations become available.",
          rating: "risky",
          feedbackTitle: "Immediate space, but serious flow risk",
          explanation:
            "This creates short-term receiving capacity but interferes with dispatch activity, mixes inbound and outbound stock and increases congestion. Operational staging areas should not become uncontrolled overflow storage.",
          impact: {
            accuracy: -5,
            service: 3,
            cost: -2,
            safety: -10,
            flow: -9
          }
        },
        {
          title: "Create controlled capacity before put-away",
          detail:
            "Review available locations, consolidate approved partial pallets and prioritize dispatch and put-away activities.",
          rating: "strong",
          feedbackTitle: "A controlled and balanced capacity decision",
          explanation:
            "This option creates usable capacity while protecting staging areas. Consolidation must follow SKU, batch, expiry, ownership and stock-status controls, with every movement updated in the system.",
          impact: {
            accuracy: 5,
            service: 3,
            cost: -2,
            safety: 6,
            flow: 9
          }
        },
        {
          title: "Refuse the entire delivery",
          detail:
            "Prevent unloading and ask the supplier to return after warehouse occupancy has reduced.",
          rating: "mixed",
          feedbackTitle: "Capacity is protected, but service consequences remain",
          explanation:
            "Stopping the receipt protects internal space, but it can create detention, supplier and availability problems. Escalation may be appropriate when safe capacity genuinely does not exist, but the inbound and outbound plan should be reviewed first.",
          impact: {
            accuracy: 1,
            service: -10,
            cost: -7,
            safety: 3,
            flow: -3
          }
        }
      ]
    },
    {
      category: "INVENTORY CONTROL",
      icon: "🔍",
      title: "High-value stock discrepancy",
      description:
        "A high-value A-class item shows a shortage shortly before a committed customer dispatch. The system shows sufficient stock, but the physical quantity is lower.",
      data: [
        ["System quantity", "48 units"],
        ["Physical quantity", "42 units"],
        ["Unit value", "USD 1,250"]
      ],
      choices: [
        {
          title: "Adjust the system balance immediately",
          detail:
            "Post a shortage adjustment so that the system matches the first physical count and continue processing.",
          rating: "risky",
          feedbackTitle: "The balance changes, but the cause remains unknown",
          explanation:
            "An immediate adjustment may hide a counting, transaction, location or unit-of-measure error. High-value differences should normally be recounted, investigated and approved before adjustment.",
          impact: {
            accuracy: -11,
            service: 2,
            cost: 1,
            safety: 0,
            flow: 2
          }
        },
        {
          title: "Control the item and investigate",
          detail:
            "Arrange an independent recount and review recent receipts, issues, transfers, staging and nearby locations.",
          rating: "strong",
          feedbackTitle: "Strong inventory-control decision",
          explanation:
            "This protects the customer commitment while confirming whether the shortage is real. The investigation creates evidence for any approved adjustment and helps prevent the same error from recurring.",
          impact: {
            accuracy: 11,
            service: -2,
            cost: -3,
            safety: 3,
            flow: 2
          }
        },
        {
          title: "Dispatch a substitute without investigation",
          detail:
            "Use another item to complete the order and leave the discrepancy for the next cycle count.",
          rating: "risky",
          feedbackTitle: "Customer speed does not remove inventory risk",
          explanation:
            "A substitute may be unsuitable or unauthorized, while the high-value shortage remains unresolved. Delaying the investigation also makes transaction tracing more difficult.",
          impact: {
            accuracy: -8,
            service: 2,
            cost: -5,
            safety: -2,
            flow: -3
          }
        }
      ]
    },
    {
      category: "ORDER FULFILMENT",
      icon: "📦",
      title: "Picker shortage during a demand peak",
      description:
        "Order volume is above forecast and two experienced pickers are absent. Several carrier cut-off times are approaching.",
      data: [
        ["Open orders", "186"],
        ["Available pickers", "6 of 8"],
        ["Nearest cut-off", "90 minutes"]
      ],
      choices: [
        {
          title: "Release every order immediately",
          detail:
            "Send all open orders to the picking team so everyone remains continuously busy.",
          rating: "risky",
          feedbackTitle: "High work release can create warehouse congestion",
          explanation:
            "Releasing all orders at once can overload picking, replenishment, packing and staging. Work-in-progress increases while urgent orders become difficult to identify.",
          impact: {
            accuracy: -6,
            service: -5,
            cost: -4,
            safety: -5,
            flow: -10
          }
        },
        {
          title: "Prioritize and control the work release",
          detail:
            "Sequence orders by carrier cut-off, customer commitment, readiness and efficient pick grouping.",
          rating: "strong",
          feedbackTitle: "A strong workload-control decision",
          explanation:
            "Controlled release protects urgent commitments and prevents downstream areas from becoming overloaded. Progress should be reviewed frequently so resources can be reassigned when required.",
          impact: {
            accuracy: 3,
            service: 10,
            cost: 5,
            safety: 4,
            flow: 9
          }
        },
        {
          title: "Move untrained employees directly into picking",
          detail:
            "Assign available employees from another department without task briefing or supervision.",
          rating: "risky",
          feedbackTitle: "Extra labor without control can increase errors",
          explanation:
            "Untrained staff may create SKU, location, quantity and safety errors. Cross-trained support can help, but only when employees receive task guidance, appropriate equipment and supervision.",
          impact: {
            accuracy: -9,
            service: 3,
            cost: -3,
            safety: -11,
            flow: -4
          }
        }
      ]
    },
    {
      category: "EXPIRY CONTROL",
      icon: "📅",
      title: "Older batch blocked behind newer stock",
      description:
        "A replenishment check finds that a newer batch is positioned in front of an older batch. The product is expiry-controlled and an order is waiting for release.",
      data: [
        ["Older batch expiry", "45 days"],
        ["Newer batch expiry", "120 days"],
        ["Order requirement", "36 cartons"]
      ],
      choices: [
        {
          title: "Use FIFO based on receipt date only",
          detail:
            "Issue whichever batch was received first without checking which batch expires first.",
          rating: "mixed",
          feedbackTitle: "FIFO does not always protect expiry-controlled stock",
          explanation:
            "For expiry-controlled products, FEFO normally provides stronger protection because the earliest expiry should be issued first. Receipt sequence alone may not reflect remaining shelf life.",
          impact: {
            accuracy: -2,
            service: -4,
            cost: -5,
            safety: -7,
            flow: 2
          }
        },
        {
          title: "Control the order and restore FEFO access",
          detail:
            "Confirm batch details, relocate the obstruction safely and issue the earliest-expiring acceptable stock.",
          rating: "strong",
          feedbackTitle: "Strong expiry and location-control decision",
          explanation:
            "This follows FEFO, protects product quality and corrects the physical arrangement. The relocation and batch movement must also be updated accurately in the system.",
          impact: {
            accuracy: 7,
            service: 7,
            cost: -2,
            safety: 8,
            flow: 5
          }
        },
        {
          title: "Issue the accessible newer batch",
          detail:
            "Avoid relocation and dispatch the batch that is easiest to access.",
          rating: "risky",
          feedbackTitle: "Convenience creates future expiry exposure",
          explanation:
            "Issuing the newer stock leaves the older batch behind and increases the risk of expiry, write-off and customer complaints. Accessibility should be corrected rather than allowing it to override FEFO.",
          impact: {
            accuracy: -5,
            service: -5,
            cost: -9,
            safety: -8,
            flow: 2
          }
        }
      ]
    },
    {
      category: "DOCK MANAGEMENT",
      icon: "🚛",
      title: "Receiving and dispatch dock congestion",
      description:
        "Several inbound and outbound vehicles arrive within the same period. Dock space, checking areas and handling equipment are limited.",
      data: [
        ["Inbound vehicles", "4"],
        ["Outbound vehicles", "5"],
        ["Available dock doors", "3"]
      ],
      choices: [
        {
          title: "Handle vehicles strictly by arrival time",
          detail:
            "Use a first-come, first-served approach without considering cut-offs, load readiness or handling requirements.",
          rating: "mixed",
          feedbackTitle: "Simple sequencing may ignore operational priorities",
          explanation:
            "Arrival order is easy to administer, but it can delay urgent dispatches or occupy a dock with a load that is not ready. Dock decisions should consider commitments, readiness and handling constraints.",
          impact: {
            accuracy: 0,
            service: -5,
            cost: -3,
            safety: -3,
            flow: -6
          }
        },
        {
          title: "Create a controlled dock priority plan",
          detail:
            "Prioritize by carrier cut-off, load readiness, unloading requirements and available staging capacity.",
          rating: "strong",
          feedbackTitle: "Balanced dock and workload coordination",
          explanation:
            "A controlled sequence aligns docks, labor, staging and equipment. Communicating expected waiting times also reduces unnecessary movement and confusion around the yard and dock.",
          impact: {
            accuracy: 4,
            service: 9,
            cost: 5,
            safety: 7,
            flow: 10
          }
        },
        {
          title: "Use emergency-access space for staging",
          detail:
            "Create temporary capacity by placing completed pallets near emergency and pedestrian access routes.",
          rating: "risky",
          feedbackTitle: "Operational pressure never justifies blocking safety access",
          explanation:
            "Emergency and pedestrian routes must remain protected. Short-term space pressure should be managed through scheduling, controlled staging limits and escalation—not unsafe storage.",
          impact: {
            accuracy: 1,
            service: 2,
            cost: 1,
            safety: -15,
            flow: -7
          }
        }
      ]
    }
  ];

  const initialScores = {
    accuracy: 70,
    service: 70,
    cost: 70,
    safety: 70,
    flow: 70
  };

  let scores = { ...initialScores };
  let currentScenario = 0;
  let decisions = [];
  let choiceLocked = false;

  const elements = {
    startPanel: document.getElementById("startPanel"),
    gamePanel: document.getElementById("gamePanel"),
    resultsPanel: document.getElementById("resultsPanel"),
    startChallenge: document.getElementById("startChallenge"),
    scenarioCounter: document.getElementById("scenarioCounter"),
    progressFill: document.getElementById("progressFill"),
    progressText: document.getElementById("progressText"),
    scenarioIcon: document.getElementById("scenarioIcon"),
    scenarioCategory: document.getElementById("scenarioCategory"),
    scenarioTitle: document.getElementById("scenarioTitle"),
    scenarioDescription: document.getElementById("scenarioDescription"),
    scenarioData: document.getElementById("scenarioData"),
    decisionList: document.getElementById("decisionList"),
    feedbackPanel: document.getElementById("feedbackPanel"),
    feedbackStatus: document.getElementById("feedbackStatus"),
    feedbackTitle: document.getElementById("feedbackTitle"),
    feedbackExplanation: document.getElementById("feedbackExplanation"),
    impactGrid: document.getElementById("impactGrid"),
    nextScenario: document.getElementById("nextScenario"),
    finalScore: document.getElementById("finalScore"),
    resultTitle: document.getElementById("resultTitle"),
    resultSummary: document.getElementById("resultSummary"),
    decisionSummary: document.getElementById("decisionSummary"),
    shareResult: document.getElementById("shareResult"),
    restartChallenge: document.getElementById("restartChallenge"),
    shareMessage: document.getElementById("shareMessage")
  };

  const scoreKeys = ["accuracy", "service", "cost", "safety", "flow"];

  function clampScore(value) {
    return Math.max(0, Math.min(100, value));
  }

  function trackEvent(eventName, parameters = {}) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, parameters);
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(
        "dixaniWarehouseChallenge",
        JSON.stringify({
          scores,
          currentScenario,
          decisions
        })
      );
    } catch (error) {
      /* Progress saving is optional. */
    }
  }

  function clearProgress() {
    try {
      localStorage.removeItem("dixaniWarehouseChallenge");
    } catch (error) {
      /* Local storage may be unavailable. */
    }
  }

  function updateScoreDisplay() {
    scoreKeys.forEach((key) => {
      const scoreElement = document.getElementById(`${key}Score`);
      const meterElement = document.getElementById(`${key}Meter`);

      scoreElement.textContent = scores[key];
      meterElement.style.width = `${scores[key]}%`;

      if (scores[key] >= 75) {
        meterElement.style.background = "#15803d";
      } else if (scores[key] >= 50) {
        meterElement.style.background = "#2563eb";
      } else if (scores[key] >= 30) {
        meterElement.style.background = "#d97706";
      } else {
        meterElement.style.background = "#dc2626";
      }
    });
  }

  function renderScenario() {
    const scenario = scenarios[currentScenario];
    const progress = Math.round(
      ((currentScenario + 1) / scenarios.length) * 100
    );

    choiceLocked = false;

    elements.scenarioCounter.textContent =
      `SCENARIO ${currentScenario + 1} OF ${scenarios.length}`;

    elements.progressFill.style.width = `${progress}%`;
    elements.progressText.textContent = `${progress}% complete`;

    elements.scenarioIcon.textContent = scenario.icon;
    elements.scenarioCategory.textContent = scenario.category;
    elements.scenarioTitle.textContent = scenario.title;
    elements.scenarioDescription.textContent = scenario.description;

    elements.scenarioData.innerHTML = scenario.data
      .map(
        ([label, value]) => `
          <div class="data-point">
            <span>${label}</span>
            <strong>${value}</strong>
          </div>
        `
      )
      .join("");

    elements.decisionList.innerHTML = "";

    scenario.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.className = "decision-option";
      button.type = "button";

      button.innerHTML = `
        <span class="decision-letter">${String.fromCharCode(65 + index)}</span>
        <span>
          <strong>${choice.title}</strong>
          <small>${choice.detail}</small>
        </span>
      `;

      button.addEventListener("click", () => selectChoice(index, button));
      elements.decisionList.appendChild(button);
    });

    elements.feedbackPanel.hidden = true;
    updateScoreDisplay();

    window.scrollTo({
      top: elements.gamePanel.offsetTop - 24,
      behavior: "smooth"
    });
  }

  function selectChoice(choiceIndex, selectedButton) {
    if (choiceLocked) {
      return;
    }

    choiceLocked = true;

    const scenario = scenarios[currentScenario];
    const choice = scenario.choices[choiceIndex];

    document
      .querySelectorAll(".decision-option")
      .forEach((button) => {
        button.disabled = true;
      });

    selectedButton.classList.add("selected");

    scoreKeys.forEach((key) => {
      scores[key] = clampScore(scores[key] + choice.impact[key]);
    });

    decisions.push({
      scenario: scenario.title,
      choice: choice.title,
      rating: choice.rating
    });

    updateScoreDisplay();
    showFeedback(choice);

    elements.nextScenario.textContent =
      currentScenario === scenarios.length - 1
        ? "Complete the Shift"
        : "Continue to Next Scenario";

    saveProgress();

    trackEvent("warehouse_challenge_decision", {
      scenario_number: currentScenario + 1,
      scenario_name: scenario.title,
      decision_rating: choice.rating
    });
  }

  function showFeedback(choice) {
    const statusText = {
      strong: "STRONG DECISION",
      mixed: "MIXED IMPACT",
      risky: "HIGH-RISK DECISION"
    };

    elements.feedbackStatus.className =
      `feedback-status ${choice.rating}`;

    elements.feedbackStatus.textContent =
      statusText[choice.rating];

    elements.feedbackTitle.textContent =
      choice.feedbackTitle;

    elements.feedbackExplanation.textContent =
      choice.explanation;

    elements.impactGrid.innerHTML = scoreKeys
      .map((key) => {
        const value = choice.impact[key];
        const state =
          value > 0 ? "positive" : value < 0 ? "negative" : "neutral";

        const sign = value > 0 ? "+" : "";

        return `
          <span class="impact-pill ${state}">
            ${capitalize(key)} ${sign}${value}
          </span>
        `;
      })
      .join("");

    elements.feedbackPanel.hidden = false;

    setTimeout(() => {
      elements.feedbackPanel.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }, 50);
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function calculateFinalScore() {
    const total = scoreKeys.reduce(
      (sum, key) => sum + scores[key],
      0
    );

    return Math.round(total / scoreKeys.length);
  }

  function getResultProfile(score) {
    if (score >= 85) {
      return {
        title: "Excellent Warehouse Shift Leader",
        summary:
          "You balanced operational control, service, safety and warehouse flow exceptionally well. Your decisions showed strong awareness of connected warehouse risks."
      };
    }

    if (score >= 72) {
      return {
        title: "Strong Operational Supervisor",
        summary:
          "You handled the shift effectively and protected most operational priorities. A few decisions could be refined, but the overall warehouse remained controlled."
      };
    }

    if (score >= 58) {
      return {
        title: "Developing Warehouse Decision-Maker",
        summary:
          "You completed the shift, but some decisions created avoidable operational pressure. Review the decision feedback and consider how each KPI affects the others."
      };
    }

    return {
      title: "Shift Recovery Required",
      summary:
        "Several decisions created significant accuracy, service, cost, safety or flow risks. The result is a useful opportunity to review the controls behind each scenario."
    };
  }

  function showResults() {
    const finalScore = calculateFinalScore();
    const profile = getResultProfile(finalScore);

    elements.gamePanel.hidden = true;
    elements.resultsPanel.hidden = false;

    elements.finalScore.textContent = finalScore;
    elements.resultTitle.textContent = profile.title;
    elements.resultSummary.textContent = profile.summary;

    scoreKeys.forEach((key) => {
      document.getElementById(
        `final${capitalize(key)}`
      ).textContent = scores[key];
    });

    elements.decisionSummary.innerHTML = decisions
      .map(
        (decision, index) => `
          <div class="decision-review-item">
            <span class="review-number">${index + 1}</span>
            <div>
              <strong>${decision.scenario}</strong>
              <small>${decision.choice}</small>
            </div>
            <span class="review-rating ${decision.rating}">
              ${
                decision.rating === "strong"
                  ? "Strong"
                  : decision.rating === "mixed"
                    ? "Mixed"
                    : "High risk"
              }
            </span>
          </div>
        `
      )
      .join("");

    clearProgress();

    trackEvent("warehouse_challenge_complete", {
      final_score: finalScore,
      accuracy_score: scores.accuracy,
      service_score: scores.service,
      cost_score: scores.cost,
      safety_score: scores.safety,
      flow_score: scores.flow
    });

    window.scrollTo({
      top: elements.resultsPanel.offsetTop - 24,
      behavior: "smooth"
    });
  }

  function startChallenge() {
    scores = { ...initialScores };
    currentScenario = 0;
    decisions = [];
    choiceLocked = false;

    elements.startPanel.hidden = true;
    elements.resultsPanel.hidden = true;
    elements.gamePanel.hidden = false;
    elements.shareMessage.textContent = "";

    clearProgress();
    updateScoreDisplay();
    renderScenario();

    trackEvent("warehouse_challenge_start");
  }

  function moveToNextScenario() {
    if (!choiceLocked) {
      return;
    }

    if (currentScenario >= scenarios.length - 1) {
      showResults();
      return;
    }

    currentScenario += 1;
    saveProgress();
    renderScenario();
  }

  async function shareResult() {
    const finalScore = calculateFinalScore();

    const shareText =
      `I scored ${finalScore}/100 in the DIXANI Warehouse Shift Challenge. ` +
      `Can you manage the shift?`;

    const shareData = {
      title: "DIXANI Warehouse Shift Challenge",
      text: shareText,
      url: "https://dixani.com/simulators/warehouse-shift-challenge/"
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        elements.shareMessage.textContent = "Result shared successfully.";
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          `${shareText} ${shareData.url}`
        );
        elements.shareMessage.textContent =
          "Result copied. You can now paste it into LinkedIn or another platform.";
      } else {
        elements.shareMessage.textContent =
          `${shareText} ${shareData.url}`;
      }

      trackEvent("warehouse_challenge_share", {
        final_score: finalScore
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        elements.shareMessage.textContent =
          "Sharing was unavailable. Copy the page URL from your browser.";
      }
    }
  }

  function restartChallenge() {
    clearProgress();
    startChallenge();
  }

  elements.startChallenge.addEventListener(
    "click",
    startChallenge
  );

  elements.nextScenario.addEventListener(
    "click",
    moveToNextScenario
  );

  elements.shareResult.addEventListener(
    "click",
    shareResult
  );

  elements.restartChallenge.addEventListener(
    "click",
    restartChallenge
  );

  updateScoreDisplay();
})();