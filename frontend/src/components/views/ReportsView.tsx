import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FALLBACK_DOSSIER } from '../../services/fallbackData';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Flame,
  Wrench,
  Database
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { selectedParcelId, parcels, setSelectedParcelId, sendCopilotQuery } = useApp();
  const [dossier, setDossier] = useState<any>(FALLBACK_DOSSIER);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchDossier();
  }, [selectedParcelId]);

  const fetchDossier = async () => {
    setLoading(true);
    try {
      const data = await api.getResilienceDossier(selectedParcelId);
      setDossier(data || FALLBACK_DOSSIER);
    } catch (e) {
      console.warn('Failed to load dossier, using fallback:', e);
      setDossier(FALLBACK_DOSSIER);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!dossier) return;
    setExporting(true);
    try {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(7, 13, 30);
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(0, 240, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('TERRASHIELD AI', 14, 18);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('EXECUTIVE GEOSPATIAL RESILIENCE & LAND SUITABILITY DOSSIER', 14, 26);

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text(`ID: ${dossier.dossier_id} | Date: ${dossier.generated_at}`, 14, 32);

      let yPos = 45;

      // Section 1: Location & Land Suitability
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Location & Land Suitability Screening', 14, yPos);
      yPos += 6;

      autoTable(doc, {
        startY: yPos,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
        head: [['Metric', 'Observed Value', 'Suitability Assessment']],
        body: [
          ['Target Parcel', `${dossier.target_location.parcel_name} (${dossier.target_location.parcel_id})`, `${dossier.target_location.zone_type} Zone`],
          ['Area & Elevation', `${dossier.target_location.area_hectares} ha | ${dossier.target_location.mean_elevation_m}m MSL`, `Slope: ${dossier.target_location.mean_slope_deg}°`],
          ['Suitability Verdict', `${dossier.land_suitability.score}/100 (${dossier.land_suitability.rating})`, `Profile: ${dossier.land_suitability.profile}`],
          ['FEMA Flood Zone', `Zone ${dossier.target_location.fema_flood_zone}`, '100-Year Regulatory Floodplain'],
          ['Primary Constraint', dossier.land_suitability.primary_constraints[0], 'Mitigation Plan Required']
        ]
      });

      yPos = (doc as any).lastAutoTable.finalY + 12;

      // Section 2: Multi-Hazard Summary
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Natural Hazard Threat Exposure Matrix', 14, yPos);
      yPos += 6;

      const hazardRows = dossier.hazard_profile.hazards_summary.map((h: any) => [
        h.type,
        h.risk,
        `${h.score}/100`,
        h.driver
      ]);

      autoTable(doc, {
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [244, 63, 94] },
        head: [['Hazard Type', 'Threat Level', 'Index', 'Primary Risk Driver']],
        body: hazardRows
      });

      yPos = (doc as any).lastAutoTable.finalY + 12;

      // Section 3: Recommended Recovery Schedule
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Resource-Constrained Recovery Priority Schedule', 14, yPos);
      yPos += 6;

      const recoveryRows = dossier.recommended_recovery_schedule.prioritized_tasks.map((t: any) => [
        t.task_name,
        t.timeline,
        t.cost,
        t.rationale
      ]);

      autoTable(doc, {
        startY: yPos,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        head: [['Task Description', 'Timeline', 'Cost (INR)', 'AI Prioritization Rationale']],
        body: recoveryRows
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(
          'TerraShield AI — Confidential Planning Decision Support. Not a certified geotechnical survey approval.',
          14,
          288
        );
        doc.text(`Page ${i} of ${pageCount}`, 190, 288);
      }

      doc.save(`TerraShield-Resilience-Dossier-${dossier.target_location.parcel_id}.pdf`);
    } catch (err) {
      console.warn('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-ts-text select-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel rounded-2xl p-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ts-primary font-semibold mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>AUTOMATED EXECUTIVE DOSSIER GENERATION</span>
          </div>
          <h1 className="text-xl font-extrabold font-mono text-ts-text">
            Resilience Dossiers & Official Planning Documents
          </h1>
          <p className="text-xs text-ts-muted">
            Compiles multi-criteria land ratings, multi-hazard matrices, and optimized recovery timelines with citations.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <select
            value={selectedParcelId}
            onChange={(e) => setSelectedParcelId(e.target.value)}
            className="bg-ts-bg border border-ts-card-border rounded-xl px-3 py-2 text-xs font-mono font-semibold text-ts-text focus:border-ts-primary outline-none"
          >
            {parcels.map(p => (
              <option key={p.id} value={p.id}>
                {p.id} — {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-ts-bg border border-ts-card-border hover:border-ts-primary text-ts-text text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors"
            title="Print Dossier"
          >
            <Printer className="w-3.5 h-3.5 text-ts-muted" />
            <span className="hidden sm:inline">PRINT</span>
          </button>

          <button
            onClick={() => sendCopilotQuery(`Summarize the executive findings and strategic takeaways from resilience dossier ${dossier?.dossier_id}`)}
            className="px-3.5 py-2 rounded-xl bg-ts-primary/15 hover:bg-ts-primary/25 border border-ts-primary/40 text-ts-primary text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI DOSSIER BRIEF</span>
          </button>

          <button
            onClick={exportPDF}
            disabled={exporting || loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-ts-primary to-ts-secondary text-slate-950 text-xs font-mono font-bold flex items-center space-x-2 shadow-md hover:scale-102 transition-transform disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'GENERATING PDF...' : 'EXPORT PDF'}</span>
          </button>
        </div>
      </div>

      {/* Rendered Dossier Paper View */}
      {dossier && (
        <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 space-y-6 max-w-5xl mx-auto shadow-2xl">
          {/* Dossier Title Header */}
          <div className="border-b border-ts-card-border pb-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-ts-primary font-bold">
              <span>TERRASHIELD AI RESILIENCE PLATFORM</span>
              <span>{dossier.dossier_id}</span>
            </div>
            <h2 className="text-xl font-bold font-mono text-ts-text">{dossier.title}</h2>
            <div className="text-xs text-ts-muted font-mono">
              Generated: {dossier.generated_at} • {dossier.author_system}
            </div>
          </div>

          {/* Section 1: Land Intelligence */}
          <div className="space-y-3">
            <div className="font-mono text-xs font-bold text-ts-primary flex items-center space-x-2 border-b border-ts-card-border/60 pb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>1. LOCATION PROFILE & LAND SUITABILITY VERDICT</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-ts-bg/60 border border-ts-card-border">
                <div className="text-[10px] text-ts-muted">SUITABILITY SCORE</div>
                <div className="text-xl font-bold text-ts-primary mt-0.5">
                  {dossier.land_suitability.score} / 100 ({dossier.land_suitability.rating})
                </div>
              </div>
              <div className="p-3 rounded-xl bg-ts-bg/60 border border-ts-card-border">
                <div className="text-[10px] text-ts-muted">PARCEL EXTENT</div>
                <div className="text-xl font-bold text-ts-text mt-0.5">
                  {dossier.target_location.area_hectares} ha ({dossier.target_location.mean_elevation_m}m MSL)
                </div>
              </div>
              <div className="p-3 rounded-xl bg-ts-bg/60 border border-ts-card-border">
                <div className="text-[10px] text-ts-muted">FEMA FLOOD ZONE</div>
                <div className="text-xl font-bold text-ts-accent mt-0.5">
                  Zone {dossier.target_location.fema_flood_zone}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-ts-bg/40 border border-ts-card-border text-xs text-ts-muted space-y-1">
              <div><b className="text-ts-text">Identified Constraint:</b> {dossier.land_suitability.primary_constraints[0]}</div>
              <div><b className="text-ts-text">Recommended Mitigation:</b> {dossier.land_suitability.recommended_mitigations[0]}</div>
            </div>
          </div>

          {/* Section 2: Multi-Hazard Intelligence */}
          <div className="space-y-3">
            <div className="font-mono text-xs font-bold text-ts-danger flex items-center space-x-2 border-b border-ts-card-border/60 pb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>2. NATURAL HAZARD EXPOSURE & THREAT BENCHMARKS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {dossier.hazard_profile.hazards_summary.map((h: any, i: number) => (
                <div key={i} className="p-2.5 rounded-lg bg-ts-bg/60 border border-ts-card-border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-ts-text">{h.type}</div>
                    <div className="text-[10px] text-ts-muted">{h.driver}</div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-ts-danger/15 text-ts-danger border border-ts-danger/30 shrink-0 ml-2">
                    {h.risk} ({h.score})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Recovery Schedule */}
          <div className="space-y-3">
            <div className="font-mono text-xs font-bold text-ts-success flex items-center space-x-2 border-b border-ts-card-border/60 pb-1">
              <Wrench className="w-3.5 h-3.5" />
              <span>3. RESOURCE-CONSTRAINED RECOVERY SEQUENCING (PHASE 1)</span>
            </div>

            <div className="space-y-2">
              {dossier.recommended_recovery_schedule.prioritized_tasks.map((task: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-ts-bg/60 border border-ts-card-border text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="font-bold text-ts-text">{task.task_name}</div>
                    <div className="text-[10px] text-ts-muted italic mt-0.5">{task.rationale}</div>
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <div className="text-ts-primary font-bold">{task.timeline}</div>
                    <div className="text-ts-success">{task.cost}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Traceable Data Sources Cited */}
          <div className="space-y-2 pt-2 border-t border-ts-card-border">
            <div className="font-mono text-xs font-bold text-ts-muted flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-ts-primary" />
              <span>CITED OFFICIAL PUBLIC DATA SOURCES & METADATA</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-ts-muted">
              {dossier.data_sources_cited.map((ds: any, idx: number) => (
                <div key={idx} className="p-2 rounded bg-ts-bg/60 border border-ts-card-border flex justify-between">
                  <span className="text-ts-text truncate mr-2">{ds.name}</span>
                  <span className="text-ts-primary shrink-0">{ds.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 rounded-xl bg-ts-bg/60 border border-ts-card-border text-[10px] font-mono text-ts-muted leading-relaxed">
            {dossier.legal_disclosure}
          </div>
        </div>
      )}
    </div>
  );
};
