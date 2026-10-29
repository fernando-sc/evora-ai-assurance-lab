import React from 'react';
import {
  CHANGE_SIGNALS,
  ChangeSignalId,
  ChangeSignalSpec,
  EvaluatedClaimResult,
  RiskProfileDimensions,
} from '../utils/evoraModel';
import { GitBranch, RefreshCw, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

interface SelectiveRevalidationViewProps {
  activeSignalId: ChangeSignalId;
  onSelectSignal: (id: ChangeSignalId) => void;
  evaluatedClaims: EvaluatedClaimResult[];
  riskProfile: RiskProfileDimensions;
  sufficiencyThreshold: number;
  onChangeSufficiencyThreshold: (val: number) => void;
  consequenceScore: number;
  onChangeConsequenceScore: (val: number) => void;
  onInspectClaimInSaia: (claimId: string) => void;
}

const SYSTEM_COMPONENTS = [
  { id: 'model_weights', label: 'Model Registry (gov-instruct-70b)', source: 'MLOps / Model Registry' },
  { id: 'retrieval_index', label: 'Vector Corpus Index (idx-public-benefits)', source: 'Dataset Inventory' },
  { id: 'access_policy', label: 'RBAC & Classification Policy (OPA)', source: 'Security Controls' },
  { id: 'prompt_router', label: 'Context Sandbox & Guardrail Router', source: 'Code / CI-CD' },
  { id: 'groundedness_eval', label: 'Civil-Servant QA Evaluation Suite', source: 'Evaluation Suites' },
  { id: 'vendor_sla', label: 'VPC Egress & Sovereign Fallback', source: 'Incident / Infra Ops' },
];

export const SelectiveRevalidationView: React.FC<SelectiveRevalidationViewProps> = ({
  activeSignalId,
  onSelectSignal,
  evaluatedClaims,
  riskProfile,
  sufficiencyThreshold,
  onChangeSufficiencyThreshold,
  consequenceScore,
  onChangeConsequenceScore,
  onInspectClaimInSaia,
}) => {
  const activeSignal: ChangeSignalSpec =
    CHANGE_SIGNALS.find((s) => s.id === activeSignalId) ?? CHANGE_SIGNALS[0];

  const affectedCount = evaluatedClaims.filter((c) => c.affectedBySignal).length;
  const preservedCount = evaluatedClaims.length - affectedCount;

  return (
    <div className="space-y-8">
      {/* Top Explanation & Interactive Sliders Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900">
              Selective Revalidation & Dependency Propagation Simulator (Figure C)
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rather than invalidating every assurance record indiscriminately when a component or policy changes, EVORA-AI inspects <span className="font-mono-tabular text-slate-800">system → claim → control → evidence</span> dependencies and reopens only affected bindings.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-md border border-slate-200">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <label htmlFor="reval-consequence-slider">Consequence Score (Fig. B)</label>
                <span className="font-mono-tabular text-sky-700">{consequenceScore}/100</span>
              </div>
              <input
                id="reval-consequence-slider"
                type="range"
                min={5}
                max={100}
                value={consequenceScore}
                onChange={(e) => onChangeConsequenceScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Active Profile: <strong>{riskProfile.tierLabel}</strong> ({riskProfile.validityWindowDays}d window)
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <label htmlFor="reval-sufficiency-slider">Sufficiency Threshold</label>
                <span className="font-mono-tabular text-sky-700">{sufficiencyThreshold}%</span>
              </div>
              <input
                id="reval-sufficiency-slider"
                type="range"
                min={60}
                max={98}
                value={sufficiencyThreshold}
                onChange={(e) => onChangeSufficiencyThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Minimum required test coverage for claim acceptance
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Left Signal Triggers & Figure C State Machine + Right Live Dependency Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Change Signal Selector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-sky-700" aria-hidden="true" />
                1. Trigger Change Signal (Figure C Top)
              </h3>
              <span className="text-xs font-mono-tabular text-slate-500">
                {affectedCount}/{evaluatedClaims.length} Reopened
              </span>
            </div>

            <div className="space-y-2.5">
              {CHANGE_SIGNALS.map((sig) => {
                const isSelected = sig.id === activeSignalId;
                return (
                  <button
                    key={sig.id}
                    type="button"
                    onClick={() => onSelectSignal(sig.id)}
                    className={`w-full text-left p-3.5 rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-sky-50/90 border-sky-600 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">{sig.label}</span>
                      <span className="text-[11px] font-mono-tabular text-slate-500 shrink-0">
                        {sig.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {sig.description}
                    </p>
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Source: <strong>{sig.triggerSource}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Human Decision Required:{' '}
                        <strong className={sig.requiresHumanDecision ? 'text-amber-700' : 'text-emerald-700'}>
                          {sig.requiresHumanDecision ? 'Yes (Accountable Reviewer)' : 'No (Routine Rule Log)'}
                        </strong>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-Time Comparison Mini-Chart: Blanket vs Selective Revalidation */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              2. Revalidation Scope Impact (Current Signal)
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Indiscriminate Blanket Revalidation</span>
                  <span className="font-mono-tabular font-bold text-slate-800">
                    {activeSignalId === 'none' ? '0' : evaluatedClaims.length} / {evaluatedClaims.length} claims invalidated (100%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-amber-500 transition-all duration-150"
                    style={{ width: activeSignalId === 'none' ? '0%' : '100%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-900">EVORA-AI Selective Revalidation</span>
                  <span className="font-mono-tabular font-bold text-sky-700">
                    {affectedCount} / {evaluatedClaims.length} claims affected ({Math.round((affectedCount / evaluatedClaims.length) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded overflow-hidden border border-slate-200 flex">
                  <div
                    className="h-full bg-sky-600 transition-all duration-150"
                    style={{ width: `${(affectedCount / evaluatedClaims.length) * 100}%` }}
                    title="Reopened / Updated Claims"
                  />
                  <div
                    className="h-full bg-emerald-500/30 transition-all duration-150"
                    style={{ width: `${(preservedCount / evaluatedClaims.length) * 100}%` }}
                    title="Preserved Unchanged Bindings"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-600 pt-1">
                Preserved claims (<strong className="font-mono-tabular">{preservedCount}</strong> of <strong className="font-mono-tabular">{evaluatedClaims.length}</strong>) retain their original version bindings and accountable approvals without duplicate review work.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Dependency Graph & Figure C Pipeline */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-sky-700" aria-hidden="true" />
                  Live Component → Claim → SAIA Decision Dependency Graph
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Click any SAIA claim node to open its full Minimum Assurance Contract in Tab 3.
                </p>
              </div>
            </div>

            {/* Layer 1: System / Engineering Dependencies */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">
                Layer A: Technical & Policy Dependencies (Engineering & Governance Sources)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {SYSTEM_COMPONENTS.map((comp) => {
                  const isTriggered = activeSignal.affectedComponents.includes(comp.id);
                  return (
                    <div
                      key={comp.id}
                      className={`p-3 rounded-md border text-xs transition-colors ${
                        isTriggered
                          ? 'bg-amber-50 border-amber-500 text-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between gap-1">
                        <span>{comp.label}</span>
                        {isTriggered && (
                          <span className="font-mono-tabular text-[10px] font-bold text-amber-800">
                            CHANGED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">{comp.source}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Layer 2: Public-Service RAG SAIA Claims & Selective Invalidation Status */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="text-xs font-bold text-slate-700">
                Layer B: Public-Service RAG Claims & Selective Revalidation Outcome (SAIA Record)
              </div>

              <div className="space-y-3">
                {evaluatedClaims.map((evalItem) => {
                  const { claim, state, affectedBySignal, blockingReasons } = evalItem;

                  const isAccepted = state === 'Accepted by accountable reviewer' || state === 'Logged routine update within rule';
                  const isReopened = affectedBySignal && activeSignal.requiresHumanDecision;

                  return (
                    <div
                      key={claim.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        isReopened
                          ? 'bg-amber-50/70 border-amber-500'
                          : !isAccepted
                          ? 'bg-red-50/40 border-red-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isReopened ? (
                            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
                          ) : isAccepted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                          ) : (
                            <Clock className="w-4 h-4 text-red-700 shrink-0" aria-hidden="true" />
                          )}
                          <span className="font-mono-tabular text-xs font-bold text-slate-900">
                            {claim.id}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {claim.title}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onInspectClaimInSaia(claim.id)}
                          className="text-xs font-semibold text-sky-700 hover:text-sky-900 underline whitespace-nowrap shrink-0 self-start sm:self-auto"
                        >
                          Inspect / Edit Binding →
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 mt-1.5">
                        {claim.claimAssertion}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="text-slate-600">
                          Dependencies:{' '}
                          <span className="font-mono-tabular text-slate-800">
                            {claim.dependencies.join(' · ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-mono-tabular">
                          <span>Coverage: <strong>{claim.testCoveragePct}%</strong></span>
                          <span aria-hidden="true">·</span>
                          <span>
                            SAIA Decision:{' '}
                            <strong
                              className={
                                isReopened
                                  ? 'text-amber-800'
                                  : isAccepted
                                  ? 'text-emerald-800'
                                  : 'text-red-800'
                              }
                            >
                              {isReopened ? 'Reopened by Change Signal (Needs Refresh)' : state}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {blockingReasons.length > 0 && (
                        <div className="mt-2 text-[11px] text-red-800 bg-red-100/70 rounded px-2.5 py-1.5">
                          <strong>Contract Invariant Gate:</strong> {blockingReasons[0]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Figure C Decision Gate Summary Footer */}
            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold flex items-center gap-2 text-sky-300">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  Figure C Human Oversight Rule
                </div>
                <p className="text-xs text-slate-300">
                  {activeSignal.requiresHumanDecision
                    ? `Active signal "${activeSignal.label}" materially affects ${affectedCount} claim(s). Automated rules flag the stale version bindings, while substantive risk acceptance remains assigned to an accountable human reviewer.`
                    : activeSignalId === 'routine_ci_pass'
                    ? 'Routine CI test log refresh matches the existing configuration and authorized rule: logged automatically in SAIA history without interrupting human reviewers.'
                    : 'Steady state: all accepted claims retain version-bound provenance until a dependency trigger fires.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
