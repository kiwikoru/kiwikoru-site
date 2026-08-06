import { useState, useRef, useCallback, Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { Upload, X, Box, RotateCcw, Palette, ZoomIn, Move, Scaling } from 'lucide-react'

interface MeshData {
  geometry: THREE.BufferGeometry
  volume: number
  dimensions: { x: number; y: number; z: number }
}

const PREVIEW_COLORS = [
  { name: 'White',  hex: '#f0f0f0' },
  { name: 'Black',  hex: '#2a2a2a' },
  { name: 'Red',    hex: '#c44b4b' },
  { name: 'Blue',   hex: '#4b7cc4' },
  { name: 'Green',  hex: '#4bc47c' },
  { name: 'Yellow', hex: '#c4b84b' },
]

interface STLViewerProps {
  onFileLoad?: (volume: number, dimensions: { x: number; y: number; z: number }) => void
  onFileSelect?: (file: File) => void
  onClear?: () => void
  onScaleChange?: (volume: number, dimensions: { x: number; y: number; z: number }, scale: number) => void
  onPreviewColorChange?: (color: string) => void
  onThumbnailChange?: (thumbnail: string) => void
}

function Model({ meshData, color }: { meshData: MeshData; color: string }) {
  return (
    <mesh geometry={meshData.geometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
    </mesh>
  )
}

function Scene({ meshData, color, controlsRef }: { meshData: MeshData; color: string; controlsRef: React.RefObject<any> }) {
  return (
    <>
      <Stage environment="city" intensity={0.5} castShadow={false} shadows={false}>
        <Model meshData={meshData} color={color} />
      </Stage>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        autoRotate
        autoRotateSpeed={1.5}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  )
}

const AXES = {
  x: { label: 'X', className: 'text-red-400', ring: 'focus:border-red-400' },
  y: { label: 'Y', className: 'text-emerald-400', ring: 'focus:border-emerald-400' },
  z: { label: 'Z', className: 'text-sky-400', ring: 'focus:border-sky-400' },
} as const

export default function STLViewer({ onFileLoad, onFileSelect, onClear, onScaleChange, onPreviewColorChange, onThumbnailChange }: STLViewerProps) {
  const [meshData, setMeshData] = useState<MeshData | null>(null)
  const [fileName, setFileName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [previewColor, setPreviewColor] = useState(PREVIEW_COLORS[0].hex)
  const [uniformScale, setUniformScale] = useState(1)
  const [dimensionInputs, setDimensionInputs] = useState({ x: '', y: '', z: '' })
  const [percentInput, setPercentInput] = useState('100')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const controlsRef = useRef<any>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const processFile = useCallback((file: File) => {
    if (!file.name.match(/\.(stl|obj)$/i)) return
    onFileSelect?.(file)
    setLoading(true)
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const loader = new STLLoader()
        const arrayBuffer = e.target?.result as ArrayBuffer
        const geometry = loader.parse(arrayBuffer)
        geometry.computeBoundingBox()

        // Calculate dimensions from original bounding box (before scaling)
        const box = geometry.boundingBox!
        const size = new THREE.Vector3()
        box.getSize(size)

        // Center the geometry
        geometry.center()

        // Calculate dimensions in mm (original)
        const dimsMm = {
          x: +size.x.toFixed(1),
          y: +size.y.toFixed(1),
          z: +size.z.toFixed(1),
        }

        // Auto-scale to fit in view
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = maxDim > 0 ? 12 / maxDim : 1
        geometry.scale(scale, scale, scale)

        // Calculate volume using tetrahedron method (on original unscaled geometry)
        const tempGeom = geometry.clone()
        tempGeom.scale(1/scale, 1/scale, 1/scale) // back to original
        const positionAttr = tempGeom.getAttribute('position')
        const positions = positionAttr.array as Float32Array
        let volume = 0
        for (let i = 0; i < positions.length; i += 9) {
          const ax = positions[i],     ay = positions[i + 1], az = positions[i + 2]
          const bx = positions[i + 3], by = positions[i + 4], bz = positions[i + 5]
          const cx = positions[i + 6], cy = positions[i + 7], cz = positions[i + 8]
          volume += (
            ax * (by * cz - bz * cy) +
            bx * (cy * az - cz * ay) +
            cx * (ay * bz - az * by)
          ) / 6
        }
        tempGeom.dispose()

        const volCm3 = Math.abs(volume) / 1000

        setMeshData({ geometry, volume: volCm3, dimensions: dimsMm })
        setUniformScale(1)
        setDimensionInputs({ x: String(dimsMm.x), y: String(dimsMm.y), z: String(dimsMm.z) })
        setPercentInput('100')
        onFileLoad?.(volCm3, dimsMm)
      } catch (err) {
        console.error('Error parsing 3D file:', err)
      } finally {
        setLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }, [onFileLoad, onFileSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const clearModel = () => {
    setMeshData(null)
    setFileName('')
    setUniformScale(1)
    setDimensionInputs({ x: '', y: '', z: '' })
    setPercentInput('100')
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClear?.()
  }

  const scaledDimensions = meshData ? {
    x: +(meshData.dimensions.x * uniformScale).toFixed(1),
    y: +(meshData.dimensions.y * uniformScale).toFixed(1),
    z: +(meshData.dimensions.z * uniformScale).toFixed(1),
  } : null
  const scaledVolume = meshData ? meshData.volume * Math.pow(uniformScale, 3) : 0

  const applyScale = (nextScale: number, syncPercentInput = true) => {
    if (!meshData) return
    const safeScale = Math.max(0.05, Math.min(10, nextScale))
    const nextDimensions = {
      x: +(meshData.dimensions.x * safeScale).toFixed(1),
      y: +(meshData.dimensions.y * safeScale).toFixed(1),
      z: +(meshData.dimensions.z * safeScale).toFixed(1),
    }
    setUniformScale(safeScale)
    setDimensionInputs({ x: String(nextDimensions.x), y: String(nextDimensions.y), z: String(nextDimensions.z) })
    if (syncPercentInput) setPercentInput(String(Math.round(safeScale * 100)))
    onScaleChange?.(meshData.volume * Math.pow(safeScale, 3), nextDimensions, safeScale)
  }

  const parseDecimal = (rawValue: string) => Number(rawValue.replace(',', '.'))

  const updateScaleFromAxis = (axis: keyof typeof AXES, rawValue: string) => {
    setDimensionInputs(current => ({ ...current, [axis]: rawValue }))
    if (!meshData || rawValue.trim() === '') return
    const nextDimension = parseDecimal(rawValue)
    if (!Number.isFinite(nextDimension) || nextDimension <= 0) return
    const nextScale = Math.max(0.05, Math.min(10, nextDimension / meshData.dimensions[axis]))
    setUniformScale(nextScale)
    const nextDimensions = {
      x: +(meshData.dimensions.x * nextScale).toFixed(1),
      y: +(meshData.dimensions.y * nextScale).toFixed(1),
      z: +(meshData.dimensions.z * nextScale).toFixed(1),
    }
    setDimensionInputs(current => ({ ...current, ...Object.fromEntries(Object.entries(nextDimensions).filter(([key]) => key !== axis)) }))
    setPercentInput(String(Math.round(nextScale * 100)))
    onScaleChange?.(meshData.volume * Math.pow(nextScale, 3), nextDimensions, nextScale)
  }

  const updateScaleFromPercent = (rawValue: string) => {
    setPercentInput(rawValue)
    if (rawValue.trim() === '') return
    const percent = parseDecimal(rawValue)
    if (!Number.isFinite(percent) || percent <= 0) return
    applyScale(percent / 100, false)
  }

  useEffect(() => {
    if (!meshData || !onThumbnailChange) return
    const timer = window.setTimeout(() => {
      try { if (canvasRef.current) onThumbnailChange(canvasRef.current.toDataURL('image/webp', .72)) } catch { /* Thumbnail is optional. */ }
    }, 650)
    return () => window.clearTimeout(timer)
  }, [meshData, previewColor, onThumbnailChange])

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
      controlsRef.current.autoRotate = true
    }
  }

  return (
    <div className="w-full">
      {/* Viewer Canvas */}
      <div className="relative w-full h-[400px] md:h-[500px] bg-gradient-to-b from-[#253126] to-[#3f4a2f] rounded-xl overflow-hidden border border-white/[0.06]">
        {meshData ? (
          <>
            <Canvas camera={{ position: [15, 10, 15], fov: 40 }} shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }} onCreated={({ gl }) => { canvasRef.current = gl.domElement }}>
              <color attach="background" args={['#253126']} />
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={0.8} />
              <Suspense fallback={null}>
                <Scene meshData={meshData} color={previewColor} controlsRef={controlsRef} />
              </Suspense>
            </Canvas>

            {/* Top bar overlays */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              {/* File name */}
              <div className="bg-[#253126]/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-white/80 pointer-events-auto flex items-center gap-2">
                <Box size={12} className="text-gold" />
                <span className="max-w-[160px] truncate">{fileName}</span>
              </div>

              {/* Reset camera button */}
              <button
                onClick={resetCamera}
                className="bg-[#253126]/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white/70 hover:text-gold transition-colors text-xs pointer-events-auto flex items-center gap-1.5 focus-gold"
                title="Reset camera"
                aria-label="Reset camera view"
              >
                <RotateCcw size={12} />
                Reset
              </button>

              {/* Clear */}
              <button
                onClick={clearModel}
                className="bg-[#253126]/80 backdrop-blur-sm rounded-lg p-1.5 text-white/70 hover:text-red-400 transition-colors pointer-events-auto focus-gold"
                aria-label="Clear model"
              >
                <X size={14} />
              </button>
            </div>

            {/* Dimensions overlay */}
            <div className="absolute top-12 left-3 bg-[#253126]/70 backdrop-blur-sm rounded-lg px-3 py-1 text-[11px] text-white/60 pointer-events-none">
              <span className="font-semibold text-red-400">X</span> {scaledDimensions?.x} ×{' '}
              <span className="font-semibold text-emerald-400">Y</span> {scaledDimensions?.y} ×{' '}
              <span className="font-semibold text-sky-400">Z</span> {scaledDimensions?.z} mm · {scaledVolume.toFixed(1)} cm³
            </div>

            {/* Color picker overlay */}
            <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
              <div className="bg-[#253126]/85 backdrop-blur-sm rounded-lg px-3 py-2.5 pointer-events-auto">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Palette size={12} className="text-gold shrink-0" />
                    <span className="text-[11px] text-white/60">Preview:</span>
                    <div className="flex gap-1.5">
                      {PREVIEW_COLORS.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => { setPreviewColor(c.hex); onPreviewColorChange?.(c.name) }}
                          className={`w-5 h-5 rounded-full border-2 transition-all duration-200 focus-gold ${
                            previewColor === c.hex ? 'border-gold scale-110' : 'border-white/20 hover:border-white/50'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                          aria-label={`Preview color: ${c.name}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-white/40 italic hidden sm:inline">
                    Colors are illustrative only
                  </span>
                </div>
                <p className="text-[10px] text-white/40 italic mt-1.5 sm:hidden">
                  Preview colors are illustrative only and may differ from final printed products.
                </p>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              dragOver ? 'bg-gold/10' : 'hover:bg-white/[0.03]'
            }`}
            role="button"
            tabIndex={0}
            aria-label="Upload 3D model to preview"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
          >
            <input ref={fileInputRef} type="file" accept=".stl,.obj" onChange={handleFileSelect} className="hidden" />
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                <p className="text-white/60 text-sm">Loading model...</p>
              </div>
            ) : (
              <>
                <Upload size={48} className={`mb-4 transition-colors duration-300 ${dragOver ? 'text-gold' : 'text-white/25'}`} />
                <p className="text-white/60 text-sm font-medium">Upload your STL or OBJ to preview</p>
                <p className="text-white/35 text-xs mt-1.5">Drag & drop or click to browse</p>
                <div className="mt-5 bg-white/5 rounded-lg px-4 py-2.5 border border-white/[0.06]">
                  <p className="text-[11px] text-white/40 text-center">
                    Upload your model and preview it before requesting an estimate
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Color note */}
      {meshData && (
        <p className="mt-2 text-[11px] text-charcoal-light/70 italic text-center">
          Preview colors are illustrative only and may differ from final printed products.
        </p>
      )}

      {/* Controls hint */}
      {meshData && (
        <div className="mt-1.5 flex items-center justify-center gap-4 text-[11px] text-charcoal-light/50">
          <span className="flex items-center gap-1"><RotateCcw size={10} /> Auto-rotate</span>
          <span className="flex items-center gap-1"><Move size={10} /> Drag to orbit</span>
          <span className="flex items-center gap-1"><ZoomIn size={10} /> Scroll to zoom</span>
        </div>
      )}

      {meshData && scaledDimensions && (
        <div className="mt-4 rounded-xl border border-forest/10 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-forest/[0.06] p-2 text-forest"><Scaling size={17} /></div>
            <div>
              <p className="text-sm font-semibold text-charcoal">Uniform print scale</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-charcoal-light">Change any axis. The other two remain proportional and the estimate updates automatically.</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {(Object.keys(AXES) as Array<keyof typeof AXES>).map((axis) => (
              <label key={axis} className="block">
                <span className={`mb-1 block text-[11px] font-bold ${AXES[axis].className}`}>{AXES[axis].label} axis</span>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={dimensionInputs[axis]}
                    onChange={(event) => updateScaleFromAxis(axis, event.target.value)}
                    onBlur={() => setDimensionInputs(current => ({ ...current, [axis]: String(scaledDimensions[axis]) }))}
                    className={`w-full rounded-lg border border-border-light bg-off-white px-2.5 py-2 pr-8 text-sm font-semibold text-charcoal outline-none transition ${AXES[axis].ring}`}
                    aria-label={`${AXES[axis].label} dimension in millimetres`}
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-charcoal-light">mm</span>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-forest/[0.04] px-3 py-2 text-[11px]">
            <label className="flex items-center gap-2 text-charcoal-light"><span>Uniform scale</span><span className="relative"><input type="text" inputMode="decimal" value={percentInput} onChange={event => updateScaleFromPercent(event.target.value)} onBlur={() => setPercentInput(String(Math.round(uniformScale * 100)))} className="w-20 rounded-md border border-forest/15 bg-white py-1.5 pl-2 pr-6 text-right font-bold text-forest outline-none focus:border-gold" aria-label="Uniform scale percentage"/><b className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-forest/60">%</b></span></label>
            <span className="font-semibold text-forest">{uniformScale < 1 ? `${Math.round((1 - uniformScale) * 100)}% smaller` : uniformScale > 1 ? `${Math.round((uniformScale - 1) * 100)}% larger` : 'Original size'} · {scaledVolume.toFixed(1)} cm³</span>
          </div>
        </div>
      )}
    </div>
  )
}
