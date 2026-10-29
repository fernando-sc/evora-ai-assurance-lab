import React, { useState } from 'react';
import {
  GOVERNANCE_ENVIRONMENTS,
  ASSURANCE_APPROACHES,
  GovernanceEnvironmentSpec,
  AssuranceApproachSpec,
} from '../utils/evoraModel';
import { Layers, ArrowDown, Globe2, Scale, Cpu } from 'lucide-react';

export const ArchitectureAndMatrixView: React.FC = () => {
  const [selectedGovId, setSelectedGovId] = useState<string>('guia_br');
  const [selectedAssuranceId, setSelectedAssuranceId] = useState<string>('evora_ai');

  const activeGov: GovernanceEnvironmentSpec =
    GOVERNANCE_ENVIRONMENTS.find((g) => g.id === selectedGovId) ?? GOVERNANCE_ENVIRONMENTS[0];
  const activeAssurance: AssuranceApproachSpec =
    ASSURANCE_APPROACHES.find((a) => a.id === selectedAssuranceId) ?? ASSURANCE_APPROACHES[9];

  return (
    <div className="space-y-8">
      {/* Section 1: Interactive Figure A Architecture Diagram */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-700" aria-hidden="true" />
            Figure A: Framework-Adaptive EVORA-AI Mediation Architecture
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            EVORA-AI operates strictly at the boundary between (1) External Governance Frameworks and (2) Existing Engineering & Operational Sources, maintaining a reconstructable SAIA record without inventing a rival governance lifecycle.
          </p>
        </div>

        {/* Interactive 3-Column Mediation Architecture matching Figure A */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: External Governance Frameworks */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-sky-700" aria-hidden="true" />
                1. External Governance Frameworks (Authoritative)
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Retain legal authority over applicability, risk categories, wording, and approval rules. Click any regime to inspect its adapter binding:
              </p>

              <div className="mt-3 space-y-2">
                {GOVERNANCE_ENVIRONMENTS.map((gov) => {
                  const isSelected = gov.id === selectedGovId;
                  return (
                    <button
                      key={gov.id}
                      type="button"
                      onClick={() => setSelectedGovId(gov.id)}
                      className={`w-full text-left p-2.5 rounded border text-xs transition-colors ${
                        isSelected
                          ? 'bg-sky-50 border-sky-600 text-slate-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="truncate">{gov.name}</span>
                        <span className="font-mono-tabular text-[10px] text-slate-500 whitespace-nowrap shrink-0">
                          Normative: {gov.normativeStrength}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                        {gov.primaryInstrument}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center Column: EVORA-AI Framework-Adaptive Assurance Layer (Figure A Spine) */}
          <div className="lg:col-span-4 bg-slate-900 text-slate-100 rounded-lg p-5 flex flex-col justify-between space-y-3">
            <div className="border-b border-slate-700 pb-3">
              <div className="text-xs font-bold text-sky-300">
                2. EVORA-AI Mediation Spine (Figure A)
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                Active Adapter: <strong>{activeGov.name}</strong>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {[
                {
                  step: 'Requirement & Context Adapters',
                  desc: activeGov.evoraAdapterRole,
                },
                {
                  step: 'Risk-Proportional Assurance Profile',
                  desc: `Maps ${activeGov.riskClassificationModel} to locally approved review depth.`,
                },
                {
                  step: 'Claims & Explicit Sufficiency Criteria',
                  desc: 'Declares testable acceptance thresholds; rejects file-existence checks.',
                },
                {
                  step: 'Evidence & Version Bindings',
                  desc: 'Links immutable system, dataset, model, and control version hashes.',
                },
                {
                  step: 'Human Review & Accountable Decision',
                  desc: 'Identifies decision authority, grounds, and separation of duties.',
                },
                {
                  step: 'SAIA | Lightweight, Traceable Record',
                  desc: 'Preserves status, change events, and selective revalidation history.',
                },
              ].map((node, idx) => (
                <div key={node.step}>
                  <div className="p-2.5 rounded bg-slate-800 border border-slate-700">
                    <div className="font-bold text-white text-xs">{node.step}</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{node.desc}</div>
                  </div>
                  {idx < 5 && (
                    <div className="flex justify-center py-0.5">
                      <ArrowDown className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Existing Engineering & Operational Sources */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-sky-700" aria-hidden="true" />
                3. Existing Engineering & Operational Sources
              </div>
              <p className="text-[11px] text-slate-600">
                Evidence is preferentially referenced or harvested from existing engineering tools before teams are asked to write duplicate documentation:
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-white rounded border border-slate-200">
                  <div className="font-bold text-slate-900">Code / CI-CD / Evaluation Suites</div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Automated regression reports, adversarial prompt benchmarks, release commit SHA bindings.
                  </div>
                </div>

                <div className="p-3 bg-white rounded border border-slate-200">
                  <div className="font-bold text-slate-900">Model Registry / Data / MLOps</div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Signed dataset inventories, vector index snapshots, model weight hashes, drift monitors.
                  </div>
                </div>

                <div className="p-3 bg-white rounded border border-slate-200">
                  <div className="font-bold text-slate-900">Security / Monitoring / Incidents</div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    RBAC/OPA policy snapshots, VPC egress logs, disclosure incident tickets triggering selective revalidation.
                  </div>
                </div>
              </div>
            </div>

            {/* Capability Gap Chart for Selected Governance Regime */}
            <div className="p-3.5 bg-white rounded border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900">
                Section II Interface Gap: {activeGov.name}
              </div>
              {[
                { label: 'Normative Specification', val: activeGov.normativeStrength, color: 'bg-slate-700' },
                { label: 'Operational Assessment Method', val: activeGov.operationalMethodScore, color: 'bg-sky-600' },
                { label: 'Machine-Oriented Technical Binding', val: activeGov.technicalBindingScore, color: 'bg-amber-500' },
              ].map((bar) => (
                <div key={bar.label} className="text-[11px]">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-slate-600">{bar.label}</span>
                    <span className="font-mono-tabular font-semibold">{bar.val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${bar.color}`} style={{ width: `${bar.val}%` }} />
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-slate-500 pt-1">
                EVORA-AI bridges the low machine-oriented technical binding score ({activeGov.technicalBindingScore}%) without overriding normative rules.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Purposive Comparison of 10 Assurance Approaches (Section II) */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-sky-700" aria-hidden="true" />
              Section II Comparative Basis: 10 Assurance Approaches vs. EVORA-AI Profile
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Select any assurance approach from the paper's purposive sample to compare across the five design dimensions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Table of 10 Assurance Approaches */}
          <div className="lg:col-span-7 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 pr-3 font-semibold">Assurance Approach</th>
                  <th className="py-2.5 px-2 font-semibold">Category</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Claims</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Provenance</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Selective Reval</th>
                  <th className="py-2.5 pl-2 font-semibold text-right">Low Overhead</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ASSURANCE_APPROACHES.map((app) => {
                  const isSelected = app.id === selectedAssuranceId;
                  const isEvora = app.id === 'evora_ai';
                  return (
                    <tr
                      key={app.id}
                      onClick={() => setSelectedAssuranceId(app.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-sky-50/90 font-semibold text-slate-900'
                          : isEvora
                          ? 'bg-slate-50 font-medium text-slate-900 hover:bg-sky-50/50'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 pr-3">{app.name}</td>
                      <td className="py-2.5 px-2 text-[11px] text-slate-500">{app.category}</td>
                      <td className="py-2.5 px-2 text-right font-mono-tabular">{app.claimSemantics}%</td>
                      <td className="py-2.5 px-2 text-right font-mono-tabular">{app.versionProvenance}%</td>
                      <td className="py-2.5 px-2 text-right font-mono-tabular">{app.selectiveRevalidation}%</td>
                      <td className="py-2.5 pl-2 text-right font-mono-tabular">{app.lowAdminOverhead}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right Comparison Card: Selected Approach vs EVORA-AI */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
            <div>
              <div className="text-xs font-semibold text-sky-700">
                Comparative Profile Inspector
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                {activeAssurance.name}
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {activeAssurance.gapAddressedByEvora}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200 text-xs">
              {[
                {
                  label: 'Claim–Argument–Evidence Semantics',
                  selectedVal: activeAssurance.claimSemantics,
                  evoraVal: 88,
                },
                {
                  label: 'Version-Bound Artifact Provenance',
                  selectedVal: activeAssurance.versionProvenance,
                  evoraVal: 92,
                },
                {
                  label: 'Selective Dependency Revalidation',
                  selectedVal: activeAssurance.selectiveRevalidation,
                  evoraVal: 94,
                },
                {
                  label: 'Low Duplicate Documentation Overhead',
                  selectedVal: activeAssurance.lowAdminOverhead,
                  evoraVal: 90,
                },
                {
                  label: 'Public-Law Risk Proportionality',
                  selectedVal: activeAssurance.publicLawProportionality,
                  evoraVal: 95,
                },
              ].map((dim) => (
                <div key={dim.label} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-slate-700">{dim.label}</span>
                    <span className="font-mono-tabular text-slate-600">
                      Selected: <strong>{dim.selectedVal}%</strong> · EVORA-AI: <strong className="text-sky-700">{dim.evoraVal}%</strong>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-slate-500 rounded-full transition-all duration-150"
                      style={{ width: `${dim.selectedVal}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
