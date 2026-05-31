import { useState, useRef, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { Upload, X, Box, RotateCcw, Palette, ZoomIn, Move } from 'lucide-react'

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

export default function STLViewer({ onFileLoad }: STLViewerProps) {
  const [meshData, setMeshData] = useState<MeshData | null>(null)
  const [fileName, setFileName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [previewColor, setPreviewColor] = useState(PREVIEW_COLORS[0].hex)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const controlsRef = useRef<any>(null)

  const processFile = useCallback((file: File) => {
    if (!file.name.match(/\.(stl|obj)$/i)) return
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
        onFileLoad?.(volCm3, dimsMm)
      } catch (err) {
        console.error('Error parsing 3D file:', err)
      } finally {
        setLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }, [onFileLoad])

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
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
      controlsRef.current.autoRotate = true
    }
  }

  return (
    <div className="w-full">
      {/* Viewer Canvas */}
      <div className="relative w-full h-[400px] md:h-[500px] bg-gradient-to-b from-[#1e3329] to-[#2d4a3e] rounded-xl overflow-hidden border border-white/[0.06]">
        {meshData ? (
          <>
            <Canvas camera={{ position: [15, 10, 15], fov: 40 }} shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
              <color attach="background" args={['#1e3329']} />
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={0.8} />
              <Suspense fallback={null}>
                <Scene meshData={meshData} color={previewColor} controlsRef={controlsRef} />
              </Suspense>
            </Canvas>

            {/* Top bar overlays */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              {/* File name */}
              <div className="bg-[#1e3329]/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-white/80 pointer-events-auto flex items-center gap-2">
                <Box size={12} className="text-gold" />
                <span className="max-w-[160px] truncate">{fileName}</span>
              </div>

              {/* Reset camera button */}
              <button
                onClick={resetCamera}
                className="bg-[#1e3329]/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white/70 hover:text-gold transition-colors text-xs pointer-events-auto flex items-center gap-1.5 focus-gold"
                title="Reset camera"
                aria-label="Reset camera view"
              >
                <RotateCcw size={12} />
                Reset
              </button>

              {/* Clear */}
              <button
                onClick={clearModel}
                className="bg-[#1e3329]/80 backdrop-blur-sm rounded-lg p-1.5 text-white/70 hover:text-red-400 transition-colors pointer-events-auto focus-gold"
                aria-label="Clear model"
              >
                <X size={14} />
              </button>
            </div>

            {/* Dimensions overlay */}
            <div className="absolute top-12 left-3 bg-[#1e3329]/70 backdrop-blur-sm rounded-lg px-3 py-1 text-[11px] text-white/60 pointer-events-none">
              {meshData.dimensions.x} × {meshData.dimensions.y} × {meshData.dimensions.z} mm · {meshData.volume.toFixed(1)} cm³
            </div>

            {/* Color picker overlay */}
            <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
              <div className="bg-[#1e3329]/85 backdrop-blur-sm rounded-lg px-3 py-2.5 pointer-events-auto">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Palette size={12} className="text-gold shrink-0" />
                    <span className="text-[11px] text-white/60">Preview:</span>
                    <div className="flex gap-1.5">
                      {PREVIEW_COLORS.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setPreviewColor(c.hex)}
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
    </div>
  )
}
