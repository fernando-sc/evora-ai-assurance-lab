/**
 * Core pure domain model, mathematical simulation engine, selective revalidation
 * dependency resolver, and SAIA contract validator for EVORA-AI (v6 draft).
 */

export type ImpactTier = 'lower' | 'intermediate' | 'high';

export interface SimulationParams {
  /** Public consequence & rights impact score (0 to 100) */
  consequenceScore: number;
  /** Number of concurrent external governance instruments mapped (1 to 7) */
  activeFrameworks: number;
  /** Preferential engineering evidence reuse ratio (0 to 100%) */
  evidenceReuseRate: number;
  /** Annual system/data/policy change events per year (1 to 24) */
  annualChangeEvents: number;
  /** Total assessable claims in the system (4 to 30) */
  totalClaims: number;
  /** Average dependency coupling per change event (10% to 100%) */
  changeBlastRadius: number;
  /** Sufficiency threshold required by profile (50% to 99%) */
  sufficiencyThreshold: number;
}

export interface RiskProfileDimensions {
  tier: ImpactTier;
  tierLabel: string;
  reviewModel: string;
  evidenceRigor: number;
  reviewerIndependence: number;
  separationOfDuties: number;
  temporalStrictness: number;
  humanOversightIntensity: number;
  deploymentGateStrictness: number;
  validityWindowDays: number;
  requiresIndependentReviewer: boolean;
  restrictsProgressionOnGap: boolean;
}

export interface EffortComparisonPoint {
  frameworks: number;
  manualDuplicateHours: number;
  blanketRevalidationHours: number;
  evoraSelectiveHours: number;
  savedHoursPct: number;
}

export interface MonthlyTimelinePoint {
  month: number;
  monthLabel: string;
  manualCumulativeHours: number;
  blanketCumulativeHours: number;
  evoraCumulativeHours: number;
  staleRecordsDetected: number;
  untouchedValidClaimsPct: number;
}

export interface SimulationMetricsSummary {
  riskProfile: RiskProfileDimensions;
  annualManualHours: number;
  annualBlanketHours: number;
  annualEvoraHours: number;
  hoursReductionPct: number;
  selectivePreservationPct: number;
  reconstructabilityScore: number;
  expectedReviewerAgreementPct: number;
  decisionLatencyHours: number;
  frameworkSeries: EffortComparisonPoint[];
  monthlySeries: MonthlyTimelinePoint[];
}

export type ChangeSignalId =
  | 'none'
  | 'model_update'
  | 'corpus_permissions'
  | 'purpose_obligation'
  | 'drift_incident'
  | 'routine_ci_pass';

export interface ChangeSignalSpec {
  id: ChangeSignalId;
  label: string;
  category: 'New model or data version' | 'Changed purpose or obligation' | 'Drift, incident or changed control' | 'Routine engineering artifact';
  description: string;
  affectedComponents: string[];
  requiresHumanDecision: boolean;
  triggerSource: string;
}

export interface RagSaiaClaim {
  id: string;
  title: string;
  threatCategory: 'Privacy & Access Control (Paper Table)' | 'Prompt Injection Defense' | 'Corpus Poisoning Integrity' | 'Groundedness & Hallucination' | 'Vendor & Model Dependency';
  externalRequirement: {
    guia: string;
    euAiAct: string;
    nistRmf: string;
    canadaAia: string;
  };
  claimAssertion: string;
  control: string;
  evidenceReference: string;
  sufficiencyCriterion: string;
  subjectBinding: {
    serviceRelease: string;
    retrievalIndex: string;
    accessPolicy: string;
    modelVersion: string;
  };
  dependencies: string[];
  revalidationTriggers: string[];
  /** Interactive simulation inputs for this claim */
  testCoveragePct: number;
  criticalDisclosures: number;
  evidenceAgeDays: number;
  versionBoundMatch: boolean;
  evidencePresent: boolean;
  reviewerDistinctFromProducer: boolean;
  humanReviewerAuthorized: boolean;
  humanRationale: string;
}

export type ClaimDecisionState =
  | 'Not assessed / pending evidence'
  | 'Reopened / stale binding'
  | 'Blocked: sufficiency or invariant unmet'
  | 'Ready for accountable human review'
  | 'Accepted by accountable reviewer'
  | 'Logged routine update within rule';

export interface EvaluatedClaimResult {
  claim: RagSaiaClaim;
  state: ClaimDecisionState;
  affectedBySignal: boolean;
  invariants: {
    hasIdentifiableEvidence: boolean;
    meetsSufficiencyCriterion: boolean;
    versionBindingValid: boolean;
    temporalValidityMet: boolean;
    reviewerIndependenceMet: boolean;
    humanAuthorityIdentified: boolean;
  };
  allTechnicalInvariantsMet: boolean;
  canPromoteToAccepted: boolean;
  blockingReasons: string[];
}

