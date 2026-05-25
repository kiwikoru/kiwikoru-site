import { useState, useCallback } from 'react';
import { Link } from 'react-router';
import { Upload, ShoppingCart, MessageCircle, ChevronDown, Info } from 'lucide-react';

const MATERIALS = {
  pla: { name: 'PLA - Standard', basePrice: 0.08, colors: ['White', 'Black', 'Grey', 'Green', 'Blue', 'Red', 'Orange', 'Yellow'] },
  petg: { name: 'PETG - Durable', basePrice: 0.12, colors: ['White', 'Black', 'Clear', 'Blue', 'Green'] },
  asa: { name: 'ASA - Weather Resistant', basePrice: 0.15, colors: ['White', 'Black', 'Grey'] },
  tpu: { name: 'TPU - Flexible', basePrice: 0.18, colors: ['Black', 'Clear'] },
};

const INFILL_OPTIONS = [
  { value: 15, label: '15% - Light', multiplier: 0.7 },
  { value: 25, label: '25% - Standard', multiplier: 1.0 },
  { value: 50, label: '50% - Strong', multiplier: 1.4 },
  { value: 75, label: '75% - Heavy Duty', multiplier: 1.8 },
  { value: 100, label: '100% - Solid', multiplier: 2.2 },
];

const QUALITY_OPTIONS = [
  { value: 0.3, label: '0.3mm - Draft', multiplier: 0.8 },
  { value: 0.2, label: '0.2mm - Standard', multiplier: 1.0 },
  { value: 0.12, label: '0.12mm - Fine', multiplier: 1.3 },
  { value: 0.08, label: '0.08mm - Ultra Fine', multiplier: 1.8 },
];

