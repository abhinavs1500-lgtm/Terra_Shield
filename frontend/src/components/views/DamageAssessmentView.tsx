import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { DamageReportItem } from '../../types';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Sliders,
  Upload,
  Layers,
  ShieldCheck,
  Building,
  ArrowRight
} from 'lucide-react';

export const DamageAssessmentView: React.FC = () => {
  const { userRole, sendCopilotQuery } = useApp();

  const [reports, setReports] = useState<DamageReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<DamageReportItem | null>(null);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [showCVOverlay, setShowCVOverlay] = useState<boolean>(true);

  // New triage uploader state
  const [triageType, setTriageType] = useState('Mahanadi Delta Levee Breach & Inundation');
  const [triageLat, setTriageLat] = useState('20.3540');
  const [triageLng, setTriageLng] = useState('86.1240');
  const [triageNotes, setTriageNotes] = useState('Catastrophic levee crest breach; State Highway 12 road approach washout and 42.6 km² agricultural inundation.');
  const [triageLoading, setTriageLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await api.getDamageReports();
      setReports(data);
      if (data.length > 0) setSelectedReport(data[0]);
    } catch (e) {
      console.warn('Failed to load damage reports:', e);
    }
  };

  const handleUpdateStatus = async (reportId: string, status: string) => {
    try {
      await api.updateDamageStatus(reportId, status, userRole === 'Urban Planner' ? 'City Engineer Board' : 'Lead Incident Commander');
      fetchReports();
    } catch (e) {
      console.warn('Status update failed:', e);
    }
  };

  const handleRunTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriageLoading(true);
    try {
      await api.runDamageImageTriage({
        image_name: 'drone_aerial_survey.jpg',
        incident_type: triageType,
        lat: parseFloat(triageLat) || 20.3540,
        lng: parseFloat(triageLng) || 86.1240,
        notes: triageNotes
      });
      await fetchReports();
    } catch (e) {
      console.warn('Triage failed:', e);
    } finally {
      setTriageLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-ts-text select-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel rounded-2xl p-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ts-danger font-semibold mb-1">
            <Camera className="w-3.5 h-3.5" />
            <span>POST-DISASTER COMPUTER VISION & DAMAGE TRIAGE</span>
          </div>
          <h1 className="text-xl font-extrabold font-mono text-ts-text">
            Damage Assessment & Change Detection Registry
          </h1>
          <p className="text-xs text-ts-muted">
            Optical change detection, drone imagery triage, and certified structural inspection audit trails.
          </p>
        </div>

        <button
          onClick={() => sendCopilotQuery("Summarize the critical damage reports and estimate total structural loss")}
          className="px-3.5 py-1.5 rounded-xl bg-ts-danger/15 hover:bg-ts-danger/25 border border-ts-danger/40 text-ts-danger text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-sm self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI DAMAGE SUMMARY</span>
        </button>
      </div>

      {/* Main Grid: Incident Feed + Before-After Image Slider */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Incident Feed */}
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-ts-card-border pb-1.5">
            <span className="font-mono text-xs font-bold text-ts-text">GEOTAGGED DAMAGE INCIDENTS ({reports.length})</span>
            <span className="text-[10px] font-mono text-ts-muted">Sentinel & Drone Feeds</span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {reports.map(rep => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    isSelected 
                      ? 'bg-ts-primary/15 border-ts-primary/50 shadow-md ring-1 ring-ts-primary/40' 
                      : 'bg-ts-bg/80 border-ts-card-border hover:border-ts-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-ts-bg border border-ts-card-border">
                      {rep.id}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      rep.verification_status === 'verified_by_engineer'
                        ? 'bg-ts-success/20 text-ts-success border border-ts-success/40'
                        : (rep.verification_status === 'rejected'
                            ? 'bg-ts-danger/20 text-ts-danger border border-ts-danger/40'
                            : 'bg-ts-warning/20 text-ts-warning border border-ts-warning/40')
                    }`}>
                      {rep.verification_status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-ts-text leading-tight">{rep.title}</div>
                  <div className="text-[11px] text-ts-muted truncate">{rep.address}</div>

                  <div className="pt-2 border-t border-ts-card-border/40 text-[10px] font-mono flex justify-between text-ts-muted">
                    <span className="text-ts-danger font-bold">{rep.severity_grade}</span>
                    <span>Loss: {rep.structural_damage_pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Before-and-After Image Comparison & Inspector */}
        <div className="lg:col-span-2 space-y-4">
          {selectedReport && (
            <div className="glass-panel-glow rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ts-card-border pb-3">
                <div>
                  <div className="text-[10px] font-mono text-ts-muted">{selectedReport.id} • {selectedReport.detection_method}</div>
                  <h2 className="text-base font-extrabold font-mono text-ts-text">{selectedReport.title}</h2>
                  <div className="text-xs text-ts-muted">{selectedReport.address}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'verified_by_engineer')}
                    className="px-3 py-1.5 rounded-lg bg-ts-success/20 hover:bg-ts-success/30 border border-ts-success/50 text-ts-success text-xs font-mono font-bold flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>VERIFY AS PE</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'rejected')}
                    className="px-3 py-1.5 rounded-lg bg-ts-danger/20 hover:bg-ts-danger/30 border border-ts-danger/50 text-ts-danger text-xs font-mono font-bold flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>REJECT</span>
                  </button>
                </div>
              </div>

              {/* Before-and-After Split Comparison Box (Responsive Clip-path) */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-ts-primary font-bold flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-ts-primary inline-block"></span>
                    <span>BEFORE DISASTER (BASELINE 2024)</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowCVOverlay(!showCVOverlay)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                        showCVOverlay
                          ? 'bg-ts-primary/20 text-ts-primary border-ts-primary/50 shadow-sm'
                          : 'bg-ts-bg text-ts-muted border-ts-card-border hover:text-ts-text'
                      }`}
                    >
                      {showCVOverlay ? '✓ AI CV OVERLAY ACTIVE' : 'ENABLE AI CV OVERLAY'}
                    </button>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-ts-card border border-ts-card-border">
                      {sliderPos}% / {100 - sliderPos}%
                    </span>
                  </div>

                  <span className="text-ts-danger font-bold flex items-center space-x-1">
                    <span>POST-DISASTER DELUGE</span>
                    <span className="w-2 h-2 rounded-full bg-ts-danger inline-block"></span>
                  </span>
                </div>

                <div className="relative h-80 rounded-xl overflow-hidden border border-ts-card-border bg-slate-900 select-none">
                  {/* After Image (Full background) */}
                  <img
                    src={selectedReport.image_after_url || "/assets/disaster/mahanadi_flood_aftermath.jpg"}
                    alt="After Disaster"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Before Image with CSS clip-path */}
                  <img
                    src={selectedReport.image_before_url || "/assets/disaster/mahanadi_flood_baseline.jpg"}
                    alt="Before Disaster"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ clipPath: `inset(0 calc(100% - ${sliderPos}%) 0 0)` }}
                  />

                  {/* AI Computer Vision Detection Overlay (Renders over Post-Disaster Portion) */}
                  {showCVOverlay && (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none z-10"
                      viewBox="0 0 800 450"
                      preserveAspectRatio="none"
                    >
                      {/* Submerged Area Inundation Shading & Contours */}
                      <polygon
                        points="80,110 320,120 440,240 380,390 120,380 60,250"
                        fill="rgba(239, 68, 68, 0.22)"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                      <rect x="90" y="88" width="220" height="20" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#ef4444" strokeWidth="1" />
                      <text x="96" y="102" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        ▲ SUBMERGED FLOODWAY (78% INUNDATED)
                      </text>

                      {/* Breached Levee Bounding Box */}
                      <rect
                        x="460"
                        y="180"
                        width="180"
                        height="90"
                        fill="rgba(244, 63, 94, 0.25)"
                        stroke="#f43f5e"
                        strokeWidth="2.5"
                      />
                      <rect x="460" y="158" width="180" height="20" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#f43f5e" strokeWidth="1" />
                      <text x="466" y="172" fill="#f43f5e" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        ⚑ 55m LEVEE BREACH [CRITICAL]
                      </text>

                      {/* Washed-out Road Approaching Bridge */}
                      <rect
                        x="340"
                        y="290"
                        width="210"
                        height="70"
                        fill="rgba(245, 158, 11, 0.25)"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="6 3"
                      />
                      <rect x="340" y="268" width="210" height="20" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#f59e0b" strokeWidth="1" />
                      <text x="346" y="282" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        ⚠ SH-12 ROAD SEVERANCE (1.8m DELUGE)
                      </text>

                      {/* Moving Scanning Laser Beam */}
                      <line x1="0" y1="225" x2="800" y2="225" stroke="#00f0ff" strokeWidth="1.5" opacity="0.6">
                        <animate attributeName="y1" values="40;410;40" dur="4s" repeatCount="indefinite" />
                        <animate attributeName="y2" values="40;410;40" dur="4s" repeatCount="indefinite" />
                      </line>
                    </svg>
                  )}

                  {/* Divider line handle */}
                  <div
                    className="absolute inset-y-0 w-0.5 bg-ts-primary shadow-[0_0_8px_var(--ts-primary)] pointer-events-none z-20"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-950 border-2 border-ts-primary flex items-center justify-center text-[10px] text-ts-primary font-bold shadow-lg">
                      ⇔
                    </div>
                  </div>

                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-[9px] font-mono text-ts-primary border border-ts-primary/40 z-20">
                    BASELINE 2024
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-[9px] font-mono text-ts-danger border border-ts-danger/40 z-20">
                    POST-EVENT AI TRIAGE
                  </div>
                </div>

                {/* Slider Input */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-ts-bg rounded cursor-ew-resize"
                />
              </div>

              {/* Inspector Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-ts-bg/60 border border-ts-card-border">
                  <div className="text-[10px] text-ts-muted">SEVERITY CLASSIFICATION</div>
                  <div className="text-ts-danger font-bold text-sm mt-0.5">{selectedReport.severity_grade}</div>
                </div>
                <div className="p-3 rounded-xl bg-ts-bg/60 border border-ts-card-border">
                  <div className="text-[10px] text-ts-muted">AI CONFIDENCE SCORE</div>
                  <div className="text-ts-primary font-bold text-sm mt-0.5">{(selectedReport.confidence_score * 100).toFixed(0)}% Certainty</div>
                </div>
                <div className="p-3 rounded-xl bg-ts-bg/60 border border-ts-card-border">
                  <div className="text-[10px] text-ts-muted">STRUCTURAL DEFICIT</div>
                  <div className="text-ts-warning font-bold text-sm mt-0.5">{selectedReport.structural_damage_pct}% Compromised</div>
                </div>
              </div>

              {/* AI Computer Vision Detailed Triage Breakdown Panel */}
              <div className="p-4 rounded-xl bg-ts-bg/60 border border-ts-primary/30 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-ts-card-border/60 pb-2">
                  <div className="flex items-center space-x-2 text-ts-primary font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-ts-primary animate-pulse" />
                    <span>AI COMPUTER VISION SEGMENTATION & SPECTRAL CHANGE REPORT</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-ts-primary/10 text-ts-primary border border-ts-primary/30">
                    SAM-Geo & YOLOv8-Disaster
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-ts-bg border border-ts-card-border">
                    <div className="text-[10px] text-ts-muted">INUNDATED AREA</div>
                    <div className="text-ts-danger font-bold text-sm mt-0.5">42.6 km²</div>
                  </div>
                  <div className="p-2 rounded bg-ts-bg border border-ts-card-border">
                    <div className="text-[10px] text-ts-muted">ROAD SEVERANCE</div>
                    <div className="text-ts-warning font-bold text-sm mt-0.5">8.4 km SH-12</div>
                  </div>
                  <div className="p-2 rounded bg-ts-bg border border-ts-card-border">
                    <div className="text-[10px] text-ts-muted">MAROONED ASSETS</div>
                    <div className="text-ts-accent font-bold text-sm mt-0.5">1,420 Structures</div>
                  </div>
                  <div className="p-2 rounded bg-ts-bg border border-ts-card-border">
                    <div className="text-[10px] text-ts-muted">SPECTRAL NDWI SHIFT</div>
                    <div className="text-ts-primary font-bold text-sm mt-0.5">+0.90 Water Gain</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-ts-bg/40 border border-ts-card-border text-xs text-ts-muted space-y-1.5 leading-relaxed font-sans">
                  <div><b className="text-ts-text font-mono">Certified Field Audit:</b> {selectedReport.notes}</div>
                  <div><b className="text-ts-text font-mono">Emergency Directive:</b> Immediate dispatch of NDRF inflatable Zodiac boats to sector K-4; Emergency rock riprap armor dumping along breached levee station 14+200.</div>
                  {selectedReport.verified_by && (
                    <div className="pt-1 font-mono text-[11px] text-ts-success font-semibold flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified & Signed Off by: {selectedReport.verified_by}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Drone Photo Triage Form */}
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-2">
              <Upload className="w-4 h-4 text-ts-primary" />
              <span>SUBMIT DRONE / FIELD AERIAL PHOTO FOR AI OPTICAL TRIAGE</span>
            </div>

            <form onSubmit={handleRunTriage} className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-ts-muted block mb-1">INCIDENT TYPE</label>
                  <input
                    type="text"
                    value={triageType}
                    onChange={(e) => setTriageType(e.target.value)}
                    className="w-full bg-ts-bg border border-ts-card-border rounded-lg px-3 py-2 text-ts-text outline-none focus:border-ts-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-ts-muted block mb-1">LATITUDE</label>
                  <input
                    type="text"
                    value={triageLat}
                    onChange={(e) => setTriageLat(e.target.value)}
                    className="w-full bg-ts-bg border border-ts-card-border rounded-lg px-3 py-2 text-ts-text outline-none focus:border-ts-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-ts-muted block mb-1">LONGITUDE</label>
                  <input
                    type="text"
                    value={triageLng}
                    onChange={(e) => setTriageLng(e.target.value)}
                    className="w-full bg-ts-bg border border-ts-card-border rounded-lg px-3 py-2 text-ts-text outline-none focus:border-ts-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-ts-muted block mb-1">FIELD OBSERVER NOTES</label>
                <input
                  type="text"
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                  className="w-full bg-ts-bg border border-ts-card-border rounded-lg px-3 py-2 text-ts-text outline-none focus:border-ts-primary"
                />
              </div>

              <button
                type="submit"
                disabled={triageLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-ts-primary to-ts-secondary text-slate-950 text-xs font-mono font-bold hover:scale-102 transition-transform shadow-md disabled:opacity-50 flex items-center space-x-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{triageLoading ? 'TRIAGING IMAGERY...' : 'RUN AI COMPUTER VISION TRIAGE'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