export interface GovernanceEnvironmentSpec {
  id: string;
  name: string;
  jurisdiction: string;
  primaryInstrument: string;
  normativeStrength: number; // 0-100
  operationalMethodScore: number; // 0-100
  technicalBindingScore: number; // 0-100
  riskClassificationModel: string;
  evoraAdapterRole: string;
}

export interface AssuranceApproachSpec {
  id: string;
  name: string;
  category: 'Argument Notation' | 'ML Assurance Method' | 'Risk Standard' | 'Evidence-as-Code / Ops';
  claimSemantics: number; // 0-100
  versionProvenance: number; // 0-100
  selectiveRevalidation: number; // 0-100
  lowAdminOverhead: number; // 0-100
  publicLawProportionality: number; // 0-100
  gapAddressedByEvora: string;
}

/**
 * Maps a continuous consequence score (0-100) to the paper's Figure B
 * Risk-Adaptive Assurance Profile.
 */
export function deriveRiskProfile(consequenceScore: number): RiskProfileDimensions {
  const clamped = Math.max(0, Math.min(100, consequenceScore));

  if (clamped < 35) {
    return {
      tier: 'lower',
      tierLabel: 'Lower Impact Profile',
      reviewModel: 'Baseline evidence and proportional peer review',
      evidenceRigor: Math.round(35 + clamped * 0.6),
      reviewerIndependence: Math.round(30 + clamped * 0.5),
      separationOfDuties: Math.round(25 + clamped * 0.6),
      temporalStrictness: Math.round(40 + clamped * 0.5),
      humanOversightIntensity: Math.round(35 + clamped * 0.6),
      deploymentGateStrictness: Math.round(40 + clamped * 0.6),
      validityWindowDays: 180,
      requiresIndependentReviewer: false,
      restrictsProgressionOnGap: false,
    };
  }

  if (clamped < 70) {
    return {
      tier: 'intermediate',
      tierLabel: 'Intermediate Impact Profile',
      reviewModel: 'Extended coverage and cross-functional review',
      evidenceRigor: Math.round(58 + (clamped - 35) * 0.65),
      reviewerIndependence: Math.round(55 + (clamped - 35) * 0.7),
      separationOfDuties: Math.round(52 + (clamped - 35) * 0.7),
      temporalStrictness: Math.round(62 + (clamped - 35) * 0.6),
      humanOversightIntensity: Math.round(60 + (clamped - 35) * 0.65),
      deploymentGateStrictness: Math.round(65 + (clamped - 35) * 0.65),
      validityWindowDays: 90,
      requiresIndependentReviewer: true,
      restrictsProgressionOnGap: true,
    };
  }

  return {
    tier: 'high',
    tierLabel: 'High / Critical Impact Profile',
    reviewModel: 'Stronger criteria, separation of duties, and independent review',
    evidenceRigor: Math.round(82 + (clamped - 70) * 0.6),
    reviewerIndependence: Math.round(84 + (clamped - 70) * 0.53),
    separationOfDuties: Math.round(85 + (clamped - 70) * 0.5),
    temporalStrictness: Math.round(84 + (clamped - 70) * 0.53),
    humanOversightIntensity: Math.round(86 + (clamped - 70) * 0.46),
    deploymentGateStrictness: Math.round(88 + (clamped - 70) * 0.4),
    validityWindowDays: 30,
    requiresIndependentReviewer: true,
    restrictsProgressionOnGap: true,
  };
}

/**
 * Computes real-time simulation metrics and chart series based on slider parameters.
 * Demonstrates the paper's core research question: binding heterogeneous public-sector
 * requirements to verifiable technical evidence while keeping assurance proportional
 * to risk and minimizing duplicate manual documentation.
 */
