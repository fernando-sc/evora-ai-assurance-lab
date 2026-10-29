import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveRiskProfile,
  computeSimulationMetrics,
  evaluateSaiaClaim,
  INITIAL_RAG_CLAIMS,
  CHANGE_SIGNALS,
} from './evoraModel';

test('deriveRiskProfile maps consequence scores to lower, intermediate, and high profiles (Figure B)', () => {
  const lower = deriveRiskProfile(20);
  assert.equal(lower.tier, 'lower');
  assert.equal(lower.requiresIndependentReviewer, false);
  assert.equal(lower.validityWindowDays, 180);

  const intermediate = deriveRiskProfile(50);
  assert.equal(intermediate.tier, 'intermediate');
  assert.equal(intermediate.requiresIndependentReviewer, true);
  assert.equal(intermediate.validityWindowDays, 90);

  const high = deriveRiskProfile(85);
  assert.equal(high.tier, 'high');
  assert.equal(high.requiresIndependentReviewer, true);
  assert.equal(high.restrictsProgressionOnGap, true);
  assert.equal(high.validityWindowDays, 30);
});

test('computeSimulationMetrics demonstrates effort reduction via evidence reuse and selective revalidation', () => {
  const metrics = computeSimulationMetrics({
    consequenceScore: 75,
    activeFrameworks: 4,
    evidenceReuseRate: 70,
    annualChangeEvents: 8,
    totalClaims: 12,
    changeBlastRadius: 30,
    sufficiencyThreshold: 85,
  });

  assert.equal(metrics.riskProfile.tier, 'high');
  assert.equal(metrics.frameworkSeries.length, 7);
  assert.equal(metrics.monthlySeries.length, 12);
  assert.ok(
    metrics.annualEvoraHours < metrics.annualBlanketHours,
    'EVORA selective revalidation should require fewer hours than blanket revalidation'
  );
  assert.ok(
    metrics.annualBlanketHours < metrics.annualManualHours,
    'Shared record should require fewer hours than duplicate manual per-framework processes'
  );
  assert.equal(metrics.selectivePreservationPct, 70);
});

test('evaluateSaiaClaim enforces EVORA-AI Minimum Assurance Contract invariants (Section III.B & IV)', () => {
  const highRiskProfile = deriveRiskProfile(85);
  const steadySignal = CHANGE_SIGNALS[0]; // 'none'

  // Claim 1 starts in the paper's unexecuted "Not assessed / pending evidence" state
  const unexecutedClaim = INITIAL_RAG_CLAIMS[0];
  const res1 = evaluateSaiaClaim(unexecutedClaim, highRiskProfile, 85, steadySignal);
  assert.equal(res1.state, 'Not assessed / pending evidence');
  assert.equal(res1.canPromoteToAccepted, false);
  assert.ok(res1.blockingReasons.length > 0);

  // Claim 2 has valid evidence and accountable reviewer authorization
  const validClaim = INITIAL_RAG_CLAIMS[1];
  const res2 = evaluateSaiaClaim(validClaim, highRiskProfile, 85, steadySignal);
  assert.equal(res2.state, 'Accepted by accountable reviewer');
  assert.equal(res2.canPromoteToAccepted, true);

  // Triggering a model update invalidates Claim 2 (depends on model_weights) but NOT Claim 3 (depends only on retrieval_index)
  const modelUpdateSignal = CHANGE_SIGNALS.find((s) => s.id === 'model_update')!;
  const res2AfterModelUpdate = evaluateSaiaClaim(
    { ...validClaim, versionBoundMatch: false },
    highRiskProfile,
    85,
    modelUpdateSignal
  );
  assert.equal(res2AfterModelUpdate.affectedBySignal, true);
  assert.equal(res2AfterModelUpdate.state, 'Reopened / stale binding');
  assert.equal(res2AfterModelUpdate.canPromoteToAccepted, false);

  const corpusClaim = INITIAL_RAG_CLAIMS[2];
  const res3AfterModelUpdate = evaluateSaiaClaim(corpusClaim, highRiskProfile, 85, modelUpdateSignal);
  assert.equal(res3AfterModelUpdate.affectedBySignal, false);
  assert.equal(res3AfterModelUpdate.state, 'Accepted by accountable reviewer');
});