export default function Quote() {
  const [material, setMaterial] = useState<keyof typeof MATERIALS>('pla');
  const [color, setColor] = useState('White');
  const [infill, setInfill] = useState(25);
  const [quality, setQuality] = useState(0.2);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.stl')) {
      setUploadedFile(file.name);
      setFileSize(file.size);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
      setFileSize(file.size);
    }
  }, []);

  // Simulated price calculation
  const matData = MATERIALS[material];
  const infillData = INFILL_OPTIONS.find(i => i.value === infill)!;
  const qualityData = QUALITY_OPTIONS.find(q => q.value === quality)!;

  // Estimate volume from file size (rough approximation)
  const estimatedVolume = fileSize > 0 ? (fileSize / 1024) * 0.5 : 0; // cm³ approx
  const basePrice = estimatedVolume * matData.basePrice * infillData.multiplier * qualityData.multiplier;
  const gst = basePrice * 0.15;
  const totalPrice = basePrice + gst;

  const hasFile = uploadedFile !== null;

  return (
    <main className="min-h-screen bg-kiwi-light pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-kiwi-dark">
            Instant 3D Quote
          </h1>
          <p className="mt-3 text-kiwi-base/70">
            Upload your STL file and get an instant price for your 3D print
          </p>
          <p className="mt-2 text-sm">
            <span className="text-kiwi-base/50">Prefer to discuss your project? </span>
            <Link to="/contact" className="text-kiwi-base hover:text-kiwi-gold font-medium underline">
              Get in touch
            </Link>
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left - Upload */}
          <div className="lg:col-span-3">
            {/* Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-kiwi-gold bg-kiwi-gold/5'
                  : hasFile
                  ? 'border-kiwi-base bg-kiwi-base/5'
                  : 'border-gray-300 hover:border-kiwi-base/50 bg-white'
              }`}
              onClick={() => document.getElementById('stl-upload')?.click()}
            >
              <input
                id="stl-upload"
                type="file"
                accept=".stl"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-kiwi-base/10 mx-auto mb-4">
                <Upload className="w-8 h-8 text-kiwi-base" />
              </div>
              {hasFile ? (
                <div>
                  <p className="text-kiwi-dark font-medium">{uploadedFile}</p>
                  <p className="text-kiwi-base/50 text-sm mt-1">
                    {(fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-kiwi-base/40 text-xs mt-2">Click to change file</p>
                </div>
              ) : (
                <div>
                  <p className="text-kiwi-dark font-medium">Upload your 3D model</p>
                  <p className="text-kiwi-base/50 text-sm mt-1">
                    Drag and drop an STL file, or click to browse
                  </p>
                  <p className="text-kiwi-base/30 text-xs mt-3">
                    Maximum build size: 250 x 250 x 250 mm
                  </p>
                </div>
              )}
            </div>

            {/* Material Selection */}
            <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="font-heading font-semibold text-kiwi-dark mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-kiwi-base" />
                Quote Details
              </h3>

              {/* Material */}
              <div className="mb-6">
                <label className="text-xs font-medium tracking-wider uppercase text-kiwi-base/60 mb-2 block">
                  Material
                </label>
                <div className="relative">
                  <select
                    value={material}
                    onChange={(e) => {
                      setMaterial(e.target.value as keyof typeof MATERIALS);
                      setColor(MATERIALS[e.target.value as keyof typeof MATERIALS].colors[0]);
                    }}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-kiwi-dark text-sm focus:outline-none focus:ring-2 focus:ring-kiwi-base/20"
                  >
                    {Object.entries(MATERIALS).map(([key, data]) => (
                      <option key={key} value={key}>{data.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiwi-base/40 pointer-events-none" />
                </div>
              </div>

              {/* Colour */}
              <div className="mb-6">
                <label className="text-xs font-medium tracking-wider uppercase text-kiwi-base/60 mb-2 block">
                  Colour
                </label>
                <div className="relative">
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-kiwi-dark text-sm focus:outline-none focus:ring-2 focus:ring-kiwi-base/20"
                  >
                    {matData.colors.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiwi-base/40 pointer-events-none" />
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-kiwi-base/60 hover:text-kiwi-base transition-colors mb-4"
              >
                <span className="text-xs font-medium tracking-wider uppercase">View Advanced Settings</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              {showAdvanced && (
                <div className="space-y-6 pt-2 border-t border-gray-100">
                  {/* Infill */}
                  <div>
                    <label className="text-xs font-medium tracking-wider uppercase text-kiwi-base/60 mb-2 block">
                      Infill Density
                    </label>
                    <div className="relative">
                      <select
                        value={infill}
                        onChange={(e) => setInfill(Number(e.target.value))}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-kiwi-dark text-sm focus:outline-none focus:ring-2 focus:ring-kiwi-base/20"
                      >
                        {INFILL_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiwi-base/40 pointer-events-none" />
                    </div>
                  </div>

                  {/* Layer Height */}
                  <div>
                    <label className="text-xs font-medium tracking-wider uppercase text-kiwi-base/60 mb-2 block">
                      Layer Height
                    </label>
                    <div className="relative">
                      <select
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-kiwi-dark text-sm focus:outline-none focus:ring-2 focus:ring-kiwi-base/20"
                      >
                        {QUALITY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiwi-base/40 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right - Price Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-24">
              <h3 className="font-heading font-semibold text-kiwi-dark mb-6">Estimated Price</h3>

              {hasFile ? (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-4xl font-heading font-bold text-kiwi-dark">
                      ${totalPrice.toFixed(2)}
                    </p>
                    <p className="text-kiwi-base/50 text-sm mt-1">including GST</p>
                  </div>

                  <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                    <div className="flex justify-between">
                      <span className="text-kiwi-base/60">Material</span>
                      <span className="text-kiwi-dark">{matData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-kiwi-base/60">Colour</span>
                      <span className="text-kiwi-dark">{color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-kiwi-base/60">Infill</span>
                      <span className="text-kiwi-dark">{infill}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-kiwi-base/60">Layer Height</span>
                      <span className="text-kiwi-dark">{quality}mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-kiwi-base/60">Est. Volume</span>
                      <span className="text-kiwi-dark">{estimatedVolume.toFixed(1)} cm³</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-2">
                      <span className="text-kiwi-base/60">Subtotal</span>
                      <span className="text-kiwi-dark">${basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-kiwi-base/60">GST (15%)</span>
                      <span className="text-kiwi-dark">${gst.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => alert('Quote added to cart! Proceed to checkout via WhatsApp.')}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-kiwi-gold hover:bg-kiwi-goldDark text-kiwi-dark py-3 rounded-lg font-medium transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>

                  <a
                    href="https://wa.me/640272602954?text=Hi! I got a quote for my 3D print. Can we proceed?"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Order via WhatsApp
                  </a>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-1 bg-gray-200 rounded mx-auto mb-4" />
                  <p className="text-kiwi-base/40 text-sm">
                    Upload a model to see pricing
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