export function computeSimulationMetrics(params: SimulationParams): SimulationMetricsSummary {
  const riskProfile = deriveRiskProfile(params.consequenceScore);
  const reuseRatio = Math.max(0, Math.min(100, params.evidenceReuseRate)) / 100;
  const blastRatio = Math.max(5, Math.min(100, params.changeBlastRadius)) / 100;
  const riskMultiplier =
    riskProfile.tier === 'lower' ? 1.0 : riskProfile.tier === 'intermediate' ? 1.35 : 1.75;

  // Base hours per claim for initial manual documentation vs automated harvest
  const baseHoursPerClaim = 4.2 * riskMultiplier;
  const revalidationHoursPerClaim = 2.1 * riskMultiplier;

  const calculateForFrameworks = (fwCount: number): EffortComparisonPoint => {
    // Manual process: each governance instrument generates a separate manual documentation process
    const initialManual = params.totalClaims * baseHoursPerClaim * fwCount;
    const changeManual =
      params.annualChangeEvents * params.totalClaims * revalidationHoursPerClaim * fwCount * 0.85;
    const manualDuplicateHours = Math.round(initialManual + changeManual);

    // Blanket revalidation with shared record but no selective dependency tracking or artifact reuse
    const initialShared = params.totalClaims * baseHoursPerClaim * (1 + (fwCount - 1) * 0.22);
    const changeBlanket =
      params.annualChangeEvents * params.totalClaims * revalidationHoursPerClaim * (1 + (fwCount - 1) * 0.15);
    const blanketRevalidationHours = Math.round(initialShared + changeBlanket);

    // EVORA-AI: shared SAIA binding + preferential evidence reuse + selective revalidation only on affected claims
    const effectiveInitialPerClaim = baseHoursPerClaim * (1 - reuseRatio * 0.72);
    const adapterMappingOverhead = (fwCount - 1) * 0.08 * baseHoursPerClaim;
    const initialEvora = params.totalClaims * (effectiveInitialPerClaim + adapterMappingOverhead);

    // Only claims in the dependency blast radius are reopened, and automated evidence harvest reduces manual effort
    const effectiveRevalPerClaim = revalidationHoursPerClaim * (1 - reuseRatio * 0.68);
    const changeEvora =
      params.annualChangeEvents *
      (params.totalClaims * blastRatio) *
      effectiveRevalPerClaim *
      (1 + (fwCount - 1) * 0.05);

    const evoraSelectiveHours = Math.max(4, Math.round(initialEvora + changeEvora));
    const savedHoursPct =
      manualDuplicateHours > 0
        ? Math.round(((manualDuplicateHours - evoraSelectiveHours) / manualDuplicateHours) * 100)
        : 0;

    return {
      frameworks: fwCount,
      manualDuplicateHours,
      blanketRevalidationHours,
      evoraSelectiveHours,
      savedHoursPct,
    };
  };

  const frameworkSeries: EffortComparisonPoint[] = [];
  for (let fw = 1; fw <= 7; fw++) {
    frameworkSeries.push(calculateForFrameworks(fw));
  }

  const activePoint = calculateForFrameworks(params.activeFrameworks);

  // 12-Month cumulative timeline series
  const monthlySeries: MonthlyTimelinePoint[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const initialManual =
    params.totalClaims * baseHoursPerClaim * params.activeFrameworks;
  const initialBlanket =
    params.totalClaims * baseHoursPerClaim * (1 + (params.activeFrameworks - 1) * 0.22);
  const initialEvora =
    params.totalClaims *
    baseHoursPerClaim *
    (1 - reuseRatio * 0.72 + (params.activeFrameworks - 1) * 0.08);

  const monthlyManualDelta = (activePoint.manualDuplicateHours - initialManual) / 12;
  const monthlyBlanketDelta = (activePoint.blanketRevalidationHours - initialBlanket) / 12;
  const monthlyEvoraDelta = (activePoint.evoraSelectiveHours - initialEvora) / 12;

  for (let m = 1; m <= 12; m++) {
    const eventsSoFar = (params.annualChangeEvents * m) / 12;
    const staleDetected = Math.round(eventsSoFar * params.totalClaims * blastRatio);
    monthlySeries.push({
      month: m,
      monthLabel: monthNames[m - 1],
      manualCumulativeHours: Math.round(initialManual + monthlyManualDelta * m),
      blanketCumulativeHours: Math.round(initialBlanket + monthlyBlanketDelta * m),
      evoraCumulativeHours: Math.round(initialEvora + monthlyEvoraDelta * m),
      staleRecordsDetected: staleDetected,
      untouchedValidClaimsPct: Math.round((1 - blastRatio) * 100),
    });
  }

  const selectivePreservationPct = Math.round((1 - blastRatio) * 100);
  const reconstructabilityScore = Math.min(
    99,
    Math.round(58 + reuseRatio * 28 + (params.sufficiencyThreshold - 50) * 0.28)
  );
  const expectedReviewerAgreementPct = Math.min(
    98,
    Math.round(62 + (params.sufficiencyThreshold - 50) * 0.45 + reuseRatio * 14)
  );
  const decisionLatencyHours = Number(
    Math.max(1.2, (18 * riskMultiplier * (1 - reuseRatio * 0.55) * blastRatio).toFixed(1))
  );

  return {
    riskProfile,
    annualManualHours: activePoint.manualDuplicateHours,
    annualBlanketHours: activePoint.blanketRevalidationHours,
    annualEvoraHours: activePoint.evoraSelectiveHours,
    hoursReductionPct: activePoint.savedHoursPct,
    selectivePreservationPct,
    reconstructabilityScore,
    expectedReviewerAgreementPct,
    decisionLatencyHours,
    frameworkSeries,
    monthlySeries,
  };
}

/**
 * Evaluates a SAIA claim against the Minimum Assurance Contract invariants (Section III.B)
 * and Selective Revalidation rules (Section III.D & Figure C).
 */
export function evaluateSaiaClaim(
  claim: RagSaiaClaim,
  riskProfile: RiskProfileDimensions,
  sufficiencyThreshold: number,
  activeSignal: ChangeSignalSpec
): EvaluatedClaimResult {
  const affectedBySignal =
    activeSignal.id !== 'none' &&
    activeSignal.affectedComponents.some((comp) => claim.dependencies.includes(comp));

  const hasIdentifiableEvidence = claim.evidencePresent && claim.evidenceReference.trim().length > 0;
  const meetsSufficiencyCriterion =
    claim.testCoveragePct >= sufficiencyThreshold && claim.criticalDisclosures === 0;
  const versionBindingValid = claim.versionBoundMatch && (!affectedBySignal || activeSignal.id === 'routine_ci_pass');
  const temporalValidityMet = claim.evidenceAgeDays <= riskProfile.validityWindowDays;
  const reviewerIndependenceMet = riskProfile.requiresIndependentReviewer
    ? claim.reviewerDistinctFromProducer
    : true;
  const humanAuthorityIdentified =
    claim.humanReviewerAuthorized && claim.humanRationale.trim().length >= 8;

  const allTechnicalInvariantsMet =
    hasIdentifiableEvidence &&
    meetsSufficiencyCriterion &&
    versionBindingValid &&
    temporalValidityMet &&
    reviewerIndependenceMet;

  const blockingReasons: string[] = [];

  if (!hasIdentifiableEvidence) {
    blockingReasons.push('Missing identifiable supporting evidence artifact (Paper Invariant 1).');
  }
  if (!meetsSufficiencyCriterion) {
    if (claim.testCoveragePct < sufficiencyThreshold) {
      blockingReasons.push(
        `Test suite coverage (${claim.testCoveragePct}%) is below sufficiency criterion (${sufficiencyThreshold}%).`
      );
    }
    if (claim.criticalDisclosures > 0) {
      blockingReasons.push(
        `${claim.criticalDisclosures} unresolved critical unauthorized disclosure(s) within tested scope.`
      );
    }
  }
  if (!versionBindingValid) {
    blockingReasons.push(
      `Material change (${activeSignal.label}) invalidated version binding; requires refreshed evidence.`
    );
  }
  if (!temporalValidityMet) {
    blockingReasons.push(
      `Evidence age (${claim.evidenceAgeDays}d) exceeds ${riskProfile.tierLabel} validity window (${riskProfile.validityWindowDays}d).`
    );
  }
  if (!reviewerIndependenceMet) {
    blockingReasons.push(
      `${riskProfile.tierLabel} requires reviewer distinct from test producer (separation of duties).`
    );
  }

  let state: ClaimDecisionState;

  if (!claim.evidencePresent) {
    state = 'Not assessed / pending evidence';
  } else if (affectedBySignal && activeSignal.id === 'routine_ci_pass' && allTechnicalInvariantsMet) {
    state = 'Logged routine update within rule';
  } else if (affectedBySignal && activeSignal.requiresHumanDecision && !claim.versionBoundMatch) {
    state = 'Reopened / stale binding';
  } else if (!allTechnicalInvariantsMet) {
    state = 'Blocked: sufficiency or invariant unmet';
  } else if (!humanAuthorityIdentified) {
    state = 'Ready for accountable human review';
    blockingReasons.push(
      'Awaiting accountable human reviewer authorization and rationale (automation cannot self-approve).'
    );
  } else {
    state = 'Accepted by accountable reviewer';
  }

  return {
    claim,
    state,
    affectedBySignal,
    invariants: {
      hasIdentifiableEvidence,
      meetsSufficiencyCriterion,
      versionBindingValid,
      temporalValidityMet,
      reviewerIndependenceMet,
      humanAuthorityIdentified,
    },
    allTechnicalInvariantsMet,
    canPromoteToAccepted: allTechnicalInvariantsMet && humanAuthorityIdentified,
    blockingReasons,
  };
}

export const CHANGE_SIGNALS: ChangeSignalSpec[] = [
  {
    id: 'none',
    label: 'Baseline Steady State (No Active Change Signal)',
    category: 'Routine engineering artifact',
    description: 'All version bindings reflect the baseline RAG system configuration.',
    affectedComponents: [],
    requiresHumanDecision: false,
    triggerSource: 'None',
  },
  {
    id: 'model_update',
    label: 'Model Update (LLM v2.1 -> v2.2 Weights)',
    category: 'New model or data version',
    description:
      'Foundation model weights updated in Model Registry. Reopens claims dependent on model behavior (Access Behavior, Prompt Injection, Groundedness) while leaving Corpus Integrity valid.',
    affectedComponents: ['model_weights', 'prompt_router'],
    requiresHumanDecision: true,
    triggerSource: 'Model Registry / MLOps',
  },
  {
    id: 'corpus_permissions',
    label: 'Retrieval Corpus Permissions & ACL Change',
    category: 'Drift, incident or changed control',
    description:
      'Document classification index updated with new citizen tax & benefit records. Reopens Privacy/Access Control and Corpus Poisoning claims only.',
    affectedComponents: ['retrieval_index', 'access_policy'],
    requiresHumanDecision: true,
    triggerSource: 'Data Inventory / IAM Policy',
  },
  {
    id: 'purpose_obligation',
    label: 'Revised Policy Obligation (GuIA / EU AI Act High-Impact Rule)',
    category: 'Changed purpose or obligation',
    description:
      'Agency expands RAG assistant from informational FAQ to benefit eligibility pre-screening. Reopens external obligation bindings across consequential claims.',
    affectedComponents: ['access_policy', 'groundedness_eval', 'vendor_sla'],
    requiresHumanDecision: true,
    triggerSource: 'Governance Adapter (GuIA / Legal)',
  },
  {
    id: 'drift_incident',
    label: 'Security Alert: Adversarial Prompt Bypass Incident',
    category: 'Drift, incident or changed control',
    description:
      'Monitoring detects anomalous role-escalation query pattern in production logs. Selectively invalidates Access Control and Prompt Injection bindings.',
    affectedComponents: ['access_policy', 'prompt_router'],
    requiresHumanDecision: true,
    triggerSource: 'Security / Incident Monitoring',
  },
  {
    id: 'routine_ci_pass',
    label: 'Routine Nightly Regression Suite Re-Run (Same Config)',
    category: 'Routine engineering artifact',
    description:
      'Automated CI/CD test log refreshed within authorized rule with zero configuration change. Logged automatically in SAIA without demanding full human re-authorization.',
    affectedComponents: ['retrieval_index'],
    requiresHumanDecision: false,
    triggerSource: 'Code / CI-CD / Tests',
  },
];

export const INITIAL_RAG_CLAIMS: RagSaiaClaim[] = [
  {
    id: 'SAIA-RAG-01',
    title: 'Authorized Document Retrieval & Role Isolation (Paper Section IV)',
    threatCategory: 'Privacy & Access Control (Paper Table)',
    externalRequirement: {
      guia: 'Brazilian GuIA / MGI Privacy & Access Verification Item (v2025.2)',
      euAiAct: 'EU AI Act Art. 10 & Art. 15 (Data Governance & Security)',
      nistRmf: 'NIST AI RMF MANAGE 2.2 & MAP 3.4 (Access & Privacy Controls)',
      canadaAia: 'Canadian AIA Sec. 4.2 (Data Access & Procedural Safeguards)',
    },
    claimAssertion:
      'RAG retrieval and generated answers do not expose documents to unauthorized requester roles within the defined test scope.',
    control:
      'Role-based retrieval authorization; document classification and access restrictions; adversarial regression tests.',
    evidenceReference:
      'Pending: access-control test report, version-bound evaluation logs and access policy snapshot',
    sufficiencyCriterion:
      'Approved test suite covers defined authorization scenarios; no unresolved critical unauthorized disclosure within that tested scope.',
    subjectBinding: {
      serviceRelease: 'rag-citizen-svc@v1.4.0',
      retrievalIndex: 'idx-public-benefits-v2026.09',
      accessPolicy: 'opa-rbac-policy@sha256:8f3c',
      modelVersion: 'gov-instruct-70b@v2.1',
    },
    dependencies: ['retrieval_index', 'access_policy', 'model_weights'],
    revalidationTriggers: [
      'Retrieval corpus permissions change',
      'Model/tool change affecting access behavior',
      'New purpose or disclosure incident',
    ],
    // Starts in the exact "Not assessed / pending evidence" state described in Section IV Table!
    testCoveragePct: 78,
    criticalDisclosures: 1,
    evidenceAgeDays: 14,
    versionBoundMatch: true,
    evidencePresent: false,
    reviewerDistinctFromProducer: true,
    humanReviewerAuthorized: false,
    humanRationale: '',
  },
  {
    id: 'SAIA-RAG-02',
    title: 'Indirect Prompt Injection & Guardrail Integrity',
    threatCategory: 'Prompt Injection Defense',
    externalRequirement: {
      guia: 'GuIA Security Resilience & Adversarial Testing Control (SR-04)',
      euAiAct: 'EU AI Act Art. 15(4) (Resilience against unauthorized manipulation)',
      nistRmf: 'NIST AI RMF MEASURE 2.7 (AI System Security & Resilience)',
      canadaAia: 'Canadian AIA Sec. 5.1 (Cybersecurity & System Integrity)',
    },
    claimAssertion:
      'System instructions and role boundaries remain intact when processing untrusted citizen queries or embedded document directives.',
    control:
      'Context-delimiter sandboxing; input/output classifier filter; red-team adversarial prompt regression suite.',
    evidenceReference: 'ci-artifact://redteam-eval-2026-10-18/report-v1.4.0.json',
    sufficiencyCriterion:
      'Adversarial regression suite achieves >= 90% coverage across OWASP LLM01 vectors with zero critical jailbreaks.',
    subjectBinding: {
      serviceRelease: 'rag-citizen-svc@v1.4.0',
      retrievalIndex: 'idx-public-benefits-v2026.09',
      accessPolicy: 'guardrail-policy@v3.1',
      modelVersion: 'gov-instruct-70b@v2.1',
    },
    dependencies: ['prompt_router', 'model_weights'],
    revalidationTriggers: [
      'Model version update',
      'Prompt router template modification',
      'Detected adversarial bypass incident',
    ],
    testCoveragePct: 94,
    criticalDisclosures: 0,
    evidenceAgeDays: 12,
    versionBoundMatch: true,
    evidencePresent: true,
    reviewerDistinctFromProducer: true,
    humanReviewerAuthorized: true,
    humanRationale: 'Verified red-team suite logs for v1.4.0; approved by Lead Security Architect.',
  },
  {
    id: 'SAIA-RAG-03',
    title: 'Institutional Corpus Provenance & Anti-Poisoning',
    threatCategory: 'Corpus Poisoning Integrity',
    externalRequirement: {
      guia: 'GuIA Data Provenance & Integrity Inventory (DP-02)',
      euAiAct: 'EU AI Act Art. 10(3) (Data completeness, representativeness & integrity)',
      nistRmf: 'NIST AI RMF MAP 2.3 (Scientific Integrity & Data Provenance)',
      canadaAia: 'Canadian AIA Sec. 3.4 (Source Data Provenance)',
    },
    claimAssertion:
      'All indexed statutory documents and citizen guides match cryptographically signed official gazette hashes.',
    control:
      'Cryptographic manifest verification during ingestion pipeline; immutable vector index snapshot signing.',
    evidenceReference: 'mlops-registry://corpus-manifest-v2026.09.sig',
    sufficiencyCriterion:
      '100% of indexed chunks trace to signed institutional documents; zero unsigned ingestion anomalies.',
    subjectBinding: {
      serviceRelease: 'rag-citizen-svc@v1.4.0',
      retrievalIndex: 'idx-public-benefits-v2026.09',
      accessPolicy: 'ingest-verify@v2.0',
      modelVersion: 'embed-multilingual@v1.2',
    },
    dependencies: ['retrieval_index'],
    revalidationTriggers: ['Retrieval corpus re-indexing', 'Ingestion pipeline modification'],
    testCoveragePct: 98,
    criticalDisclosures: 0,
    evidenceAgeDays: 19,
    versionBoundMatch: true,
    evidencePresent: true,
    reviewerDistinctFromProducer: true,
    humanReviewerAuthorized: true,
    humanRationale: 'Signed ingestion manifest verified by Data Governance Officer.',
  },
  {
    id: 'SAIA-RAG-04',
    title: 'Statutory Citation Groundedness & Hallucination Bound',
    threatCategory: 'Groundedness & Hallucination',
    externalRequirement: {
      guia: 'GuIA Transparency & Administrative Reliability Item (TR-03)',
      euAiAct: 'EU AI Act Art. 13 & Art. 15 (Accuracy & Transparency to Citizens)',
      nistRmf: 'NIST AI RMF MEASURE 2.5 (Validity & Reliability)',
      canadaAia: 'Canadian AIA Sec. 4.1 (Administrative Fairness & Explainability)',
    },
    claimAssertion:
      'Generated citizen responses cite verifiable statutory clauses and abstain when retrieval confidence falls below threshold.',
    control:
      'Strict citation-enforcement decoding; confidence abstention threshold; gold-standard civil-servant QA benchmark.',
    evidenceReference: 'eval-suite://citizen-qa-groundedness-v1.4.0.parquet',
    sufficiencyCriterion:
      'Faithfulness score >= 92% on 500-item audited public-service benchmark with zero fabricated benefit rules.',
    subjectBinding: {
      serviceRelease: 'rag-citizen-svc@v1.4.0',
      retrievalIndex: 'idx-public-benefits-v2026.09',
      accessPolicy: 'abstention-gate@v1.1',
      modelVersion: 'gov-instruct-70b@v2.1',
    },
    dependencies: ['model_weights', 'groundedness_eval'],
    revalidationTriggers: [
      'Model update',
      'Changed intended purpose (e.g. eligibility decisions)',
      'Abstention threshold change',
    ],
    testCoveragePct: 93,
    criticalDisclosures: 0,
    evidenceAgeDays: 15,
    versionBoundMatch: true,
    evidencePresent: true,
    reviewerDistinctFromProducer: true,
    humanReviewerAuthorized: true,
    humanRationale: 'Benchmark faithfulness verified by Ombudsperson Quality Review Panel.',
  },
  {
    id: 'SAIA-RAG-05',
    title: 'External Model Provider Isolation & Sovereign Fallback',
    threatCategory: 'Vendor & Model Dependency',
    externalRequirement: {
      guia: 'GuIA Public Procurement & Sovereign Operations (PO-06)',
      euAiAct: 'EU AI Act Art. 25 (Value Chain Responsibilities)',
      nistRmf: 'NIST AI RMF GOVERN 6.1 (Third-Party Risk Management)',
      canadaAia: 'Canadian AIA Sec. 6.2 (Operational Continuity)',
    },
    claimAssertion:
      'Citizen PII never traverses external commercial endpoints and service degrades gracefully on provider outage.',
    control:
      'On-premise VPC egress firewall; PII redaction gateway; circuit-breaker fallback to deterministic search.',
    evidenceReference: 'sec-audit://vpc-egress-verification-2026Q3.log',
    sufficiencyCriterion:
      'Zero external network egress packets in chaos test; fallback latency < 400ms.',
    subjectBinding: {
      serviceRelease: 'rag-citizen-svc@v1.4.0',
      retrievalIndex: 'idx-public-benefits-v2026.09',
      accessPolicy: 'vpc-egress-deny@v4.0',
      modelVersion: 'gov-instruct-70b@v2.1',
    },
    dependencies: ['vendor_sla'],
    revalidationTriggers: ['Procurement or vendor SLA change', 'Network architecture update'],
    testCoveragePct: 96,
    criticalDisclosures: 0,
    evidenceAgeDays: 22,
    versionBoundMatch: true,
    evidencePresent: true,
    reviewerDistinctFromProducer: true,
    humanReviewerAuthorized: true,
    humanRationale: 'Approved by Public Cloud Infrastructure Compliance Lead.',
  },
];

export const GOVERNANCE_ENVIRONMENTS: GovernanceEnvironmentSpec[] = [
  {
    id: 'guia_br',
    name: 'Brazil GuIA / MGI Ecosystem',
    jurisdiction: 'Brazil (Federal Public Administration)',
    primaryInstrument: 'GuIA / AIE / Ficha Técnica (MGI)',
    normativeStrength: 88,
    operationalMethodScore: 84,
    technicalBindingScore: 42,
    riskClassificationModel: 'Contextual impact assessment (AIE) + lifecycle phase gates',
    evoraAdapterRole:
      'Maps GuIA phase-level privacy/fairness/transparency items directly to versioned CI/CD & MLOps artifacts via SAIA.',
  },
  {
    id: 'eu_ai_act',
    name: 'European Union AI Act',
    jurisdiction: 'European Union',
    primaryInstrument: 'Regulation (EU) 2024/1689 (High-Risk Annex III)',
    normativeStrength: 98,
    operationalMethodScore: 76,
    technicalBindingScore: 38,
    riskClassificationModel: '4-tier statutory risk pyramid (Unacceptable, High-Risk, Limited, Minimal)',
    evoraAdapterRole:
      'Binds Articles 9–15 conformity requirements and post-market monitoring triggers to reusable technical claims.',
  },
  {
    id: 'us_nist_omb',
    name: 'United States NIST AI RMF & OMB M-25-21',
    jurisdiction: 'United States (Federal Agencies)',
    primaryInstrument: 'NIST AI RMF 1.0 + OMB Federal AI Governance Directive',
    normativeStrength: 86,
    operationalMethodScore: 88,
    technicalBindingScore: 48,
    riskClassificationModel: 'Rights-impacting vs. safety-impacting federal use cases',
    evoraAdapterRole:
      'Translates GOVERN/MAP/MEASURE/MANAGE profile outcomes into explicit sufficiency criteria and human sign-off records.',
  },
  {
    id: 'canada_aia',
    name: 'Canada Directive on Automated Decision-Making',
    jurisdiction: 'Canada (Treasury Board)',
    primaryInstrument: 'Algorithmic Impact Assessment (AIA)',
    normativeStrength: 92,
    operationalMethodScore: 85,
    technicalBindingScore: 45,
    riskClassificationModel: '4-level Impact Level matrix scoring raw impact & mitigation',
    evoraAdapterRole:
      'Connects Canadian AIA Impact Levels I–IV to proportionate review independence and version-bound evidence.',
  },
  {
    id: 'uk_atrs',
    name: 'United Kingdom Pro-Innovation & ATRS',
    jurisdiction: 'United Kingdom',
    primaryInstrument: 'Algorithmic Transparency Recording Standard (ATRS) & AI Playbook',
    normativeStrength: 78,
    operationalMethodScore: 82,
    technicalBindingScore: 50,
    riskClassificationModel: 'Sector-regulator context-based proportionality',
    evoraAdapterRole:
      'Populates ATRS public transparency records from verified SAIA claim and version bindings without manual duplication.',
  },
  {
    id: 'au_nsw',
    name: 'Australia Commonwealth & NSW AI Assurance',
    jurisdiction: 'Australia (Federal & NSW)',
    primaryInstrument: 'NSW AI Assurance Framework & National AI Ethics Policy',
    normativeStrength: 84,
    operationalMethodScore: 86,
    technicalBindingScore: 44,
    riskClassificationModel: 'Residual risk matrix with mandatory review panels for high-risk projects',
    evoraAdapterRole:
      'Supplies structured claim-control-evidence traceability for NSW Assurance Panel review gates.',
  },
  {
    id: 'sg_verify',
    name: 'Singapore Model AI Governance & AI Verify',
    jurisdiction: 'Singapore (IMDA / GovTech)',
    primaryInstrument: 'Model AI Governance Framework + AI Verify Testing Toolkit',
    normativeStrength: 80,
    operationalMethodScore: 90,
    technicalBindingScore: 76,
    riskClassificationModel: 'Probability × Severity matrix with operational testing focus',
    evoraAdapterRole:
      'Ingests machine-readable AI Verify test reports and binds them to public-law sufficiency judgments and accountable sign-off.',
  },
];

export const ASSURANCE_APPROACHES: AssuranceApproachSpec[] = [
  {
    id: 'sacm',
    name: 'OMG SACM (Structured Assurance Case Metamodel)',
    category: 'Argument Notation',
    claimSemantics: 96,
    versionProvenance: 55,
    selectiveRevalidation: 48,
    lowAdminOverhead: 32,
    publicLawProportionality: 40,
    gapAddressedByEvora:
      'Formalizes claim-argument-evidence metamodels, but imposes heavy modeling overhead for resource-constrained public teams.',
  },
  {
    id: 'gsn',
    name: 'GSN (Goal Structuring Notation)',
    category: 'Argument Notation',
    claimSemantics: 94,
    versionProvenance: 45,
    selectiveRevalidation: 42,
    lowAdminOverhead: 38,
    publicLawProportionality: 42,
    gapAddressedByEvora:
      'Strong visual safety-case trees, yet lacks native binding to CI/CD version artifacts and selective change invalidation.',
  },
  {
    id: 'amlas',
    name: 'AMLAS (Assurance of Machine Learning in Autonomous Systems)',
    category: 'ML Assurance Method',
    claimSemantics: 90,
    versionProvenance: 68,
    selectiveRevalidation: 58,
    lowAdminOverhead: 44,
    publicLawProportionality: 45,
    gapAddressedByEvora:
      'Comprehensive 6-stage ML safety lifecycle, but assumes dedicated safety-engineering capacity rather than public-sector adapter reuse.',
  },
  {
    id: 'nist_rmf',
    name: 'NIST AI Risk Management Framework (AI RMF 1.0)',
    category: 'Risk Standard',
    claimSemantics: 65,
    versionProvenance: 48,
    selectiveRevalidation: 52,
    lowAdminOverhead: 62,
    publicLawProportionality: 82,
    gapAddressedByEvora:
      'Defines context-sensitive risk functions, but leaves the operational claim-to-evidence binding contract unspecified.',
  },
  {
    id: 'iso_42001',
    name: 'ISO/IEC 42001 (AI Management System)',
    category: 'Risk Standard',
    claimSemantics: 62,
    versionProvenance: 52,
    selectiveRevalidation: 50,
    lowAdminOverhead: 48,
    publicLawProportionality: 70,
    gapAddressedByEvora:
      'Provides organizational management controls, without an artifact-level version binding or selective revalidation graph.',
  },
  {
    id: 'model_cards',
    name: 'Model Cards & System Cards / Datasheets',
    category: 'ML Assurance Method',
    claimSemantics: 48,
    versionProvenance: 72,
    selectiveRevalidation: 35,
    lowAdminOverhead: 78,
    publicLawProportionality: 50,
    gapAddressedByEvora:
      'Captures static descriptive documentation, but often drifts out of sync and lacks explicit sufficiency criteria or accountable decisions.',
  },
  {
    id: 'ai_verify_ops',
    name: 'Operational Testing Suites (AI Verify / Inspect)',
    category: 'Evidence-as-Code / Ops',
    claimSemantics: 54,
    versionProvenance: 85,
    selectiveRevalidation: 64,
    lowAdminOverhead: 82,
    publicLawProportionality: 46,
    gapAddressedByEvora:
      'Generates automated test logs, but cannot determine legal sufficiency or replace accountable human authorization.',
  },
  {
    id: 'oscal_eac',
    name: 'OSCAL & Evidence-as-Code Pipelines',
    category: 'Evidence-as-Code / Ops',
    claimSemantics: 68,
    versionProvenance: 92,
    selectiveRevalidation: 74,
    lowAdminOverhead: 76,
    publicLawProportionality: 44,
    gapAddressedByEvora:
      'Automates control state serialization; EVORA-AI adds public-sector risk proportionality and explicit human judgment boundaries.',
  },
  {
    id: 'mlops_registries',
    name: 'MLOps Lineage & Model Registries (MLflow / DVC)',
    category: 'Evidence-as-Code / Ops',
    claimSemantics: 35,
    versionProvenance: 95,
    selectiveRevalidation: 68,
    lowAdminOverhead: 88,
    publicLawProportionality: 30,
    gapAddressedByEvora:
      'Tracks trustworthy technical provenance, without linking artifacts to external legal obligations or claim sufficiency.',
  },
  {
    id: 'evora_ai',
    name: 'EVORA-AI + SAIA (Proposed Integration Profile)',
    category: 'ML Assurance Method',
    claimSemantics: 88,
    versionProvenance: 92,
    selectiveRevalidation: 94,
    lowAdminOverhead: 90,
    publicLawProportionality: 95,
    gapAddressedByEvora:
      'Target interface: binds heterogeneous governance rules to versioned engineering evidence, sufficiency criteria, accountable reviewers, and selective revalidation.',
  },
];
