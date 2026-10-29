import React, { useState } from 'react';
import {
  SimulationParams,
  SimulationMetricsSummary,
  EffortComparisonPoint,
} from '../utils/evoraModel';
import { Sliders, RotateCcw, ArrowUpRight, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RealTimeChartsViewProps {
  params: SimulationParams;
  onChangeParams: (next: SimulationParams) => void;
  onResetParams: () => void;
  metrics: SimulationMetricsSummary;
  onNavigateTab: (tab: 'simulation' | 'revalidation' | 'saia' | 'architecture') => void;
}

const SCENARIO_PRESETS: {
  id: string;
  name: string;
  subtitle: string;
  params: SimulationParams;
}[] = [
  {
    id: 'low_faq',
    name: 'Preset 1: Municipal Info FAQ',
    subtitle: 'Lower consequence · 2 frameworks · 75% reuse',
    params: {
      consequenceScore: 22,
      activeFrameworks: 2,
      evidenceReuseRate: 75,
      annualChangeEvents: 4,
      totalClaims: 8,
      changeBlastRadius: 25,
      sufficiencyThreshold: 75,
    },
  },
  {
    id: 'mid_triage',
    name: 'Preset 2: Citizen Service RAG (Sec. IV)',
    subtitle: 'Intermediate impact · 4 frameworks · 70% reuse',
    params: {
      consequenceScore: 54,
      activeFrameworks: 4,
      evidenceReuseRate: 70,
      annualChangeEvents: 8,
      totalClaims: 12,
      changeBlastRadius: 30,
      sufficiencyThreshold: 85,
    },
  },
  {
    id: 'high_benefits',
    name: 'Preset 3: Benefit Eligibility & Enforcement',
    subtitle: 'High consequence · 6 frameworks · 80% reuse',
    params: {
      consequenceScore: 88,
      activeFrameworks: 6,
      evidenceReuseRate: 80,
      annualChangeEvents: 12,
      totalClaims: 18,
      changeBlastRadius: 35,
      sufficiencyThreshold: 92,
    },
  },
];

export const RealTimeChartsView: React.FC<RealTimeChartsViewProps> = ({
  params,
  onChangeParams,
  onResetParams,
  metrics,
  onNavigateTab,
}) => {
  const [hoveredFramework, setHoveredFramework] = useState<number | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    onChangeParams({
      ...params,
      [key]: value,
    });
  };

  const { riskProfile } = metrics;

  // Radar chart geometry (6 axes for Figure B Risk-Proportional Profile)
  const radarAxes = [
    { label: 'Evidence Rigor', value: riskProfile.evidenceRigor },
    { label: 'Reviewer Independence', value: riskProfile.reviewerIndependence },
    { label: 'Separation of Duties', value: riskProfile.separationOfDuties },
    { label: 'Temporal Strictness', value: riskProfile.temporalStrictness },
    { label: 'Human Oversight', value: riskProfile.humanOversightIntensity },
    { label: 'Deployment Gate', value: riskProfile.deploymentGateStrictness },
  ];

  const radarCenter = 135;
  const radarRadius = 92;
  const getRadarPoint = (index: number, pct: number) => {
    const angle = (Math.PI * 2 * index) / radarAxes.length - Math.PI / 2;
    const r = (pct / 100) * radarRadius;
    return {
      x: radarCenter + r * Math.cos(angle),
      y: radarCenter + r * Math.sin(angle),
    };
  };

  const radarPolygonPoints = radarAxes
    .map((axis, idx) => {
      const pt = getRadarPoint(idx, axis.value);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(' ');

  // Chart 1 scaling
  const maxFrameworkHours = Math.max(
    ...metrics.frameworkSeries.map((d) => d.manualDuplicateHours),
    100
  );

  // Chart 2 scaling
  const maxMonthlyHours = Math.max(
    ...metrics.monthlySeries.map((d) => d.manualCumulativeHours),
    100
  );

  const activeFwData: EffortComparisonPoint =
    metrics.frameworkSeries.find((f) => f.frameworks === (hoveredFramework ?? params.activeFrameworks)) ??
    metrics.frameworkSeries[params.activeFrameworks - 1];

  const activeMonthData =
    metrics.monthlySeries.find((m) => m.month === (hoveredMonth ?? 12)) ??
    metrics.monthlySeries[11];

  return (
    <div className="space-y-8">
      {/* Top Summary Metrics Strip */}
      <section aria-label="Simulation Outcome Summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">
            Active Risk Profile · Figure B
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-lg font-bold text-slate-900">
              {riskProfile.tierLabel}
            </span>
            <span className="font-mono-tabular text-sm font-semibold text-sky-700">
              {params.consequenceScore}/100
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600">
            {riskProfile.reviewModel} · Validity window: <strong className="font-mono-tabular">{riskProfile.validityWindowDays}d</strong>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">
            Annual Assurance Effort ({params.activeFrameworks} Frameworks)
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono-tabular text-2xl font-bold text-slate-900">
              {metrics.annualEvoraHours} hrs
            </span>
            <span className="font-mono-tabular text-xs font-semibold text-emerald-700">
              -{metrics.hoursReductionPct}% vs. Manual ({metrics.annualManualHours}h)
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600">
            Blanket revalidation baseline: <strong className="font-mono-tabular">{metrics.annualBlanketHours} hrs/yr</strong>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">
            Selective Binding Preservation · Figure C
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono-tabular text-2xl font-bold text-slate-900">
              {metrics.selectivePreservationPct}%
            </span>
            <span className="text-xs text-slate-600">
              Unchanged claims kept valid
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600">
            Only <strong className="font-mono-tabular">{params.changeBlastRadius}%</strong> dependent claims reopened per change event
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">
            Evidential Reconstructability · Section V
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono-tabular text-2xl font-bold text-slate-900">
              {metrics.reconstructabilityScore}%
            </span>
            <span className="font-mono-tabular text-xs text-slate-600">
              ~{metrics.decisionLatencyHours}h review latency
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600">
            Version-bound provenance across <strong className="font-mono-tabular">{params.totalClaims}</strong> system claims
          </p>
        </div>
      </section>

      {/* Two-Zone Sandbox Layout: Left Control Deck (Sliders) + Right Real-Time Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Control Deck: 7 Interactive Sliders + Presets */}
        <aside
          aria-label="Interactive Simulation Controls"
          className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-6 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-700" aria-hidden="true" />
              <h2 className="text-base font-bold text-slate-900">
                Parameter Controls
              </h2>
            </div>
            <button
              type="button"
              onClick={onResetParams}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset Defaults
            </button>
          </div>

          {/* Preset Selector */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700">
              Public-Sector Case Presets
            </div>
            <div className="grid grid-cols-1 gap-2">
              {SCENARIO_PRESETS.map((preset) => {
                const isCurrent =
                  params.consequenceScore === preset.params.consequenceScore &&
                  params.activeFrameworks === preset.params.activeFrameworks &&
                  params.evidenceReuseRate === preset.params.evidenceReuseRate;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onChangeParams(preset.params)}
                    className={`text-left p-2.5 rounded-md border transition-colors ${
                      isCurrent
                        ? 'bg-sky-50/80 border-sky-600 text-slate-900'
                        : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-semibold">{preset.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{preset.subtitle}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-5 pt-2 border-t border-slate-200">
            {/* Slider 1: Consequence Score */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label htmlFor="slider-consequence" className="text-xs font-semibold text-slate-800">
                  1. Public Consequence & Impact Score
                </label>
                <span className="font-mono-tabular text-xs font-bold text-sky-700">
                  {params.consequenceScore} / 100 ({riskProfile.tier.toUpperCase()})
                </span>
              </div>
              <input
                id="slider-consequence"
                type="range"
                min={5}
                max={100}
                step={1}
                value={params.consequenceScore}
                onChange={(e) => updateParam('consequenceScore', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>0–34: Lower</span>
                <span>35–69: Intermediate</span>
                <span>70–100: High/Critical</span>
              </div>
            </div>

            {/* Slider 2: Concurrent Governance Frameworks */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label htmlFor="slider-frameworks" className="text-xs font-semibold text-slate-800">
                  2. Concurrent Governance Instruments
                </label>
                <span className="font-mono-tabular text-xs font-bold text-sky-700">
                  {params.activeFrameworks} {params.activeFrameworks === 1 ? 'Framework' : 'Frameworks'}
                </span>
              </div>
              <input
                id="slider-frameworks"
                type="range"
                min={1}
                max={7}
                step={1}
                value={params.activeFrameworks}
                onChange={(e) => updateParam('activeFrameworks', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Maps same SAIA record across GuIA, EU AI Act, NIST RMF, Canadian AIA, etc.
              </div>
            </div>

            {/* Slider 3: Engineering Artifact Reuse Rate */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label htmlFor="slider-reuse" className="text-xs font-semibold text-slate-800">
                  3. Preferential Evidence Reuse Rate
                </label>
                <span className="font-mono-tabular text-xs font-bold text-sky-700">
                  {params.evidenceReuseRate}%
                </span>
              </div>
              <input
                id="slider-reuse"
                type="range"
                min={0}
                max={95}
                step={5}
                value={params.evidenceReuseRate}
                onChange={(e) => updateParam('evidenceReuseRate', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Harvests existing CI/CD tests, MLOps model hashes & security logs vs. manual rewrite.
              </div>
            </div>

            {/* Slider 4: Annual Change / Drift Events */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label htmlFor="slider-changes" className="text-xs font-semibold text-slate-800">
                  4. Annual Change / Drift Frequency
                </label>
                <span className="font-mono-tabular text-xs font-bold text-sky-700">
                  {params.annualChangeEvents} events/yr
                </span>
              </div>
              <input
                id="slider-changes"
                type="range"
                min={1}
                max={24}
                step={1}
                value={params.annualChangeEvents}
                onChange={(e) => updateParam('annualChangeEvents', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Model updates, corpus re-indexing, policy revisions, or incident triggers.
              </div>
            </div>

            {/* Slider 5: Change Dependency Blast Radius */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label htmlFor="slider-blast" className="text-xs font-semibold text-slate-800">
                  5. Dependency Blast Radius per Change
                </label>
                <span className="font-mono-tabular text-xs font-bold text-sky-700">
                  {params.changeBlastRadius}% affected
                </span>
              </div>
              <input
                id="slider-blast"
                type="range"
                min={10}
                max={100}
                step={5}
                value={params.changeBlastRadius}
                onChange={(e) => updateParam('changeBlastRadius', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Fraction of claims dependent on changed component (100% = indiscriminate revalidation).
              </div>
            </div>

            {/* Slider 6: Total System Claims */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label htmlFor="slider-claims" className="text-xs font-semibold text-slate-800">
                  6. Assessable System Claims in SAIA
                </label>
                <span className="font-mono-tabular text-xs font-bold text-sky-700">
                  {params.totalClaims} claims
                </span>
              </div>
              <input
                id="slider-claims"
                type="range"
                min={4}
                max={30}
                step={1}
                value={params.totalClaims}
                onChange={(e) => updateParam('totalClaims', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Slider 7: Sufficiency Threshold */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label htmlFor="slider-sufficiency" className="text-xs font-semibold text-slate-800">
                  7. Declared Sufficiency Criterion Threshold
                </label>
                <span className="font-mono-tabular text-xs font-bold text-sky-700">
                  {params.sufficiencyThreshold}%
                </span>
              </div>
              <input
                id="slider-sufficiency"
                type="range"
                min={60}
                max={98}
                step={1}
                value={params.sufficiencyThreshold}
                onChange={(e) => updateParam('sufficiencyThreshold', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg"
              />
            </div>
          </div>
        </aside>

        {/* Right Zone: 4 Real-Time Data Visualization Charts */}
        <div className="lg:col-span-8 space-y-6">
          {/* Chart 1: Multi-Framework Documentation & Revalidation Effort Scaling */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  01. Assurance Effort Scaling Across Governance Regimes (1–7 Frameworks)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Tests the core research question (Sec. I): avoiding separate manual documentation processes per governance instrument.
                </p>
              </div>
              <div className="text-xs font-mono-tabular bg-slate-50 border border-slate-200 rounded px-3 py-1.5 shrink-0">
                Inspecting <strong>{activeFwData.frameworks} FW</strong>: Manual <strong>{activeFwData.manualDuplicateHours}h</strong> · Blanket <strong>{activeFwData.blanketRevalidationHours}h</strong> · EVORA-AI <strong className="text-sky-700">{activeFwData.evoraSelectiveHours}h</strong>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 mt-4 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-slate-300 inline-block" />
                <span>Separate Manual Process per Instrument</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-amber-500/80 inline-block" />
                <span>Shared Record with Indiscriminate Blanket Revalidation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-sky-600 inline-block" />
                <span className="font-semibold text-slate-900">EVORA-AI (SAIA Adapter + Preferential Reuse + Selective Revalidation)</span>
              </div>
            </div>

            {/* SVG Grouped Bar Chart */}
            <div className="mt-4 overflow-x-auto">
              <svg
                viewBox="0 0 700 250"
                className="w-full h-auto min-w-[540px]"
                role="img"
                aria-label="Bar chart comparing annual assurance hours across 1 to 7 governance frameworks"
              >
                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
                  const y = 205 - tick * 170;
                  const val = Math.round(tick * maxFrameworkHours);
                  return (
                    <g key={i}>
                      <line
                        x1={56}
                        y1={y}
                        x2={680}
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray={tick === 0 ? undefined : '3 3'}
                      />
                      <text
                        x={48}
                        y={y + 4}
                        textAnchor="end"
                        className="fill-slate-500 text-[10px] font-mono-tabular"
                      >
                        {val}h
                      </text>
                    </g>
                  );
                })}

                {/* Bars per framework count */}
                {metrics.frameworkSeries.map((pt, idx) => {
                  const groupX = 72 + idx * 86;
                  const isSelected = pt.frameworks === params.activeFrameworks;
                  const isHovered = pt.frameworks === hoveredFramework;

                  const hManual = Math.max(2, (pt.manualDuplicateHours / maxFrameworkHours) * 170);
                  const hBlanket = Math.max(2, (pt.blanketRevalidationHours / maxFrameworkHours) * 170);
                  const hEvora = Math.max(2, (pt.evoraSelectiveHours / maxFrameworkHours) * 170);

                  return (
                    <g
                      key={pt.frameworks}
                      onMouseEnter={() => setHoveredFramework(pt.frameworks)}
                      onMouseLeave={() => setHoveredFramework(null)}
                      onClick={() => updateParam('activeFrameworks', pt.frameworks)}
                      className="cursor-pointer"
                    >
                      {/* Active framework highlight column */}
                      {(isSelected || isHovered) && (
                        <rect
                          x={groupX - 8}
                          y={24}
                          width={74}
                          height={186}
                          rx={4}
                          fill={isSelected ? '#F0F9FF' : '#F8FAFC'}
                          stroke={isSelected ? '#0284C7' : '#CBD5E1'}
                          strokeWidth={1}
                        />
                      )}

                      {/* Manual Bar */}
                      <rect
                        x={groupX}
                        y={205 - hManual}
                        width={16}
                        height={hManual}
                        rx={2}
                        fill="#CBD5E1"
                      />

                      {/* Blanket Revalidation Bar */}
                      <rect
                        x={groupX + 21}
                        y={205 - hBlanket}
                        width={16}
                        height={hBlanket}
                        rx={2}
                        fill="#F59E0B"
                      />

                      {/* EVORA-AI Bar */}
                      <rect
                        x={groupX + 42}
                        y={205 - hEvora}
                        width={16}
                        height={hEvora}
                        rx={2}
                        fill="#0284C7"
                      />

                      {/* Value callout on EVORA bar */}
                      <text
                        x={groupX + 50}
                        y={Math.max(34, 200 - hEvora)}
                        textAnchor="middle"
                        className="fill-sky-800 text-[10px] font-bold font-mono-tabular"
                      >
                        {pt.evoraSelectiveHours}h
                      </text>

                      {/* X-axis label */}
                      <text
                        x={groupX + 29}
                        y={224}
                        textAnchor="middle"
                        className={`text-[11px] font-mono-tabular ${
                          isSelected ? 'fill-sky-800 font-bold' : 'fill-slate-600'
                        }`}
                      >
                        {pt.frameworks} {pt.frameworks === 1 ? 'Regime' : 'Regimes'}
                      </text>
                      {isSelected && (
                        <text
                          x={groupX + 29}
                          y={238}
                          textAnchor="middle"
                          className="fill-sky-700 text-[9px] font-semibold"
                        >
                          ACTIVE
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Chart 2 & Chart 3 Split Row: Risk-Proportional Radar (Fig B) + 12-Month Cumulative Trajectory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 2: Risk-Proportional Assurance Profile Radar (Figure B) */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      02. Risk-Adaptive Assurance Profile (Fig. B)
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Proportional review dimensions mapped from consequence score ({params.consequenceScore}/100).
                    </p>
                  </div>
                </div>

                {/* SVG Radar */}
                <div className="my-3 flex justify-center">
                  <svg
                    viewBox="0 0 270 260"
                    className="w-full max-w-[260px] h-auto"
                    role="img"
                    aria-label="Radar chart showing 6 risk-proportional assurance dimensions"
                  >
                    {/* Concentric Hexagon Rings */}
                    {[25, 50, 75, 100].map((ring) => {
                      const ringPts = radarAxes
                        .map((_, idx) => {
                          const p = getRadarPoint(idx, ring);
                          return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                        })
                        .join(' ');
                      return (
                        <polygon
                          key={ring}
                          points={ringPts}
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth={1}
                        />
                      );
                    })}

                    {/* Axis Spokes & Labels */}
                    {radarAxes.map((axis, idx) => {
                      const outer = getRadarPoint(idx, 100);
                      const labelPt = getRadarPoint(idx, 122);
                      return (
                        <g key={axis.label}>
                          <line
                            x1={radarCenter}
                            y1={radarCenter}
                            x2={outer.x}
                            y2={outer.y}
                            stroke="#CBD5E1"
                            strokeWidth={1}
                          />
                          <text
                            x={labelPt.x}
                            y={labelPt.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-slate-700 text-[9.5px] font-medium"
                          >
                            {axis.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Data Polygon */}
                    <polygon
                      points={radarPolygonPoints}
                      fill={
                        riskProfile.tier === 'high'
                          ? 'rgba(220, 38, 38, 0.16)'
                          : riskProfile.tier === 'intermediate'
                          ? 'rgba(217, 119, 6, 0.16)'
                          : 'rgba(2, 132, 199, 0.16)'
                      }
                      stroke={
                        riskProfile.tier === 'high'
                          ? '#DC2626'
                          : riskProfile.tier === 'intermediate'
                          ? '#D97706'
                          : '#0284C7'
                      }
                      strokeWidth={2}
                    />

                    {/* Vertex points */}
                    {radarAxes.map((axis, idx) => {
                      const pt = getRadarPoint(idx, axis.value);
                      return (
                        <circle
                          key={axis.label}
                          cx={pt.x}
                          cy={pt.y}
                          r={3.5}
                          fill={
                            riskProfile.tier === 'high'
                              ? '#DC2626'
                              : riskProfile.tier === 'intermediate'
                              ? '#D97706'
                              : '#0284C7'
                          }
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Explicit non-hue state indicator for accessibility */}
              <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    {riskProfile.tier === 'high' ? (
                      <ShieldAlert className="w-4 h-4 text-red-600" aria-hidden="true" />
                    ) : riskProfile.tier === 'intermediate' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-sky-600" aria-hidden="true" />
                    )}
                    {riskProfile.tierLabel}
                  </span>
                  <span className="font-mono-tabular text-slate-600">
                    Max Validity: {riskProfile.validityWindowDays}d
                  </span>
                </div>
                <div className="text-slate-600">
                  Independent Reviewer Required:{' '}
                  <strong className="text-slate-900">
                    {riskProfile.requiresIndependentReviewer ? 'Yes (Mandatory Separation)' : 'No (Peer Review Sufficient)'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Chart 3: 12-Month Cumulative Effort & Change Trajectory */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">
                    03. 12-Month Cumulative Revalidation Trajectory
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Cumulative engineering & review hours across {params.annualChangeEvents} annual change events.
                  </p>
                </div>

                {/* SVG Line Chart */}
                <div className="mt-4">
                  <svg
                    viewBox="0 0 340 195"
                    className="w-full h-auto"
                    role="img"
                    aria-label="12-month cumulative assurance effort line chart"
                  >
                    {[0, 0.5, 1].map((tick, idx) => {
                      const y = 160 - tick * 130;
                      const val = Math.round(tick * maxMonthlyHours);
                      return (
                        <g key={idx}>
                          <line
                            x1={40}
                            y1={y}
                            x2={325}
                            y2={y}
                            stroke="#E2E8F0"
                            strokeDasharray={tick === 0 ? undefined : '3 3'}
                          />
                          <text
                            x={35}
                            y={y + 3}
                            textAnchor="end"
                            className="fill-slate-500 text-[9px] font-mono-tabular"
                          >
                            {val}h
                          </text>
                        </g>
                      );
                    })}

                    {/* Manual Cumulative Line */}
                    <polyline
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                      points={metrics.monthlySeries
                        .map((m, i) => {
                          const x = 44 + (i / 11) * 276;
                          const y = 160 - (m.manualCumulativeHours / maxMonthlyHours) * 130;
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        })
                        .join(' ')}
                    />

                    {/* Blanket Cumulative Line */}
                    <polyline
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      points={metrics.monthlySeries
                        .map((m, i) => {
                          const x = 44 + (i / 11) * 276;
                          const y = 160 - (m.blanketCumulativeHours / maxMonthlyHours) * 130;
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        })
                        .join(' ')}
                    />

                    {/* EVORA Selective Cumulative Line */}
                    <polyline
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth={2.5}
                      points={metrics.monthlySeries
                        .map((m, i) => {
                          const x = 44 + (i / 11) * 276;
                          const y = 160 - (m.evoraCumulativeHours / maxMonthlyHours) * 130;
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        })
                        .join(' ')}
                    />

                    {/* Interactive Month Points */}
                    {metrics.monthlySeries.map((m, i) => {
                      const x = 44 + (i / 11) * 276;
                      const yEvora = 160 - (m.evoraCumulativeHours / maxMonthlyHours) * 130;
                      return (
                        <g
                          key={m.month}
                          onMouseEnter={() => setHoveredMonth(m.month)}
                          onMouseLeave={() => setHoveredMonth(null)}
                          className="cursor-pointer"
                        >
                          <circle cx={x} cy={yEvora} r={3} fill="#0284C7" />
                          {i % 2 === 0 && (
                            <text
                              x={x}
                              y={176}
                              textAnchor="middle"
                              className="fill-slate-500 text-[9px] font-mono-tabular"
                            >
                              {m.monthLabel}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  {activeMonthData.monthLabel} Cumulative:
                </span>
                <span className="font-mono-tabular font-semibold text-slate-900">
                  EVORA {activeMonthData.evoraCumulativeHours}h · Blanket {activeMonthData.blanketCumulativeHours}h · Stale Caught: {activeMonthData.staleRecordsDetected}
                </span>
              </div>
            </div>
          </div>

          {/* Chart 4: Section V Empirical Evaluation Hypotheses Dashboard */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  04. Section V Research Evaluation Hypotheses (SAIA-Assisted vs. Manual Baseline)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  The paper frames operational gains as testable empirical hypotheses across five measurable governance outcomes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('saia')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 whitespace-nowrap shrink-0"
              >
                Inspect SAIA RAG Record
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {[
                {
                  metric: 'Requirements Meeting Explicit Sufficiency Criteria',
                  manualVal: Math.max(35, Math.round(64 - params.activeFrameworks * 4)),
                  evoraVal: Math.min(99, Math.round(78 + params.evidenceReuseRate * 0.2)),
                  unit: '%',
                  note: 'Explicit sufficiency criteria prevent format-only checks from passing.',
                },
                {
                  metric: 'Stale Evidence Bindings Detected After Change',
                  manualVal: Math.max(25, Math.round(58 - params.annualChangeEvents * 1.4)),
                  evoraVal: 98,
                  unit: '%',
                  note: 'Version-bound hashes automatically flag affected claims upon drift/update.',
                },
                {
                  metric: 'Inter-Reviewer Agreement on Sufficiency',
                  manualVal: 54,
                  evoraVal: metrics.expectedReviewerAgreementPct,
                  unit: '%',
                  note: 'Structured claim-control-evidence contract reduces interpretive ambiguity.',
                },
                {
                  metric: 'Historical Approval Reconstructability',
                  manualVal: Math.max(28, Math.round(62 - params.annualChangeEvents * 1.5)),
                  evoraVal: metrics.reconstructabilityScore,
                  unit: '%',
                  note: 'SAIA preserves frozen source versions, evidence hashes, and reviewer rationale.',
                },
              ].map((item) => (
                <div key={item.metric} className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="text-xs font-bold text-slate-900">{item.metric}</div>
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                        <span>Manual Documentation Baseline</span>
                        <span className="font-mono-tabular font-semibold">{item.manualVal}{item.unit}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-400 rounded-full transition-all duration-150"
                          style={{ width: `${item.manualVal}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-900 font-medium mb-0.5">
                        <span>EVORA-AI + SAIA Binding Hypothesis</span>
                        <span className="font-mono-tabular font-bold text-sky-700">{item.evoraVal}{item.unit}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-600 rounded-full transition-all duration-150"
                          style={{ width: `${item.evoraVal}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
