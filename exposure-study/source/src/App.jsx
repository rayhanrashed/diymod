import { useEffect, useRef, useState } from "react";

const RATING_FIELDS = [
  {
    key: "distress",
    question: "How anxiety-provoking or distressing is this image?",
    low: "Not at all",
    high: "Extremely"
  },
  {
    key: "willingness",
    question: "How willing would you be to continue viewing this image?",
    low: "Not willing",
    high: "Completely willing"
  },
  {
    key: "stimulusFidelity",
    question: "How much does this still look or feel like the triggering stimulus?",
    low: "Not at all",
    high: "Very much"
  }
];

const emptyRatings = () => ({
  distress: null,
  willingness: null,
  stimulusFidelity: null
});

function shuffled(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function createSessionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}`;
}

function mean(responses, key) {
  const values = responses
    .map((response) => response[key])
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function RatingScale({ field, value, onChange }) {
  return (
    <fieldset className="rating-card">
      <legend>{field.question}</legend>
      <div className="scale-labels" aria-hidden="true">
        <span>0 - {field.low}</span>
        <span>10 - {field.high}</span>
      </div>
      <div className="rating-options" role="group" aria-label={field.question}>
        {Array.from({ length: 11 }, (_, rating) => (
          <button
            className={value === rating ? "rating-option selected" : "rating-option"}
            key={rating}
            type="button"
            aria-pressed={value === rating}
            onClick={() => onChange(rating)}
          >
            {rating}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function App() {
  const [dataset, setDataset] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [phase, setPhase] = useState("intro");
  const [participantCode, setParticipantCode] = useState("");
  const [selectedCaseIds, setSelectedCaseIds] = useState([]);
  const [trials, setTrials] = useState([]);
  const [trialIndex, setTrialIndex] = useState(0);
  const [ratings, setRatings] = useState(emptyRatings);
  const [responses, setResponses] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [finishReason, setFinishReason] = useState("");
  const trialStartedAt = useRef(0);

  useEffect(() => {
    fetch("./seed-dataset.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Dataset request failed with status ${response.status}.`);
        }
        return response.json();
      })
      .then(setDataset)
      .catch((error) => setLoadError(error.message));
  }, []);

  const currentTrial = trials[trialIndex];
  const currentCase = currentTrial
    ? dataset.cases.find((item) => item.id === currentTrial.caseId)
    : null;
  const allRatingsSelected = Object.values(ratings).every(Number.isFinite);
  const selectedStimulusCount = dataset
    ? dataset.stimuli.filter((stimulus) => selectedCaseIds.includes(stimulus.caseId)).length
    : 0;

  function toggleCase(caseId) {
    setSelectedCaseIds((current) =>
      current.includes(caseId)
        ? current.filter((selectedId) => selectedId !== caseId)
        : [...current, caseId]
    );
  }

  function startStudy(event) {
    event.preventDefault();
    const code = participantCode.trim();
    if (!dataset || !code || selectedCaseIds.length === 0) {
      return;
    }

    const selectedTrials = dataset.cases
      .filter((caseItem) => selectedCaseIds.includes(caseItem.id))
      .flatMap((caseItem) =>
        shuffled(dataset.stimuli.filter((stimulus) => stimulus.caseId === caseItem.id))
      );

    setParticipantCode(code);
    setTrials(selectedTrials);
    setTrialIndex(0);
    setRatings(emptyRatings());
    setResponses([]);
    setSessionId(createSessionId());
    setStartedAt(new Date().toISOString());
    setCompletedAt("");
    setFinishReason("");
    trialStartedAt.current = Date.now();
    setPhase("study");
  }

  function recordTrial(skipped) {
    const response = {
      stimulusId: currentTrial.id,
      caseId: currentTrial.caseId,
      legacyPairId: currentTrial.legacyPairId || null,
      presentedOrder: trialIndex + 1,
      axis: currentTrial.axis,
      transformation: currentTrial.transformation,
      parameterization: currentTrial.parameterization,
      distress: skipped ? null : ratings.distress,
      willingness: skipped ? null : ratings.willingness,
      stimulusFidelity: skipped ? null : ratings.stimulusFidelity,
      skipped,
      responseTimeMs: Date.now() - trialStartedAt.current,
      recordedAt: new Date().toISOString()
    };
    const nextResponses = [...responses, response];
    setResponses(nextResponses);

    if (trialIndex + 1 >= trials.length) {
      setCompletedAt(new Date().toISOString());
      setFinishReason("completed");
      setPhase("complete");
      return;
    }

    setTrialIndex((index) => index + 1);
    setRatings(emptyRatings());
    trialStartedAt.current = Date.now();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function endEarly() {
    setCompletedAt(new Date().toISOString());
    setFinishReason("ended-early");
    setPhase("complete");
  }

  function exportSession() {
    return {
      schemaVersion: "1.0",
      prototypeVersion: "0.1.0",
      dataset: {
        id: dataset.id,
        version: dataset.version,
        provenance: dataset.provenance
      },
      session: {
        sessionId,
        participantCode,
        selectedCases: dataset.cases
          .filter((caseItem) => selectedCaseIds.includes(caseItem.id))
          .map((caseItem) => ({
            id: caseItem.id,
            label: caseItem.label
          })),
        startedAt,
        completedAt,
        finishReason,
        plannedTrialCount: trials.length,
        recordedTrialCount: responses.length
      },
      responses
    };
  }

  function downloadResults() {
    const blob = new Blob([JSON.stringify(exportSession(), null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeCode = participantCode.replace(/[^a-z0-9_-]+/gi, "-");
    link.href = url;
    link.download = `exposure-study-${safeCode || "participant"}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function restart() {
    setPhase("intro");
    setParticipantCode("");
    setSelectedCaseIds([]);
    setTrials([]);
    setTrialIndex(0);
    setRatings(emptyRatings());
    setResponses([]);
  }

  if (loadError) {
    return (
      <main className="shell">
        <section className="panel error-panel">
          <p className="eyebrow">Dataset error</p>
          <h1>The seed manifest could not be loaded.</h1>
          <p>{loadError}</p>
        </section>
      </main>
    );
  }

  if (!dataset) {
    return (
      <main className="shell loading-state">
        <p>Loading the prototype dataset...</p>
      </main>
    );
  }

  if (phase === "intro") {
    return (
      <>
        <header className="site-header">
          <div>
            <p className="eyebrow">e-HAIL progress prototype</p>
            <h1>Exposure Transformation Study</h1>
            <p className="lede">
              A minimal interface for collecting responses to transformed images.
            </p>
          </div>
          <span className="version-badge">v0.1</span>
        </header>

        <main className="shell intro-grid">
          <section className="panel">
            <p className="eyebrow">What this demonstrates</p>
            <h2>One complete experimental loop</h2>
            <p>
              Participants first identify the sensitivity categories relevant to
              them. The prototype then presents only matching transformations,
              collects the three proposed ratings, and exports a structured session
              record.
            </p>
            <div className="notice">
              <strong>Prototype only.</strong> This is not a treatment tool or a
              validated exposure protocol.
            </div>
          </section>

          <form className="panel start-panel" onSubmit={startStudy}>
            <p className="eyebrow">Start a demonstration</p>
            <h2>DIY-MOD transformation seed set</h2>
            <p>
              Choose every category relevant to you. Categories you do not select
              will not appear in your session.
            </p>

            <label className="input-field">
              <span>Participant or demo code</span>
              <input
                value={participantCode}
                onChange={(event) => setParticipantCode(event.target.value)}
                placeholder="For example: demo-001"
                maxLength={40}
                autoComplete="off"
                required
              />
              <small>Use a study code, not a name or email address.</small>
            </label>

            <fieldset className="case-picker">
              <legend>Which kinds of imagery do you find distressing?</legend>
              <p>Select all that apply.</p>
              <div className="case-options">
                {dataset.cases.map((caseItem) => {
                  const isSelected = selectedCaseIds.includes(caseItem.id);
                  const stimulusCount = dataset.stimuli.filter(
                    (stimulus) => stimulus.caseId === caseItem.id
                  ).length;

                  return (
                    <label
                      className={isSelected ? "case-option selected" : "case-option"}
                      key={caseItem.id}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCase(caseItem.id)}
                      />
                      <span>
                        <strong>{caseItem.label}</strong>
                        <small>{stimulusCount} available transformations</small>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <dl className="dataset-summary">
              <div>
                <dt>Selected</dt>
                <dd>{selectedStimulusCount} images</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{dataset.provenance}</dd>
              </div>
              <div>
                <dt>Available</dt>
                <dd>{dataset.cases.length} categories</dd>
              </div>
            </dl>

            <button
              className="button primary"
              type="submit"
              disabled={!participantCode.trim() || selectedCaseIds.length === 0}
            >
              {selectedStimulusCount > 0
                ? `Begin ${selectedStimulusCount}-image session`
                : "Select at least one category"}
            </button>
          </form>

          <details className="panel dataset-notes">
            <summary>Seed dataset limitations</summary>
            <ul>
              {dataset.limitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </details>
        </main>
      </>
    );
  }

  if (phase === "complete") {
    const skippedCount = responses.filter((response) => response.skipped).length;
    const distressMean = mean(responses, "distress");
    const willingnessMean = mean(responses, "willingness");

    return (
      <main className="shell completion-shell">
        <section className="panel completion-panel">
          <p className="eyebrow">Session summary</p>
          <h1>{finishReason === "completed" ? "Demonstration complete" : "Session ended"}</h1>
          <p>
            No responses were sent to a server. Download the JSON file to retain this
            session.
          </p>

          <div className="summary-cards">
            <div>
              <strong>{responses.length}</strong>
              <span>Recorded</span>
            </div>
            <div>
              <strong>{skippedCount}</strong>
              <span>Skipped</span>
            </div>
            <div>
              <strong>{distressMean === null ? "-" : distressMean.toFixed(1)}</strong>
              <span>Mean distress</span>
            </div>
            <div>
              <strong>{willingnessMean === null ? "-" : willingnessMean.toFixed(1)}</strong>
              <span>Mean willingness</span>
            </div>
          </div>

          <div className="button-row">
            <button className="button primary" type="button" onClick={downloadResults}>
              Download JSON
            </button>
            <button className="button secondary" type="button" onClick={restart}>
              Start another session
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <header className="study-header">
        <div className="progress-copy">
          <span>
            Image {trialIndex + 1} of {trials.length}
          </span>
          <div className="progress-track" aria-hidden="true">
            <div
              className="progress-value"
              style={{ width: `${(trialIndex / trials.length) * 100}%` }}
            />
          </div>
        </div>
        <button className="button quiet-danger" type="button" onClick={endEarly}>
          End session
        </button>
      </header>

      <main className="shell study-grid">
        <section className="panel stimulus-panel">
          <div className="condition-heading">
            <div>
              <p className="eyebrow">{currentTrial.axis}</p>
              <h1>{currentTrial.transformation}</h1>
            </div>
            <span className="condition-badge">
              {currentTrial.parameterization === null
                ? "Categorical example"
                : currentTrial.parameterization}
            </span>
          </div>

          <figure>
            <img src={currentTrial.image} alt={`${currentTrial.transformation} example`} />
            <figcaption>
              <strong>{currentCase.label}:</strong> {currentCase.filterContext}
            </figcaption>
          </figure>
        </section>

        <section className="panel ratings-panel">
          <div>
            <p className="eyebrow">Your response</p>
            <h2>Rate this image</h2>
            <p className="muted">Select one number for each question.</p>
          </div>

          {RATING_FIELDS.map((field) => (
            <RatingScale
              key={field.key}
              field={field}
              value={ratings[field.key]}
              onChange={(value) =>
                setRatings((current) => ({ ...current, [field.key]: value }))
              }
            />
          ))}

          <div className="button-row split">
            <button
              className="button secondary"
              type="button"
              onClick={() => recordTrial(true)}
            >
              Skip image
            </button>
            <button
              className="button primary"
              type="button"
              disabled={!allRatingsSelected}
              onClick={() => recordTrial(false)}
            >
              Save and continue
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
