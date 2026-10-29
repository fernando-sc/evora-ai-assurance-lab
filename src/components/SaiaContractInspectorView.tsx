import React from 'react';
import {
  EvaluatedClaimResult,
  RagSaiaClaim,
  RiskProfileDimensions,
} from '../utils/evoraModel';
import { CheckCircle2, XCircle, ShieldAlert, FileCheck2, UserCheck, RotateCcw } from 'lucide-react';

interface SaiaContractInspectorViewProps {
  evaluatedClaims: EvaluatedClaimResult[];
  selectedClaimId: string;
  onSelectClaimId: (id: string) => void;
  onUpdateClaim: (updated: RagSaiaClaim) => void;
  onResetClaims: () => void;
  riskProfile: RiskProfileDimensions;
  sufficiencyThreshold: number;
  selectedAdapter: 'guia' | 'euAiAct' | 'nistRmf' | 'canadaAia';
  onSelectAdapter: (adapter: 'guia' | 'euAiAct' | 'nistRmf' | 'canadaAia') => void;
}

const ADAPTER_OPTIONS: {
  id: 'guia' | 'euAiAct' | 'nistRmf' | 'canadaAia';
  label: string;
  jurisdiction: string;
}[] = [
  { id: 'guia', label: 'Brazil GuIA / MGI Adapter', jurisdiction: 'Brazil Federal AI Governance' },
  { id: 'euAiAct', label: 'EU AI Act Annex III Adapter', jurisdiction: 'European Union' },
  { id: 'nistRmf', label: 'US NIST AI RMF / OMB M-25-21', jurisdiction: 'United States' },
  { id: 'canadaAia', label: 'Canada Treasury Board AIA', jurisdiction: 'Canada' },
];

