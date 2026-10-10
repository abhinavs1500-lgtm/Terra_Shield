import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import * as THREE from 'three';
import { formatNumberIN } from '../../utils/formatters';
import {
  Box,
  Compass,
  Layers,
  Waves,
  Eye,
  Sliders,
  Sparkles,
  Maximize2,
  RefreshCw,
  Zap,
  Activity,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const DigitalTwin3DView: React.FC = () => {
  const { 
    parcels, 
    selectedParcelId, 
    setSelectedParcelId, 
    setCurrentView,
    active3DWaterHeight, 
    setActive3DWaterHeight 
  } = useApp();

  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [cameraPreset, setCameraPreset] = useState<'orbital' | 'tactical' | 'ground' | 'estuary'>('tactical');
  const [wireframeMode, setWireframeMode] = useState<boolean>(true);
  const [laserScanActive, setLaserScanActive] = useState<boolean>(true);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const laserBeamRef = useRef<THREE.Mesh | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const hologramMaterialsRef = useRef<THREE.ShaderMaterial[]>([]);

  const active3DWaterHeightRef = useRef(active3DWaterHeight);
  active3DWaterHeightRef.current = active3DWaterHeight;
  const laserScanActiveRef = useRef(laserScanActive);
  laserScanActiveRef.current = laserScanActive;

  // 3D Scene Assets (Localized to Indian Critical Infrastructure)
  const ASSETS_3D = [
    { id: 'HOSP-01', name: 'Tata Memorial Hospital & Critical Care', type: 'Hospital', x: 12, z: -15, y: 3.5, color: 0xff0055, pop: 85000 },
    { id: 'HOSP-02', name: 'Apollo Coastal Emergency Clinic', type: 'Hospital', x: 28, z: 8, y: 1.2, color: 0xff0055, pop: 25000 },
    { id: 'ELEC-01', name: 'Bandra-Kurla 400kV Primary Substation', type: 'Power', x: 18, z: 22, y: 1.5, color: 0xf59e0b, pop: 120000 },
    { id: 'WAT-01', name: 'Bhandup Water Treatment & Pumping Station', type: 'Water', x: -14, z: 18, y: 0.9, color: 0x00f0ff, pop: 180000 },
    { id: 'BRG-01', name: 'Bandra-Worli Coastal Sea Link Bridge', type: 'Bridge', x: 2, z: 28, y: 1.8, color: 0x8b5cf6, pop: 65000 },
    { id: 'TEL-01', name: 'Central Telecom & VSNL Gateway Hub', type: 'Telecom', x: -5, z: -8, y: 8.5, color: 0x00ff9d, pop: 150000 }
  ];

  // Helper to create the realistic Holographic Shader Material
  const createHologramMaterial = (
    baseHex: number,
    rimHex: number,
    opacity = 0.65,
    wireframe = false,
    scanDensity = 2.0
  ) => {
    const mat = new THREE.ShaderMaterial({
      wireframe,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color(baseHex) },
        uRimColor: { value: new THREE.Color(rimHex) },
        uOpacity: { value: opacity },
        uScanDensity: { value: scanDensity }
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;

          // Subtle randomized vertex glitch displacement
          vec3 displaced = position;
          float glitchClock = floor(uTime * 14.0);
          float glitchNoise = sin(glitchClock * 31.7) * cos(glitchClock * 83.3);
          if (glitchNoise > 0.88) {
            float slice = sin(position.y * 10.0 + uTime * 25.0);
            if (abs(slice) > 0.72) {
              displaced.x += sin(uTime * 40.0 + position.y) * 0.35;
              displaced.z += cos(uTime * 40.0 + position.y) * 0.35;
            }
          }

          vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uBaseColor;
        uniform vec3 uRimColor;
        uniform float uOpacity;
        uniform float uScanDensity;

        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);

          // 1. Fresnel Rim Lighting Effect: edges glow brightly, center faces slightly translucent
          float fresnel = 1.0 - abs(dot(normal, viewDir));
          fresnel = clamp(fresnel, 0.0, 1.0);
          float rim = pow(fresnel, 2.4);

          // 2. Scanline animation with moving horizontal stripes: mod(vPosition.y - uTime, 1.0)
          float scanline = step(0.48, mod(vPosition.y * uScanDensity - uTime * 2.8, 1.0));
          float scanStripe = 0.38 + 0.62 * scanline;

          // High-frequency subtle scanline ripple
          float microScan = 0.88 + 0.12 * sin(vPosition.y * 30.0 - uTime * 12.0);

          // 3. Subtle flickering opacity
          float flicker = 0.93 + 0.07 * sin(uTime * 42.0) * cos(uTime * 21.0);

          // Blend base hologram color with intense Fresnel glowing rim
          vec3 color = mix(uBaseColor, uRimColor, rim * 0.85);
          color += uRimColor * pow(fresnel, 3.8) * 0.9;

          float alpha = (0.22 + 0.78 * rim) * scanStripe * microScan * uOpacity * flicker;

          gl_FragColor = vec4(color * (1.0 + rim * 0.7), alpha);
        }
      `
    });

    hologramMaterialsRef.current.push(mat);
    return mat;
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    hologramMaterialsRef.current = [];

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.009);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(45, 38, 55);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x00f0ff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(50, 80, 40);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xa855f7, 2.5, 100);
    pointLight.position.set(0, 25, 0);
    scene.add(pointLight);

    // 5. Procedural Holographic Terrain DEM Grid with Shader
    const terrainSize = 120;
    const terrainSegments = 64;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      // Generate hills to NW, estuary to SE
      let y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 6.0;
      y += ((-x + 30) * 0.12) + ((-z + 30) * 0.15);
      if (x > 5 && z > 5) y -= 4.0; // Harbor basin
      y = Math.max(-1.5, y);
      posAttr.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    const terrainHoloMat = createHologramMaterial(0x0a192f, 0x00f0ff, 0.75, wireframeMode, 1.8);
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainHoloMat);
    scene.add(terrainMesh);
    terrainMeshRef.current = terrainMesh;

    // 6. Dynamic Water Surface (Inundation Plane) with Hologram Reflection Shader
    const waterGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, 32, 32);
    waterGeo.rotateX(-Math.PI / 2);
    const waterHoloMat = createHologramMaterial(0x002244, 0x00ff9d, 0.55, false, 2.5);
    const waterMesh = new THREE.Mesh(waterGeo, waterHoloMat);
    waterMesh.position.y = active3DWaterHeightRef.current;
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // 7. Holographic 3D City Buildings
    const buildingGroup = new THREE.Group();
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 1 });

    for (let bx = -40; bx <= 40; bx += 8) {
      for (let bz = -40; bz <= 40; bz += 8) {
        if (bx > 5 && bz > 10) continue; // Leave water basin open
        if (Math.random() > 0.45) {
          const bH = 3 + Math.random() * 12;
          const bGeo = new THREE.BoxGeometry(4.5, bH, 4.5);
          const bMat = createHologramMaterial(
            bH > 10 ? 0x220538 : 0x071e3d,
            bH > 10 ? 0xa855f7 : 0x00f0ff,
            0.65,
            false,
            3.0
          );
          const bMesh = new THREE.Mesh(bGeo, bMat);
          bMesh.position.set(bx + Math.random() * 2, bH / 2 + 1, bz + Math.random() * 2);
          buildingGroup.add(bMesh);

          // Add glowing wireframe edges
          const edges = new THREE.EdgesGeometry(bGeo);
          const line = new THREE.LineSegments(edges, edgeMat);
          line.position.copy(bMesh.position);
          buildingGroup.add(line);
        }
      }
    }
    scene.add(buildingGroup);

    // 8. 3D Infrastructure Network Lines (Glowing Beams)
    const infraLinesGroup = new THREE.Group();
    const linePairs = [
      [ASSETS_3D[2], ASSETS_3D[3], 0xf59e0b], // Power to Water
      [ASSETS_3D[2], ASSETS_3D[0], 0xf59e0b], // Power to Hospital
      [ASSETS_3D[3], ASSETS_3D[0], 0x00f0ff], // Water to Hospital
      [ASSETS_3D[4], ASSETS_3D[0], 0x8b5cf6], // Bridge to Hospital
      [ASSETS_3D[5], ASSETS_3D[0], 0x00ff9d]  // Telecom to Hospital
    ];

    linePairs.forEach(([src, dst, col]) => {
      const points = [
        new THREE.Vector3((src as any).x, (src as any).y + 2, (src as any).z),
        new THREE.Vector3(((src as any).x + (dst as any).x) / 2, Math.max((src as any).y, (dst as any).y) + 8, ((src as any).z + (dst as any).z) / 2),
        new THREE.Vector3((dst as any).x, (dst as any).y + 2, (dst as any).z)
      ];
      const curve = new THREE.QuadraticBezierCurve3(points[0], points[1], points[2]);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.25, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({ color: col as number, transparent: true, opacity: 0.85 });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      infraLinesGroup.add(tube);
    });
    scene.add(infraLinesGroup);

    // 9. Critical Asset 3D Pulsing Beacons
    const beaconGroup = new THREE.Group();
    ASSETS_3D.forEach(asset => {
      // Beacon cylinder
      const cylGeo = new THREE.CylinderGeometry(0.1, 1.8, 14, 16, 1, true);
      const cylMat = new THREE.MeshBasicMaterial({
        color: asset.color,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide
      });
      const beacon = new THREE.Mesh(cylGeo, cylMat);
      beacon.position.set(asset.x, asset.y + 7, asset.z);
      beaconGroup.add(beacon);

      // Sphere tip with glow
      const sphereGeo = new THREE.SphereGeometry(1.2, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: asset.color,
        emissive: asset.color,
        emissiveIntensity: 0.9
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(asset.x, asset.y + 14, asset.z);
      (sphere as any).__assetData = asset;
      beaconGroup.add(sphere);
    });
    scene.add(beaconGroup);

    // 10. Holographic Laser Scanning Plane Sweep
    const laserGeo = new THREE.PlaneGeometry(terrainSize, 1.5);
    laserGeo.rotateX(-Math.PI / 2);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    const laserMesh = new THREE.Mesh(laserGeo, laserMat);
    laserMesh.position.y = 12;
    scene.add(laserMesh);
    laserBeamRef.current = laserMesh;

    // Mouse Interaction (Orbiting)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let theta = Math.PI / 4;
    let phi = Math.PI / 3;
    let radius = 75;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      theta -= deltaX * 0.008;
      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi - deltaY * 0.008));

      updateCameraPos();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius = Math.max(20, Math.min(150, radius + e.deltaY * 0.05));
      updateCameraPos();
    };

    const updateCameraPos = () => {
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Click Asset Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(beaconGroup.children);
      if (intersects.length > 0) {
        const hit = intersects[0].object as any;
        if (hit.__assetData) {
          setSelectedAsset(hit.__assetData);
        }
      }
    };
    container.addEventListener('click', onClick);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();
    let laserZ = -50;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Update all Hologram Shader Materials with live uTime
      hologramMaterialsRef.current.forEach(mat => {
        if (mat.uniforms?.uTime) {
          mat.uniforms.uTime.value = elapsed;
        }
      });

      // Oscillate water height slightly
      if (waterMeshRef.current) {
        waterMeshRef.current.position.y = active3DWaterHeightRef.current + Math.sin(elapsed * 2.0) * 0.15;
      }

      // Sweep Laser
      if (laserBeamRef.current && laserScanActiveRef.current) {
        laserZ += 0.4;
        if (laserZ > 50) laserZ = -50;
        laserBeamRef.current.position.z = laserZ;
      }

      // Rotate Beacons slowly
      beaconGroup.children.forEach((c, idx) => {
        c.rotation.y = elapsed * 0.5 + idx;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update wireframe mode
  useEffect(() => {
    if (terrainMeshRef.current) {
      (terrainMeshRef.current.material as THREE.ShaderMaterial).wireframe = wireframeMode;
    }
  }, [wireframeMode]);

  // Camera Presets
  const applyPreset = (preset: 'orbital' | 'tactical' | 'ground' | 'estuary') => {
    setCameraPreset(preset);
    if (!cameraRef.current) return;
    if (preset === 'orbital') {
      cameraRef.current.position.set(0, 95, 20);
    } else if (preset === 'tactical') {
      cameraRef.current.position.set(45, 38, 55);
    } else if (preset === 'ground') {
      cameraRef.current.position.set(15, 8, 30);
    } else if (preset === 'estuary') {
      cameraRef.current.position.set(35, 18, 15);
    }
    cameraRef.current.lookAt(0, 0, 0);
  };

  return (
    <div className="h-full flex flex-col relative select-none bg-slate-950 overflow-hidden">
      {/* 3D Top Control Bar */}
      <div className="h-12 border-b border-ts-card-border bg-ts-header/90 backdrop-blur-md px-4 flex items-center justify-between z-10 text-xs">
        {/* Left: Viewport Presets */}
        <div className="flex items-center space-x-1 font-mono">
          <span className="text-ts-muted text-[11px] mr-2 hidden sm:inline">VIEWPOINT:</span>
          {(['tactical', 'orbital', 'ground', 'estuary'] as const).map(p => (
            <button
              key={p}
              onClick={() => applyPreset(p)}
              className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-bold transition-all ${
                cameraPreset === p
                  ? 'bg-ts-primary/20 text-ts-primary border border-ts-primary/40'
                  : 'text-ts-muted hover:text-ts-text bg-ts-bg/60 border border-transparent'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Center: Holographic Scan Indicator */}
        <div className="hidden md:flex items-center space-x-2 text-[11px] font-mono text-ts-accent bg-ts-bg/80 border border-ts-card-border rounded-full px-3 py-1">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>FRESNEL RIM SHADER • HORIZONTAL SCANLINES ACTIVE</span>
        </div>

        {/* Right: Holographic Toggle Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors ${
              wireframeMode ? 'bg-ts-primary/20 border-ts-primary text-ts-primary' : 'bg-ts-bg border-ts-card-border text-ts-muted'
            }`}
          >
            WIREFRAME
          </button>
          <button
            onClick={() => setLaserScanActive(!laserScanActive)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors ${
              laserScanActive ? 'bg-ts-accent/20 border-ts-accent text-ts-accent' : 'bg-ts-bg border-ts-card-border text-ts-muted'
            }`}
          >
            LASER SCAN
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div className="flex-1 relative cursor-grab active:cursor-grabbing">
        <div ref={mountRef} className="w-full h-full" />

        {/* Floating Inundation Height Slider (Bottom Right) */}
        <div className="absolute bottom-6 right-6 z-10 w-72 glass-panel-glow rounded-xl p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-ts-card-border pb-1.5">
            <div className="font-mono text-xs font-bold text-ts-primary flex items-center space-x-1.5">
              <Waves className="w-4 h-4 text-ts-primary" />
              <span>DYNAMIC INUNDATION HEIGHT</span>
            </div>
            <span className="text-xs font-mono font-bold text-ts-accent">
              +{active3DWaterHeight.toFixed(1)}m MSL
            </span>
          </div>

          <div className="space-y-1">
            <input 
              type="range"
              min="0.0"
              max="8.0"
              step="0.2"
              value={active3DWaterHeight}
              onChange={(e) => setActive3DWaterHeight(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-ts-bg rounded"
            />
            <div className="flex justify-between text-[9px] font-mono text-ts-muted">
              <span>0m (Baseline Tide)</span>
              <span>4m (100-Yr Cyclone)</span>
              <span>8m (Severe Breach)</span>
            </div>
          </div>

          <div className="text-[10px] text-ts-muted font-mono leading-tight">
            Adjust water level to simulate rising tides, flash river surges, and submerged asset boundaries.
          </div>
        </div>

        {/* Selected Asset Inspection HUD (Top Left) */}
        {selectedAsset ? (
          <div className="absolute top-6 left-6 z-10 w-80 glass-panel-glow rounded-xl p-4 shadow-2xl space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-ts-card-border pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-ts-primary animate-ping"></span>
                <span className="font-mono text-xs font-bold text-ts-text truncate">{selectedAsset.name}</span>
              </div>
              <button onClick={() => setSelectedAsset(null)} className="text-ts-muted hover:text-ts-text text-xs">✕</button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-ts-muted">Asset Type:</span>
                <span className="text-ts-primary font-bold">{selectedAsset.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ts-muted">Elevation:</span>
                <span className="text-ts-text">{selectedAsset.y}m MSL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ts-muted">Population Served:</span>
                <span className="text-ts-accent font-bold">{formatNumberIN(selectedAsset.pop)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ts-muted">Inundation Status:</span>
                <span className={active3DWaterHeight >= selectedAsset.y ? "text-ts-danger font-bold" : "text-ts-success font-bold"}>
                  {active3DWaterHeight >= selectedAsset.y ? "SUBMERGED / COMPROMISED" : "SAFE / OPERATIONAL"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('infrastructure')}
              className="w-full py-1.5 rounded-lg bg-ts-primary/20 hover:bg-ts-primary/35 border border-ts-primary/50 text-ts-primary text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <span>INSPECT IN INFRASTRUCTURE GRAPH</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="absolute top-6 left-6 z-10 glass-panel rounded-xl px-3.5 py-2 text-xs font-mono text-ts-muted flex items-center space-x-2 shadow-lg">
            <Activity className="w-3.5 h-3.5 text-ts-primary animate-pulse" />
            <span>Click any 3D asset beacon or orbit with mouse drag</span>
          </div>
        )}
      </div>
    </div>
  );
};
