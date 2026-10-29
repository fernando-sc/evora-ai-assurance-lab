import React from 'react';
import { X, FileText, ExternalLink } from 'lucide-react';

interface PaperPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PDF_ASSET_PATH = '/assets/aistudio/EVORA_AI_v6_CANDIDATA_minuta_0bc51506.pdf';

export const PaperPdfModal: React.FC<PaperPdfModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-lg w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-sky-700 shrink-0" aria-hidden="true" />
            <div>
              <h2 id="pdf-modal-title" className="text-sm font-bold text-slate-900">
                Manuscript PDF: EVORA-AI: A Framework-Adaptive Evidence Assurance Layer for Public-Sector AI Governance
              </h2>
              <p className="text-xs text-slate-500">
                Candidate editorial draft (v6 reorganization following INCISCOS V 2026 reviews) · 9 Pages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={PDF_ASSET_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
            >
              Open Full PDF
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Manuscript PDF Viewer"
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          <div className="lg:col-span-4 border-r border-slate-200 p-5 overflow-y-auto space-y-4 bg-slate-50 text-xs">
            <div className="font-bold text-slate-900 text-sm">
              Paper Structure & Interactive Mapping
            </div>
            <div className="space-y-3 text-slate-700">
              <div className="p-3 bg-white rounded border border-slate-200">
                <div className="font-bold text-slate-900">I. Introduction & Research Question (pp. 1–2)</div>
                <p className="mt-1 text-slate-600">
                  How can a lightweight, framework-adaptive assurance layer bind heterogeneous public-sector AI governance requirements to verifiable technical evidence and accountable decisions while keeping assurance proportional to risk and minimizing duplicate manual documentation?
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-slate-200">
                <div className="font-bold text-slate-900">II. Comparative Basis (p. 2)</div>
                <p className="mt-1 text-slate-600">
                  Purposive comparison of 7 governance environments (Brazil GuIA/MGI, Australia/NSW, UK, US, Canada, EU, Singapore) and 10 assurance approaches (SACM, GSN, AMLAS, NIST AI RMF, etc.).
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-slate-200">
                <div className="font-bold text-slate-900">III. EVORA-AI Architecture, Profiles & SAIA (pp. 2–6)</div>
                <p className="mt-1 text-slate-600">
                  Includes Figure A (Mediation Architecture), Minimum Assurance Contract invariants, Figure B (Risk-Adaptive Assurance Profiles), and Figure C (Selective Revalidation Flow).
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-slate-200">
                <div className="font-bold text-slate-900">IV. Illustrative Public-Service RAG (pp. 6–7)</div>
                <p className="mt-1 text-slate-600">
                  Demonstrates an inspectable, unexecuted SAIA record for citizen information RAG privacy/access verification, exposing evidential gaps prior to human sign-off.
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-slate-200">
                <div className="font-bold text-slate-900">V–VII. Discussion, Threats to Validity & Conclusion (pp. 7–9)</div>
                <p className="mt-1 text-slate-600">
                  Defines empirical evaluation hypotheses (evidence reuse vs. reproduction, stale record detection, reviewer agreement, reconstructability) and human accountability boundaries.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-slate-200 h-full">
            <iframe
              src={PDF_ASSET_PATH}
              title="EVORA-AI Manuscript PDF"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