export const SaiaContractInspectorView: React.FC<SaiaContractInspectorViewProps> = ({
  evaluatedClaims,
  selectedClaimId,
  onSelectClaimId,
  onUpdateClaim,
  onResetClaims,
  riskProfile,
  sufficiencyThreshold,
  selectedAdapter,
  onSelectAdapter,
}) => {
  const activeEval =
    evaluatedClaims.find((c) => c.claim.id === selectedClaimId) ?? evaluatedClaims[0];
  const { claim, state, invariants, canPromoteToAccepted, blockingReasons } = activeEval;

  const updateField = <K extends keyof RagSaiaClaim>(field: K, value: RagSaiaClaim[K]) => {
    onUpdateClaim({
      ...claim,
      [field]: value,
    });
  };

  const simulateCompleteHarvestAndSignOff = () => {
    onUpdateClaim({
      ...claim,
      evidencePresent: true,
      evidenceReference:
        claim.id === 'SAIA-RAG-01'
          ? 'ci-artifact://rbac-regression-v1.4.0/authz-report-pass.json'
          : claim.evidenceReference,
      testCoveragePct: Math.max(claim.testCoveragePct, sufficiencyThreshold + 4),
      criticalDisclosures: 0,
      evidenceAgeDays: Math.min(claim.evidenceAgeDays, riskProfile.validityWindowDays - 5),
      versionBoundMatch: true,
      reviewerDistinctFromProducer: true,
      humanReviewerAuthorized: true,
      humanRationale:
        'Verified version-bound RBAC regression logs and OPA policy snapshot; residual risk accepted for citizen FAQ scope.',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header & Governance Adapter Switcher */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              SAIA Minimum Assurance Contract & Public-Service RAG Case (Sections III.B & IV)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Switch external Governance Adapters below to see how EVORA-AI binds heterogeneous legal requirements to the <strong>same underlying SAIA technical record</strong> without duplicating documentation.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetClaims}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset to Paper Unexecuted Baseline
          </button>
        </div>

        {/* Governance Adapter Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs font-semibold text-slate-700">
            Active External Governance Adapter:
          </div>
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-lg">
            {ADAPTER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectAdapter(opt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedAdapter === opt.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split: Left Claim Selector + Interactive Evidence/Invariant Sliders, Right Inspectable SAIA Record Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: RAG Claims List + Interactive Invariant Sliders */}
        <div className="lg:col-span-5 space-y-6">
          {/* RAG Threat Claims Selector */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
            <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2.5">
              Select Public-Service RAG Claim (Sec. IV)
            </div>
            <div className="space-y-2">
              {evaluatedClaims.map((item) => {
                const isSelected = item.claim.id === selectedClaimId;
                const isAccepted = item.canPromoteToAccepted;
                return (
                  <button
                    key={item.claim.id}
                    type="button"
                    onClick={() => onSelectClaimId(item.claim.id)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-sky-50/90 border-sky-600 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono-tabular text-xs font-bold truncate">
                        {item.claim.id} · {item.claim.threatCategory}
                      </span>
                      <span
                        className={`text-[11px] font-semibold whitespace-nowrap shrink-0 ${
                          isAccepted ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {isAccepted ? 'Accepted' : 'Pending Evidence'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 truncate">
                      {item.claim.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Sliders & Toggles to Test Section III.B Invariants */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Interactive Evidence & Invariant Tester ({claim.id})
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Adjust technical evidence parameters to verify Section III.B formal invariants.
                </p>
              </div>
              {!canPromoteToAccepted && (
                <button
                  type="button"
                  onClick={simulateCompleteHarvestAndSignOff}
                  className="px-2.5 py-1.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded transition-colors whitespace-nowrap shrink-0"
                >
                  Simulate Harvest & Sign-Off
                </button>
              )}
            </div>

            {/* Slider A: Test Suite Coverage */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <label htmlFor="claim-coverage-slider">
                  Authorization Test Suite Coverage
                </label>
                <span className="font-mono-tabular text-sky-700">
                  {claim.testCoveragePct}% (Req: &ge;{sufficiencyThreshold}%)
                </span>
              </div>
              <input
                id="claim-coverage-slider"
                type="range"
                min={40}
                max={100}
                step={1}
                value={claim.testCoveragePct}
                onChange={(e) => updateField('testCoveragePct', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Slider B: Unresolved Critical Unauthorized Disclosures */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <label htmlFor="claim-disclosures-slider">
                  Unresolved Critical Unauthorized Disclosures
                </label>
                <span
                  className={`font-mono-tabular font-bold ${
                    claim.criticalDisclosures === 0 ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {claim.criticalDisclosures} disclosures (Req: 0)
                </span>
              </div>
              <input
                id="claim-disclosures-slider"
                type="range"
                min={0}
                max={5}
                step={1}
                value={claim.criticalDisclosures}
                onChange={(e) => updateField('criticalDisclosures', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Slider C: Evidence Artifact Age (Temporal Validity) */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <label htmlFor="claim-age-slider">
                  Evidence Artifact Age (Temporal Validity)
                </label>
                <span
                  className={`font-mono-tabular font-bold ${
                    claim.evidenceAgeDays <= riskProfile.validityWindowDays
                      ? 'text-emerald-700'
                      : 'text-red-700'
                  }`}
                >
                  {claim.evidenceAgeDays}d (Max Window: {riskProfile.validityWindowDays}d)
                </span>
              </div>
              <input
                id="claim-age-slider"
                type="range"
                min={1}
                max={200}
                step={1}
                value={claim.evidenceAgeDays}
                onChange={(e) => updateField('evidenceAgeDays', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Checkboxes for Provenance, Separation of Duties, and Human Authority */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={claim.evidencePresent}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onUpdateClaim({
                      ...claim,
                      evidencePresent: checked,
                      evidenceReference:
                        checked && claim.evidenceReference.startsWith('Pending:')
                          ? 'ci-artifact://rbac-regression-v1.4.0/authz-report-pass.json'
                          : claim.evidenceReference,
                    });
                  }}
                  className="mt-0.5 rounded border-slate-300 text-sky-700"
                />
                <span>
                  <strong className="text-slate-900">Attach Version-Bound Technical Evidence Artifact</strong>
                  <span className="block text-[11px] text-slate-500">
                    Binds CI/CD evaluation log and OPA access policy snapshot to {claim.subjectBinding.serviceRelease}.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={claim.reviewerDistinctFromProducer}
                  onChange={(e) => updateField('reviewerDistinctFromProducer', e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-sky-700"
                />
                <span>
                  <strong className="text-slate-900">Independent Reviewer (Separation of Duties)</strong>
                  <span className="block text-[11px] text-slate-500">
                    Reviewer is distinct from the engineering test producer (Mandatory for Intermediate/High profiles).
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={claim.humanReviewerAuthorized}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onUpdateClaim({
                      ...claim,
                      humanReviewerAuthorized: checked,
                      humanRationale:
                        checked && claim.humanRationale.trim().length < 8
                          ? 'Reviewed version-bound RBAC regression logs; authorized under public-service RAG profile.'
                          : claim.humanRationale,
                    });
                  }}
                  className="mt-0.5 rounded border-slate-300 text-sky-700"
                />
                <span>
                  <strong className="text-slate-900">Accountable Human Reviewer Authorization & Grounds</strong>
                  <span className="block text-[11px] text-slate-500">
                    Paper Sec. V: An automatically harvested test log cannot self-authorize deployment; human judgment is part of the contract.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live SAIA Record Table (Exact Structure of Paper Section IV Table) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-sky-700" aria-hidden="true" />
                  SAIA Inspectable Record: {claim.id}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Live instantiation of the Section IV table showing all 9 Minimum Assurance Contract bindings.
                </p>
              </div>
              <div className="font-mono-tabular text-xs font-bold px-3 py-1.5 rounded border bg-white border-slate-200 text-slate-900 shrink-0">
                Status: {state}
              </div>
            </div>

            {/* Invariant Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-4 bg-slate-100/70 border-b border-slate-200 text-xs">
              {[
                { label: '1. Evidence Exists', ok: invariants.hasIdentifiableEvidence },
                { label: '2. Sufficiency Met', ok: invariants.meetsSufficiencyCriterion },
                { label: '3. Version Bound', ok: invariants.versionBindingValid },
                { label: '4. Temporal Validity', ok: invariants.temporalValidityMet },
                { label: '5. Duty Separation', ok: invariants.reviewerIndependenceMet },
                { label: '6. Human Authority', ok: invariants.humanAuthorityIdentified },
              ].map((inv) => (
                <div
                  key={inv.label}
                  className={`px-2.5 py-2 rounded border flex items-center gap-2 font-medium ${
                    inv.ok
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-300 text-red-900'
                  }`}
                >
                  {inv.ok ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-700 shrink-0" aria-hidden="true" />
                  )}
                  <span className="whitespace-nowrap">{inv.label}</span>
                </div>
              ))}
            </div>

            {/* Structured SAIA Contract Table matching Page 7 of PDF */}
            <div className="divide-y divide-slate-200 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 gap-2">
                <div className="sm:col-span-4 font-bold text-slate-700">
                  External requirement
                </div>
                <div className="sm:col-span-8 text-slate-900 font-medium">
                  {claim.externalRequirement[selectedAdapter]}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 gap-2">
                <div className="sm:col-span-4 font-bold text-slate-700">
                  Claim ({claim.id})
                </div>
                <div className="sm:col-span-8 text-slate-900">
                  {claim.claimAssertion}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 gap-2">
                <div className="sm:col-span-4 font-bold text-slate-700">
                  Control
                </div>
                <div className="sm:col-span-8 text-slate-800">
                  {claim.control}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 gap-2">
                <div className="sm:col-span-4 font-bold text-slate-700">
                  Evidence reference
                </div>
                <div className="sm:col-span-8 font-mono-tabular">
                  {claim.evidencePresent ? (
                    <span className="text-sky-800 font-semibold">{claim.evidenceReference}</span>
                  ) : (
                    <span className="text-amber-800 font-semibold">
                      Pending: access-control test report, version-bound evaluation logs and access policy snapshot
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 gap-2">
                <div className="sm:col-span-4 font-bold text-slate-700">
                  Sufficiency criterion
                </div>
                <div className="sm:col-span-8 text-slate-800 space-y-1">
                  <div>{claim.sufficiencyCriterion}</div>
                  <div className="font-mono-tabular text-[11px] text-slate-600">
                    Measured: Coverage <strong>{claim.testCoveragePct}%</strong> (Target &ge;{sufficiencyThreshold}%) · Critical Disclosures: <strong>{claim.criticalDisclosures}</strong> · Artifact Age: <strong>{claim.evidenceAgeDays}d</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 gap-2">
                <div className="sm:col-span-4 font-bold text-slate-700">
                  Subject binding
                </div>
                <div className="sm:col-span-8 font-mono-tabular text-[11px] text-slate-800 space-y-0.5">
                  <div>Service Release: <strong>{claim.subjectBinding.serviceRelease}</strong></div>
                  <div>Retrieval Index: <strong>{claim.subjectBinding.retrievalIndex}</strong></div>
                  <div>Access Policy: <strong>{claim.subjectBinding.accessPolicy}</strong></div>
                  <div>Connected Model: <strong>{claim.subjectBinding.modelVersion}</strong></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 gap-2">
                <div className="sm:col-span-4 font-bold text-slate-700">
                  Reviewer
                </div>
                <div className="sm:col-span-8 text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-slate-600 shrink-0" aria-hidden="true" />
                  <span>
                    {claim.reviewerDistinctFromProducer
                      ? 'Responsible security/privacy reviewer distinct from test producer (Independent)'
                      : 'Self-reviewed by test producer (Fails High/Intermediate independence rule)'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 gap-2 bg-slate-50/70">
                <div className="sm:col-span-4 font-bold text-slate-900">
                  Decision & Rationale
                </div>
                <div className="sm:col-span-8 space-y-2">
                  <div
                    className={`font-bold flex items-center gap-1.5 ${
                      canPromoteToAccepted ? 'text-emerald-800' : 'text-red-800'
                    }`}
                  >
                    {canPromoteToAccepted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-red-700 shrink-0" aria-hidden="true" />
                    )}
                    <span>{state}</span>
                  </div>
                  {canPromoteToAccepted ? (
                    <p className="text-slate-700">
                      <strong>Accountable Grounds:</strong> {claim.humanRationale}
                    </p>
                  ) : (
                    <ul className="list-disc pl-4 space-y-1 text-red-800">
                      {blockingReasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 gap-2">
                <div className="sm:col-span-4 font-bold text-slate-700">
                  Revalidation triggers
                </div>
                <div className="sm:col-span-8 text-slate-700">
                  {claim.revalidationTriggers.join(' · ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
