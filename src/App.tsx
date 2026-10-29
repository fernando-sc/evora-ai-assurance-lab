/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  SimulationParams,
  computeSimulationMetrics,
  INITIAL_RAG_CLAIMS,
  RagSaiaClaim,
  CHANGE_SIGNALS,
  ChangeSignalId,
  evaluateSaiaClaim,
} from './utils/evoraModel';
import { RealTimeChartsView } from './components/RealTimeChartsView';
import { SelectiveRevalidationView } from './components/SelectiveRevalidationView';
import { SaiaContractInspectorView } from './components/SaiaContractInspectorView';
import { ArchitectureAndMatrixView } from './components/ArchitectureAndMatrixView';
import { PaperPdfModal } from './components/PaperPdfModal';

type ActiveTab = 'simulation' | 'revalidation' | 'saia' | 'architecture';

const DEFAULT_PARAMS: SimulationParams = {
  consequenceScore: 54,
  activeFrameworks: 4,
  evidenceReuseRate: 70,
  annualChangeEvents: 8,
  totalClaims: 12,
  changeBlastRadius: 30,
  sufficiencyThreshold: 85,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulation');
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [activeSignalId, setActiveSignalId] = useState<ChangeSignalId>('none');
  const [ragClaims, setRagClaims] = useState<RagSaiaClaim[]>(INITIAL_RAG_CLAIMS);
  const [selectedClaimId, setSelectedClaimId] = useState<string>('SAIA-RAG-01');
  const [selectedAdapter, setSelectedAdapter] = useState<'guia' | 'euAiAct' | 'nistRmf' | 'canadaAia'>('guia');
  const [isPdfOpen, setIsPdfOpen] = useState<boolean>(false);

  const metrics = useMemo(() => computeSimulationMetrics(params), [params]);

  const activeSignal = useMemo(
    () => CHANGE_SIGNALS.find((s) => s.id === activeSignalId) ?? CHANGE_SIGNALS[0],
    [activeSignalId]
  );

  const evaluatedClaims = useMemo(
    () =>
      ragClaims.map((claim) =>
        evaluateSaiaClaim(
          claim,
          metrics.riskProfile,
          params.sufficiencyThreshold,
          activeSignal
        )
      ),
    [ragClaims, metrics.riskProfile, params.sufficiencyThreshold, activeSignal]
  );

  const handleSelectSignal = (sigId: ChangeSignalId) => {
    setActiveSignalId(sigId);
    const sig = CHANGE_SIGNALS.find((s) => s.id === sigId) ?? CHANGE_SIGNALS[0];
    // Synchronize blast radius slider with the triggered signal's affected claim ratio
    if (sigId !== 'none') {
      const affectedCount = ragClaims.filter((c) =>
        sig.affectedComponents.some((comp) => c.dependencies.includes(comp))
      ).length;
      const computedBlast = Math.max(10, Math.round((affectedCount / ragClaims.length) * 100));
      setParams((prev) => ({ ...prev, changeBlastRadius: computedBlast }));
    }
    setRagClaims((prev) =>
      prev.map((claim) => {
        const isAffected =
          sig.id !== 'none' &&
          sig.affectedComponents.some((comp) => claim.dependencies.includes(comp));
        if (sig.id === 'none') {
          return { ...claim, versionBoundMatch: true };
        }
        if (isAffected && sig.requiresHumanDecision) {
          return { ...claim, versionBoundMatch: false, humanReviewerAuthorized: false };
        }
        return claim;
      })
    );
  };

  const handleUpdateClaim = (updated: RagSaiaClaim) => {
    setRagClaims((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleResetClaims = () => {
    setActiveSignalId('none');
    setRagClaims(INITIAL_RAG_CLAIMS);
  };

  const handleInspectClaimInSaia = (claimId: string) => {
    setSelectedClaimId(claimId);
    setActiveTab('saia');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Strict 3-Zone Top Navigation Bar Contract */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('simulation');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          EVORA-AI Assurance Lab
        </a>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav aria-label="Primary Workspace Views" className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('simulation')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'simulation'
                ? 'border-sky-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Simulation & Charts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('revalidation')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'revalidation'
                ? 'border-sky-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Selective Revalidation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saia')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'saia'
                ? 'border-sky-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            SAIA RAG Contract
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'architecture'
                ? 'border-sky-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Architecture & Matrix
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsPdfOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            Inspect Manuscript PDF
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 py-5 space-y-6">
        {/* Paper Title Banner & Mobile Tab Switcher */}
        <section className="bg-white border border-slate-200 rounded-lg px-5 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1 max-w-4xl">
              <div className="text-xs font-medium text-slate-500">
                <span>Interactive Research Artifact Demonstration</span>
                <span aria-hidden="true"> · </span>
                <span>Design Science Specification</span>
                <span aria-hidden="true"> · </span>
                <span>Simplified Algorithmic Impact Assessment (SAIA)</span>
              </div>
              <h1
                className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                EVORA-AI: A Framework-Adaptive Evidence Assurance Layer for Public-Sector AI Governance
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                Mediates between external governance obligations (GuIA/MGI, EU AI Act, NIST AI RMF, Canadian AIA) and version-bound engineering artifacts via explicit sufficiency criteria, risk-proportional profiles, and selective revalidation.
              </p>
            </div>

            {/* Interactive View Switcher (Segmented Control for all viewports) */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-lg self-start lg:self-end shrink-0">
              {[
                { id: 'simulation', label: '01. Sliders & Charts' },
                { id: 'revalidation', label: '02. Selective Revalidation' },
                { id: 'saia', label: '03. SAIA RAG Contract' },
                { id: 'architecture', label: '04. Architecture & 7×10 Matrix' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Active Interactive View */}
        {activeTab === 'simulation' && (
          <RealTimeChartsView
            params={params}
            onChangeParams={setParams}
            onResetParams={() => setParams(DEFAULT_PARAMS)}
            metrics={metrics}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'revalidation' && (
          <SelectiveRevalidationView
            activeSignalId={activeSignalId}
            onSelectSignal={handleSelectSignal}
            evaluatedClaims={evaluatedClaims}
            riskProfile={metrics.riskProfile}
            sufficiencyThreshold={params.sufficiencyThreshold}
            onChangeSufficiencyThreshold={(val) =>
              setParams((prev) => ({ ...prev, sufficiencyThreshold: val }))
            }
            consequenceScore={params.consequenceScore}
            onChangeConsequenceScore={(val) =>
              setParams((prev) => ({ ...prev, consequenceScore: val }))
            }
            onInspectClaimInSaia={handleInspectClaimInSaia}
          />
        )}

        {activeTab === 'saia' && (
          <SaiaContractInspectorView
            evaluatedClaims={evaluatedClaims}
            selectedClaimId={selectedClaimId}
            onSelectClaimId={setSelectedClaimId}
            onUpdateClaim={handleUpdateClaim}
            onResetClaims={handleResetClaims}
            riskProfile={metrics.riskProfile}
            sufficiencyThreshold={params.sufficiencyThreshold}
            selectedAdapter={selectedAdapter}
            onSelectAdapter={setSelectedAdapter}
          />
        )}

        {activeTab === 'architecture' && <ArchitectureAndMatrixView />}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 mt-12">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            EVORA-AI Interactive Demonstration · Design-Level Specification & SAIA Binding Profile Explorer
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsPdfOpen(true)}
              className="hover:text-slate-900 underline whitespace-nowrap"
            >
              Read Attached Manuscript (PDF)
            </button>
          </div>
        </div>
      </footer>

      <PaperPdfModal isOpen={isPdfOpen} onClose={() => setIsPdfOpen(false)} />
    </div>
  );
}
