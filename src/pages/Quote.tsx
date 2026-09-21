import { useCallback, useState } from 'react';
import { ArrowRight, ChevronDown, Info, MessageCircle, ShoppingCart, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import STLViewer from '../components/STLViewer';
import { addPrintCartItem } from '../lib/printCart';

const MATERIALS = {
  pla: { name: 'PLA', density: 1.24, multiplier: 1 },
  petg: { name: 'PETG', density: 1.27, multiplier: 1.2 },
  abs: { name: 'ABS', density: 1.04, multiplier: 1.3 },
  asa: { name: 'ASA', density: 1.07, multiplier: 1.4 },
  tpu: { name: 'TPU', density: 1.21, multiplier: 1.5 },
} as const;

const INFILL_OPTIONS = [
  { value: 10, label: '10% - Light', multiplier: 0.7 },
  { value: 20, label: '20% - Standard', multiplier: 0.85 },
  { value: 30, label: '30% - Functional', multiplier: 1 },
  { value: 50, label: '50% - Strong', multiplier: 1.25 },
  { value: 80, label: '80% - Very strong', multiplier: 1.6 },
  { value: 100, label: '100% - Solid', multiplier: 1.9 },
];

const QUALITY_OPTIONS = [
  { value: 0.28, label: '0.28mm - Fast', multiplier: 0.9 },
  { value: 0.2, label: '0.20mm - Standard', multiplier: 1 },
  { value: 0.16, label: '0.16mm - Fine', multiplier: 1.1 },
  { value: 0.12, label: '0.12mm - Detailed', multiplier: 1.25 },
  { value: 0.08, label: '0.08mm - Ultra fine', multiplier: 1.5 },
];

const SUPPORT_OPTIONS = [
  { value: 'none', label: 'No supports', multiplier: 1 },
  { value: 'minimal', label: 'Minimal supports', multiplier: 1.08 },
  { value: 'standard', label: 'Standard supports', multiplier: 1.15 },
  { value: 'extensive', label: 'Extensive supports', multiplier: 1.3 },
];

const FINISH_OPTIONS = [
  { value: 'standard', label: 'Standard finish', multiplier: 1 },
  { value: 'smooth', label: 'Sanded / smooth', multiplier: 1.3 },
  { value: 'premium', label: 'Premium: filled and painted', multiplier: 1.8 },
];

const BASE_CHARGE = 8;
const VOLUME_RATE = 0.35;
const MINIMUM_UNIT_PRICE = 5;

function quantityDiscount(quantity: number) {
  if (quantity >= 50) return 0.3;
  if (quantity >= 25) return 0.2;
  if (quantity >= 10) return 0.15;
  if (quantity >= 5) return 0.1;
  if (quantity >= 2) return 0.05;
  return 0;
}

function SelectField<T extends string | number>({ label, value, onChange, options }: { label: string; value: T; onChange: (value: T) => void; options: Array<{ value: T; label: string }> }) {
  return <label className="block"><span className="mb-2 block text-xs font-medium uppercase tracking-wider text-kiwi-base/60">{label}</span><div className="relative"><select value={value} onChange={event => onChange((typeof value === 'number' ? Number(event.target.value) : event.target.value) as T)} className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-kiwi-dark focus:outline-none focus:ring-2 focus:ring-kiwi-base/20">{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kiwi-base/40" /></div></label>;
}

export default function Quote() {
  const [material, setMaterial] = useState<keyof typeof MATERIALS>('pla');
  const [color, setColor] = useState('White');
  const [infill, setInfill] = useState(20);
  const [quality, setQuality] = useState(0.2);
  const [supports, setSupports] = useState('standard');
  const [finish, setFinish] = useState('standard');
  const [walls, setWalls] = useState(2);
  const [topLayers, setTopLayers] = useState(4);
  const [bottomLayers, setBottomLayers] = useState(3);
  const [quantity, setQuantity] = useState(1);
  const [extraCharges, setExtraCharges] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [measuredVolume, setMeasuredVolume] = useState<number | null>(null);
  const [modelDimensions, setModelDimensions] = useState<{ x: number; y: number; z: number }>();
  const [modelScale, setModelScale] = useState(1);
  const [thumbnail, setThumbnail] = useState<string>();
  const navigate = useNavigate();
  const changed = () => setInCart(false);
  const handleThumbnail = useCallback((image: string) => setThumbnail(image), []);
  const handleModelFile = (file: File) => { setUploadedFile(file.name); setFileSize(file.size); setModelFile(file); changed(); };

  const materialData = MATERIALS[material];
  const infillData = INFILL_OPTIONS.find(option => option.value === infill)!;
  const qualityData = QUALITY_OPTIONS.find(option => option.value === quality)!;
  const supportData = SUPPORT_OPTIONS.find(option => option.value === supports)!;
  const finishData = FINISH_OPTIONS.find(option => option.value === finish)!;
  const estimatedVolume = measuredVolume ?? (fileSize > 0 ? fileSize / 1024 * 0.5 : 0);
  const estimatedWeight = estimatedVolume * materialData.density;
  const wallsFactor = 1 + (walls - 2) * 0.12;
  const topFactor = 1 + (topLayers - 4) * 0.04;
  const bottomFactor = 1 + (bottomLayers - 3) * 0.04;
  const combinedFactor = materialData.multiplier * infillData.multiplier * wallsFactor * topFactor * bottomFactor * qualityData.multiplier * supportData.multiplier * finishData.multiplier;
  const webUnitPrice = Math.max((BASE_CHARGE + estimatedVolume * VOLUME_RATE) * combinedFactor, MINIMUM_UNIT_PRICE);
  const discount = quantityDiscount(quantity);
  const finalUnitPrice = webUnitPrice * (1 - discount);
  const totalPrice = finalUnitPrice * quantity + extraCharges;
  const hasFile = uploadedFile !== null;

  const addCurrentItem = async () => {
    if (!modelFile || !uploadedFile) return;
    await addPrintCartItem({ id: crypto.randomUUID(), fileName: uploadedFile, file: modelFile, thumbnail, price: finalUnitPrice, material: materialData.name, color, infill, quality, estimatedVolume, estimatedWeight, dimensions: modelDimensions, scale: modelScale, quantity, createdAt: Date.now() });
    setInCart(true);
  };

  return <main className="bg-kiwi-light pb-16 pt-24"><div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"><div className="relative mb-12 text-center"><h1 className="text-3xl font-semibold text-kiwi-dark lg:text-4xl">Instant 3D Quote</h1><p className="mt-3 text-kiwi-base/70">Upload your STL file and get an instant price for your 3D print.</p><p className="mt-2 text-sm"><span className="text-kiwi-base/50">Prefer to discuss your project? </span><Link to="/contact" className="font-medium text-kiwi-base underline">Get in touch</Link></p><button type="button" onClick={() => navigate('/cart')} className="mt-5 inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white px-4 py-2 text-sm font-semibold text-forest shadow-sm lg:absolute lg:right-0 lg:top-0"><ShoppingCart className="h-5 w-5" />Cart</button></div><div className="grid gap-8 lg:grid-cols-5"><div className="lg:col-span-3"><STLViewer onFileSelect={handleModelFile} onFileLoad={(volume, dimensions) => { setMeasuredVolume(volume); setModelDimensions(dimensions); setModelScale(1); changed(); }} onScaleChange={(volume, dimensions, scale) => { setMeasuredVolume(volume); setModelDimensions(dimensions); setModelScale(scale); changed(); }} onPreviewColorChange={nextColor => { setColor(nextColor); changed(); }} onThumbnailChange={handleThumbnail} onClear={() => { setUploadedFile(null); setModelFile(null); setFileSize(0); setMeasuredVolume(null); setModelDimensions(undefined); setModelScale(1); setThumbnail(undefined); changed(); }} /><section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6"><h2 className="mb-5 flex items-center gap-2 font-semibold text-kiwi-dark"><Info className="h-4 w-4 text-kiwi-base" />Quote details</h2><div className="grid gap-5 sm:grid-cols-2"><SelectField label="Material" value={material} onChange={value => { setMaterial(value); changed(); }} options={Object.entries(MATERIALS).map(([value, item]) => ({ value: value as keyof typeof MATERIALS, label: item.name }))} /><label><span className="mb-2 block text-xs font-medium uppercase tracking-wider text-kiwi-base/60">Quantity</span><input type="number" min="1" max="99" value={quantity} onChange={event => { setQuantity(Math.max(1, Math.min(99, Math.round(Number(event.target.value) || 1))); changed(); }} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-kiwi-dark" /></label></div><button onClick={() => setShowAdvanced(value => !value)} className="mt-6 flex items-center gap-2 text-sm text-kiwi-base/70"><span className="text-xs font-medium uppercase tracking-wider">Advanced print settings</span><ChevronDown className={`h-4 w-4 ${showAdvanced ? 'rotate-180' : ''}`} /></button>{showAdvanced && <div className="mt-5 grid gap-5 border-t border-gray-100 pt-5 sm:grid-cols-2"><SelectField label="Infill" value={infill} onChange={value => { setInfill(value); changed(); }} options={INFILL_OPTIONS} /><SelectField label="Layer height" value={quality} onChange={value => { setQuality(value); changed(); }} options={QUALITY_OPTIONS} /><SelectField label="Supports" value={supports} onChange={value => { setSupports(value); changed(); }} options={SUPPORT_OPTIONS} /><SelectField label="Finish" value={finish} onChange={value => { setFinish(value); changed(); }} options={FINISH_OPTIONS} /><label><span className="mb-2 block text-xs font-medium uppercase tracking-wider text-kiwi-base/60">Walls</span><input type="number" min="2" value={walls} onChange={event => { setWalls(Math.max(2, Number(event.target.value) || 2)); changed(); }} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-kiwi-dark" /></label><label><span className="mb-2 block text-xs font-medium uppercase tracking-wider text-kiwi-base/60">Top layers</span><input type="number" min="4" value={topLayers} onChange={event => { setTopLayers(Math.max(4, Number(event.target.value) || 4)); changed(); }} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-kiwi-dark" /></label><label><span className="mb-2 block text-xs font-medium uppercase tracking-wider text-kiwi-base/60">Bottom layers</span><input type="number" min="3" value={bottomLayers} onChange={event => { setBottomLayers(Math.max(3, Number(event.target.value) || 3)); changed(); }} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-kiwi-dark" /></label><label><span className="mb-2 block text-xs font-medium uppercase tracking-wider text-kiwi-base/60">Extra order costs (NZD)</span><input type="number" min="0" step="0.01" value={extraCharges} onChange={event => { setExtraCharges(Math.max(0, Number(event.target.value) || 0)); changed(); }} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-kiwi-dark" /></label></div>}</section></div><aside className="lg:col-span-2"><section className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6"><div className="mb-6 flex items-center justify-between"><h2 className="font-semibold text-kiwi-dark">Estimated price</h2><span className="text-xs font-semibold text-forest/70">{inCart ? 'Added to cart' : 'Cart empty'}</span></div>{hasFile ? <div className="space-y-4"><div className="py-4 text-center"><p className="text-4xl font-bold text-kiwi-dark">NZ${totalPrice.toFixed(2)}</p><p className="mt-1 text-sm text-kiwi-base/50">total for {quantity} {quantity === 1 ? 'unit' : 'units'}</p></div><div className="space-y-2 border-t border-gray-100 pt-4 text-sm"><div className="flex justify-between"><span className="text-kiwi-base/60">Material</span><span>{materialData.name}</span></div><div className="flex justify-between"><span className="text-kiwi-base/60">Scale</span><span>{Math.round(modelScale * 100)}%</span></div><div className="flex justify-between"><span className="text-kiwi-base/60">Volume per unit</span><span>{estimatedVolume.toFixed(1)} cm³</span></div><div className="flex justify-between"><span className="text-kiwi-base/60">Web unit price</span><span>NZ${webUnitPrice.toFixed(2)}</span></div><div className="flex justify-between"><span className="text-kiwi-base/60">Quantity discount</span><span>{(discount * 100).toFixed(0)}%</span></div><div className="flex justify-between"><span className="text-kiwi-base/60">Final unit price</span><span>NZ${finalUnitPrice.toFixed(2)}</span></div><div className="flex justify-between border-t border-gray-100 pt-2 font-bold"><span>Total</span><span>NZ${totalPrice.toFixed(2)}</span></div></div><button onClick={() => void addCurrentItem()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3.5 font-bold text-forest-dark"><ShoppingCart className="h-4 w-4" />{inCart ? 'Added to cart' : 'Add to cart'}</button>{inCart && <div className="rounded-xl border border-forest/15 bg-off-white p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-forest-dark">{uploadedFile}</p><p className="mt-1 text-xs text-forest/60">{materialData.name} · {color} · {quantity} units</p></div><button type="button" onClick={() => setInCart(false)} className="text-red-600" aria-label="Remove item from cart"><Trash2 className="h-4 w-4" /></button></div><button onClick={() => navigate('/cart')} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 font-bold text-white">Open cart <ArrowRight className="h-4 w-4" /></button></div>}<a href="https://wa.me/64274365339?text=Hi%20KiwiKoru!%20I%20have%20a%20project%20in%20mind.%20How%20can%20we%20get%20started%3F" target="_blank" rel="noopener noreferrer" className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-medium text-white"><MessageCircle className="h-4 w-4" />Discuss the design via WhatsApp</a></div> : <div className="py-8 text-center"><div className="mx-auto mb-4 h-1 w-12 rounded bg-gray-200" /><p className="text-sm text-kiwi-base/40">Upload a model to see pricing</p></div>}</section></aside></div></div></main>;
}

