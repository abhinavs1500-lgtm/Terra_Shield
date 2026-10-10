import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Parcel } from '../../types';
import { formatINR } from '../../utils/formatters';
import L from 'leaflet';
import {
  Layers,
  Sliders,
  PenTool,
  Trash2,
  Maximize2,
  Crosshair,
  Ruler,
  Compass,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  CheckCircle,
  MapPin,
  Flame,
  Waves,
  Network,
  Globe2
} from 'lucide-react';

export const GeospatialMapView: React.FC = () => {
  const { 
    parcels, 
    selectedParcelId, 
    setSelectedParcelId, 
    setCurrentView,
    setCustomPolygonCoords 
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Basemap Tile Selection (Keyless Open Tile Servers)
  type BasemapStyle = 'satellite' | 'topo' | 'osm' | 'dark';
  const [basemap, setBasemap] = useState<BasemapStyle>('satellite');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Layer Visibility State (Unified Overlays)
  const [showParcels, setShowParcels] = useState(true);
  const [showFlood100, setShowFlood100] = useState(true);
  const [showSurge, setShowSurge] = useState(true);
  const [showLandslide, setShowLandslide] = useState(false);
  const [showInfraNodes, setShowInfraNodes] = useState(true);
  const [showDamagePins, setShowDamagePins] = useState(true);
  const [layerOpacity, setLayerOpacity] = useState(0.75);

  // Drawing tool state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const [drawnMetrics, setDrawnMetrics] = useState<any>(null);

  // Hover coordinate inspector
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Overlays layer group references
  const parcelsLayerRef = useRef<L.LayerGroup | null>(null);
  const flood100LayerRef = useRef<L.LayerGroup | null>(null);
  const surgeLayerRef = useRef<L.LayerGroup | null>(null);
  const landslideLayerRef = useRef<L.LayerGroup | null>(null);
  const infraLayerRef = useRef<L.LayerGroup | null>(null);
  const damageLayerRef = useRef<L.LayerGroup | null>(null);
  const drawLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map Focused on India with Strict Constrained Bounds
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Strict India center and geographical boundaries
    const indiaCenter: [number, number] = [20.5937, 78.9629];
    const indiaBounds: L.LatLngBoundsLiteral = [
      [6.5, 68.0],   // Southwest: Indian Ocean / Lakshadweep / Kanyakumari
      [35.5, 97.5]   // Northeast: Kashmir to Arunachal Pradesh
    ];

    const map = L.map(mapContainerRef.current, {
      center: indiaCenter,
      zoom: 5,
      minZoom: 4,      // Disables zooming out past level 4 to hide the rest of the world
      maxZoom: 18,
      maxBounds: indiaBounds,
      maxBoundsViscosity: 1.0, // Hard stop at boundaries
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Track mouse coordinates
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapRef.current = map;

    // Initialize Layer Groups
    parcelsLayerRef.current = L.layerGroup().addTo(map);
    flood100LayerRef.current = L.layerGroup().addTo(map);
    surgeLayerRef.current = L.layerGroup().addTo(map);
    landslideLayerRef.current = L.layerGroup().addTo(map);
    infraLayerRef.current = L.layerGroup().addTo(map);
    damageLayerRef.current = L.layerGroup().addTo(map);
    drawLayerRef.current = L.layerGroup().addTo(map);

    // Map click for custom drawing
    map.on('click', (e: L.LeafletMouseEvent) => {
      if ((window as any).__isDrawingMode) {
        const newPt: [number, number] = [e.latlng.lat, e.latlng.lng];
        (window as any).__drawnPts = [...((window as any).__drawnPts || []), newPt];
        setDrawnPoints([...(window as any).__drawnPts]);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Swap Basemap Tile Layer dynamically (Reliable Keyless Open Tile Servers)
  useEffect(() => {
    if (!mapRef.current) return;
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    let url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let options: L.TileLayerOptions = {
      attribution: '&copy; Esri, Maxar, Earthstar Geographics, CNES/Airbus DS, USGS',
      maxZoom: 19
    };

    if (basemap === 'topo') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      options = {
        attribution: '&copy; OpenTopoMap (&copy; OpenStreetMap contributors)',
        subdomains: 'abc',
        maxZoom: 17
      };
    } else if (basemap === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      options = {
        attribution: '&copy; OpenStreetMap contributors',
        subdomains: 'abc',
        maxZoom: 19
      };
    } else if (basemap === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      options = {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      };
    }

    const newLayer = L.tileLayer(url, options).addTo(mapRef.current);
    newLayer.bringToBack();
    tileLayerRef.current = newLayer;
  }, [basemap]);

  // Sync drawing state with global window for click handler
  useEffect(() => {
    (window as any).__isDrawingMode = isDrawing;
    (window as any).__drawnPts = drawnPoints;
  }, [isDrawing, drawnPoints]);

  // Render Drawn Polygon
  useEffect(() => {
    if (!drawLayerRef.current || !mapRef.current) return;
    drawLayerRef.current.clearLayers();

    if (drawnPoints.length > 0) {
      drawnPoints.forEach((pt) => {
        L.circleMarker(pt, {
          radius: 5,
          color: '#00f0ff',
          fillColor: '#00ff9d',
          fillOpacity: 1.0,
          weight: 2
        }).addTo(drawLayerRef.current!);
      });

      if (drawnPoints.length >= 2) {
        L.polyline(drawnPoints, {
          color: '#00f0ff',
          dashArray: '5, 5',
          weight: 2
        }).addTo(drawLayerRef.current);
      }

      if (drawnPoints.length >= 3) {
        L.polygon(drawnPoints, {
          color: '#00f0ff',
          fillColor: '#00f0ff',
          fillOpacity: 0.25,
          weight: 2
        }).addTo(drawLayerRef.current);

        api.calculatePolygonMetrics(drawnPoints).then(setDrawnMetrics).catch(() => {});
      }
    }
  }, [drawnPoints]);

  // Render Overlay Layers Located in India
  useEffect(() => {
    if (!mapRef.current) return;

    // 1. Parcels Layer
    if (parcelsLayerRef.current) {
      parcelsLayerRef.current.clearLayers();
      if (showParcels && parcels.length > 0) {
        parcels.forEach(p => {
          const isSelected = p.id === selectedParcelId;
          const poly = L.polygon(p.coordinates as any, {
            color: isSelected ? '#00f0ff' : '#8b5cf6',
            fillColor: isSelected ? '#00f0ff' : '#8b5cf6',
            fillOpacity: isSelected ? layerOpacity * 0.45 : layerOpacity * 0.2,
            weight: isSelected ? 3 : 1.5,
            dashArray: isSelected ? undefined : '4, 4'
          });

          poly.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; min-width: 190px;">
              <div style="font-weight: bold; font-size: 13px; margin-bottom: 2px;">${p.name}</div>
              <div style="color: #64748b; margin-bottom: 6px;">${p.id} • ${p.zone_type}</div>
              <div><b>Area:</b> ${p.area_hectares} ha</div>
              <div><b>Elevation:</b> ${p.mean_elevation_m}m MSL</div>
              <div><b>Flood Zone:</b> Zone ${p.flood_zone}</div>
              <div><b>Slope:</b> ${p.mean_slope_deg}°</div>
              <div><b>Valuation:</b> ${formatINR(p.land_price_estimate_sqm)}/m²</div>
            </div>
          `);

          poly.on('click', () => {
            setSelectedParcelId(p.id);
          });

          poly.addTo(parcelsLayerRef.current!);
        });
      }
    }

    // 2. 100-Year Flood Overlay (Zone AE) — Mahanadi & Coastal Delta (Odisha)
    if (flood100LayerRef.current) {
      flood100LayerRef.current.clearLayers();
      if (showFlood100) {
        const flood100Coords: [number, number][] = [
          [20.1500, 85.6500],
          [20.4500, 85.7000],
          [20.5000, 86.2000],
          [20.1800, 86.1500]
        ];
        L.polygon(flood100Coords, {
          color: '#ff0055',
          fillColor: '#ff0055',
          fillOpacity: layerOpacity * 0.35,
          weight: 1.5
        }).bindPopup('<b>Mahanadi Delta 100-Year Floodplain (Zone AE)</b><br>1% Annual Exceedance floodway with high monsoon backwater surge.').addTo(flood100LayerRef.current);
      }
    }

    // 3. Cyclone Storm Surge Inundation — Mumbai & Konkan Coast
    if (surgeLayerRef.current) {
      surgeLayerRef.current.clearLayers();
      if (showSurge) {
        const surgeCoords: [number, number][] = [
          [18.9500, 72.8000],
          [19.2500, 72.8200],
          [19.2200, 72.9500],
          [18.9800, 72.9200]
        ];
        L.polygon(surgeCoords, {
          color: '#00f0ff',
          fillColor: '#00f0ff',
          fillOpacity: layerOpacity * 0.4,
          weight: 2
        }).bindPopup('<b>Arabian Sea Severe Cyclone Storm Surge Zone</b><br>Simulated tidal ingress across Mithi River & Thane Creek corridors.').addTo(surgeLayerRef.current);
      }
    }

    // 4. Landslide & Slope Instability — Western Ghats (Maharashtra)
    if (landslideLayerRef.current) {
      landslideLayerRef.current.clearLayers();
      if (showLandslide) {
        const lsCoords: [number, number][] = [
          [18.6000, 73.3500],
          [18.8500, 73.4000],
          [18.8000, 73.5500],
          [18.5500, 73.5000]
        ];
        L.polygon(lsCoords, {
          color: '#fbbf24',
          fillColor: '#fbbf24',
          fillOpacity: layerOpacity * 0.35,
          weight: 1.5
        }).bindPopup('<b>Western Ghats Escarpment Landslide Susceptibility</b><br>Geological Survey of India high slope colluvium hazard.').addTo(landslideLayerRef.current);
      }
    }

    // 5. Critical Infrastructure Nodes in India
    if (infraLayerRef.current) {
      infraLayerRef.current.clearLayers();
      if (showInfraNodes) {
        const infraMarkers = [
          { name: 'Bandra-Kurla 400kV Substation', type: 'Power', lat: 19.0650, lng: 72.8680, color: '#f59e0b' },
          { name: 'Bhandup Water Works & Pumping', type: 'Water', lat: 19.1550, lng: 72.9350, color: '#06b6d4' },
          { name: 'Tata Memorial Hospital & Medical', type: 'Hospital', lat: 19.0050, lng: 72.8420, color: '#ff0055' },
          { name: 'Bhubaneswar Emergency Center', type: 'Hospital', lat: 20.2960, lng: 85.8240, color: '#ff0055' },
          { name: 'Bandra-Worli Coastal Sea Link', type: 'Bridge', lat: 19.0350, lng: 72.8180, color: '#8b5cf6' },
          { name: 'Kochi Coastal Shelter & Hub', type: 'Shelter', lat: 9.9650, lng: 76.2850, color: '#10b981' }
        ];

        infraMarkers.forEach(im => {
          L.circleMarker([im.lat, im.lng], {
            radius: 7,
            color: '#ffffff',
            fillColor: im.color,
            fillOpacity: 1.0,
            weight: 2
          }).bindPopup(`<b>${im.name}</b><br>Sector: ${im.type}`).addTo(infraLayerRef.current!);
        });
      }
    }

    // 6. Damage Pins in India
    if (damageLayerRef.current) {
      damageLayerRef.current.clearLayers();
      if (showDamagePins) {
        const damagePins = [
          { title: 'Mahanadi Delta Levee Breach & Inundation', grade: 'Grade 3 (Severe)', lat: 20.3540, lng: 86.1240 },
          { title: 'Cyclone Michaung Arterial Highway Surge', grade: 'Grade 3 (Severe)', lat: 13.0827, lng: 80.2707 },
          { title: 'Bandra-Worli Marine Pier Scour Inspection', grade: 'Grade 2 (Moderate)', lat: 19.0350, lng: 72.8180 },
          { title: 'Bandra-Kurla 400kV Substation Flood Ingress', grade: 'Grade 4 (Critical)', lat: 19.0650, lng: 72.8680 },
          { title: 'Western Ghats NH-48 Slope Colluvium Slump', grade: 'Grade 1 (Minor)', lat: 18.7500, lng: 73.4200 }
        ];
        damagePins.forEach(dp => {
          L.circleMarker([dp.lat, dp.lng], {
            radius: 6,
            color: '#ff0055',
            fillColor: '#ff0055',
            fillOpacity: 0.9,
            weight: 1.5
          }).bindPopup(`<b>Incident:</b> ${dp.title}<br>Severity: ${dp.grade}`).addTo(damageLayerRef.current!);
        });
      }
    }

  }, [parcels, selectedParcelId, showParcels, showFlood100, showSurge, showLandslide, showInfraNodes, showDamagePins, layerOpacity]);

  const handleFinishCustomPolygon = async () => {
    if (drawnPoints.length < 3) return;
    setIsDrawing(false);
    setCustomPolygonCoords(drawnPoints);
    const custom = await api.synthesizeCustomParcel(drawnPoints, "Drawn Custom Indian Study Zone");
    setSelectedParcelId(custom.id);
    setCurrentView('land');
  };

  const clearDrawing = () => {
    setDrawnPoints([]);
    setDrawnMetrics(null);
    if (drawLayerRef.current) drawLayerRef.current.clearLayers();
  };

  return (
    <div className="h-full flex flex-col relative select-none">
      {/* Top Map Control Bar */}
      <div className="h-12 border-b border-ts-card-border bg-ts-header/90 backdrop-blur-md px-4 flex items-center justify-between z-10 text-xs">
        {/* Left: Basemap Switcher (Keyless Open Tile Servers) */}
        <div className="flex items-center space-x-2 font-mono">
          <Globe2 className="w-4 h-4 text-ts-primary animate-pulse hidden sm:inline" />
          <span className="text-ts-text font-bold text-xs tracking-wider hidden lg:inline mr-1">
            INDIA GIS
          </span>

          <div className="flex items-center space-x-1 bg-ts-bg border border-ts-card-border rounded-xl p-0.5 text-[10px] font-mono">
            <button
              onClick={() => setBasemap('satellite')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                basemap === 'satellite'
                  ? 'bg-ts-primary text-slate-950 shadow-sm'
                  : 'text-ts-muted hover:text-ts-text'
              }`}
              title="Esri World Imagery (High-Resolution Satellite - Keyless)"
            >
              SATELLITE
            </button>
            <button
              onClick={() => setBasemap('topo')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                basemap === 'topo'
                  ? 'bg-ts-primary text-slate-950 shadow-sm'
                  : 'text-ts-muted hover:text-ts-text'
              }`}
              title="OpenTopoMap (Topographic Contours & Elevation - Keyless)"
            >
              TOPO
            </button>
            <button
              onClick={() => setBasemap('osm')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                basemap === 'osm'
                  ? 'bg-ts-primary text-slate-950 shadow-sm'
                  : 'text-ts-muted hover:text-ts-text'
              }`}
              title="OpenStreetMap Standard (Keyless)"
            >
              STREETS
            </button>
            <button
              onClick={() => setBasemap('dark')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                basemap === 'dark'
                  ? 'bg-ts-primary text-slate-950 shadow-sm'
                  : 'text-ts-muted hover:text-ts-text'
              }`}
              title="Cyber Dark Cartography"
            >
              DARK
            </button>
          </div>
        </div>

        {/* Center: Cursor Coordinates Inspector in India (East Longitude) */}
        <div className="hidden md:flex items-center space-x-3 text-[11px] font-mono text-ts-muted bg-ts-bg/80 border border-ts-card-border rounded-full px-3.5 py-1">
          <Crosshair className="w-3.5 h-3.5 text-ts-primary" />
          <span>
            {cursorCoords 
              ? `${cursorCoords.lat.toFixed(4)}°N, ${cursorCoords.lng.toFixed(4)}°E` 
              : '20.5937°N, 78.9629°E'}
          </span>
          <span>|</span>
          <span className="text-ts-accent font-semibold">INDIA BOUNDS CONSTRAINED</span>
        </div>

        {/* Right: Polygon Drawing Tools */}
        <div className="flex items-center space-x-2">
          {!isDrawing ? (
            <button
              onClick={() => { setIsDrawing(true); clearDrawing(); }}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-ts-primary/10 border border-ts-primary/40 text-ts-primary hover:bg-ts-primary/20 text-xs font-mono font-bold transition-all"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>DRAW CUSTOM PARCEL</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 animate-pulse">
              <span className="text-[11px] font-mono text-ts-accent font-semibold">
                Click map vertices ({drawnPoints.length} pts)
              </span>
              <button
                onClick={handleFinishCustomPolygon}
                disabled={drawnPoints.length < 3}
                className="px-2.5 py-1 rounded-lg bg-ts-success text-slate-950 text-xs font-mono font-bold disabled:opacity-40"
              >
                FINISH & ANALYZE
              </button>
              <button
                onClick={() => { setIsDrawing(false); clearDrawing(); }}
                className="p-1 rounded-lg bg-ts-bg hover:bg-ts-card text-ts-muted"
                title="Cancel Drawing"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-950" />

        {/* Floating Layer Visibility Palette (Left Side) */}
        <div className="absolute top-4 left-4 z-10 w-64 glass-panel rounded-xl p-3 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-ts-card-border pb-1.5">
            <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-ts-primary" />
              <span>GEOSPATIAL LAYERS</span>
            </div>
            <span className="text-[10px] font-mono text-ts-muted">{parcels.length} Zones</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-ts-bg cursor-pointer transition-colors">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                <span className="text-ts-text">Indian Strategic Parcels</span>
              </div>
              <input 
                type="checkbox" 
                checked={showParcels} 
                onChange={(e) => setShowParcels(e.target.checked)} 
                className="accent-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-ts-bg cursor-pointer transition-colors">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-ts-text">Mahanadi 100-Yr Flood (AE)</span>
              </div>
              <input 
                type="checkbox" 
                checked={showFlood100} 
                onChange={(e) => setShowFlood100(e.target.checked)} 
                className="accent-rose-500"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-ts-bg cursor-pointer transition-colors">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span className="text-ts-text">Mumbai Cyclone Surge</span>
              </div>
              <input 
                type="checkbox" 
                checked={showSurge} 
                onChange={(e) => setShowSurge(e.target.checked)} 
                className="accent-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-ts-bg cursor-pointer transition-colors">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="text-ts-text">Western Ghats Landslides</span>
              </div>
              <input 
                type="checkbox" 
                checked={showLandslide} 
                onChange={(e) => setShowLandslide(e.target.checked)} 
                className="accent-amber-400"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-ts-bg cursor-pointer transition-colors">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-ts-text">Critical Infrastructure</span>
              </div>
              <input 
                type="checkbox" 
                checked={showInfraNodes} 
                onChange={(e) => setShowInfraNodes(e.target.checked)} 
                className="accent-emerald-400"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-ts-bg cursor-pointer transition-colors">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <span className="text-ts-text">Triage Damage Pins</span>
              </div>
              <input 
                type="checkbox" 
                checked={showDamagePins} 
                onChange={(e) => setShowDamagePins(e.target.checked)} 
                className="accent-red-600"
              />
            </label>
          </div>

          {/* Layer Opacity Slider */}
          <div className="pt-2 border-t border-ts-card-border space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-ts-muted">
              <span>OVERLAY OPACITY</span>
              <span>{(layerOpacity * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" 
              min="0.1" 
              max="1.0" 
              step="0.05"
              value={layerOpacity}
              onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1 bg-ts-bg rounded"
            />
          </div>
        </div>

        {/* Drawn Polygon Inspection Card (Bottom Left) */}
        {drawnMetrics && (
          <div className="absolute bottom-6 left-4 z-10 w-72 glass-panel-glow rounded-xl p-3.5 shadow-2xl space-y-2 animate-fade-in">
            <div className="flex items-center justify-between border-b border-ts-card-border pb-1">
              <span className="font-mono text-xs font-bold text-ts-primary">CUSTOM POLYGON METRICS</span>
              <button onClick={clearDrawing} className="text-ts-muted hover:text-ts-text text-xs">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-ts-bg">
                <div className="text-[10px] text-ts-muted">AREA (HECTARES)</div>
                <div className="font-bold text-ts-text">{drawnMetrics.area_hectares} ha</div>
              </div>
              <div className="p-2 rounded bg-ts-bg">
                <div className="text-[10px] text-ts-muted">PERIMETER</div>
                <div className="font-bold text-ts-text">{drawnMetrics.perimeter_m} m</div>
              </div>
            </div>
            <button
              onClick={handleFinishCustomPolygon}
              className="w-full py-1.5 rounded-lg bg-ts-primary text-slate-950 text-xs font-mono font-bold hover:bg-ts-primary/90 transition-colors"
            >
              RUN FULL SUITABILITY SCREENING
            </button>
          </div>
        )}

        {/* Map Legend (Bottom Right) */}
        <div className="absolute bottom-6 right-16 z-10 glass-panel rounded-xl p-2.5 shadow-2xl space-y-1.5 text-[11px] font-mono hidden md:block">
          <div className="text-[10px] text-ts-muted font-bold border-b border-ts-card-border pb-1">
            CARTOGRAPHIC LEGEND
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-2 rounded bg-rose-500/60 border border-rose-500 inline-block"></span>
            <span>Mahanadi 100-Yr Floodway</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-2 rounded bg-cyan-400/60 border border-cyan-400 inline-block"></span>
            <span>Mumbai Cyclone Surge</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-2 rounded bg-amber-400/60 border border-amber-400 inline-block"></span>
            <span>Western Ghats Landslide</span>
          </div>
        </div>
      </div>
    </div>
  );
};
