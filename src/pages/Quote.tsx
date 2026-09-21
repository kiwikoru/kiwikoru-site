import { useCallback, useState } from 'react';
import { ArrowRight, ChevronDown, Info, MessageCircle, ShoppingCart, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import STLViewer from '../components/STLViewer';
import { addPrintCartItem } from '../lib/printCart';

const MATERIALS = {
  pla: { name: 'PLA - Standard', density: 1.24, multiplier: 1 },
  petg: { name: 'PETG - Durable', density: 1.27, multiplier: 1.2 },
  abs: { name: 'ABS', density: 1.04, multiplier: 1.3 },
  asa: { name: 'ASA - Weather Resistant', density: 1.07, multiplier: 1.4 },
  tpu: { name: 'TPU - Flexible', density: 1.21, multiplier: 1.5 },
} as const;
const INFILL = [[10, '10% - Light', .7], [20, '20% - Standard', .85], [30, '30% - Functional', 1], [50, '50% - Strong', 1.25], [80, '80% - Very strong', 1.6], [100, '100% - Solid', 1.9]] as const;
const LAYERS = [[.28, '.28mm - Draft', .9], [.2, '.20mm - Standard', 1], [.16, '.16mm - Fine', 1.1], [.12, '.12mm - Detailed', 1.25], [.08, '.08mm - Ultra fine', 1.5]] as const;
const SUPPORTS = [['none', 'No supports', 1], ['minimal', 'Minimal supports', 1.08], ['standard', 'Standard supports', 1.15], ['extensive', 'Extensive supports', 1.3]] as const;
const FINISHES = [['standard', 'Standard finish', 1], ['smooth', 'Sanded / smooth', 1.3], ['premium', 'Premium: filled and painted', 1.8]] as const;
const BASE_CHARGE = 8;
const VOLUME_RATE = .35;
const MINIMUM_UNIT_PRICE = 5;
const price = (volume: number, factor: number) => Math.max((BASE_CHARGE + volume * VOLUME_RATE) * factor, MINIMUM_UNIT_PRICE);
function discountFor(quantity: number) { return quantity >= 50 ? .3 : quantity >= 25 ? .2 : quantity >= 10 ? .15 : quantity >= 5 ? .1 : quantity >= 2 ? .05 : 0; }
const selectClass = 'w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-kiwi-dark';

export default function Quote() {
  const [material, setMaterial] = useState<keyof typeof MATERIALS>('pla');
  const [infill, setInfill] = useState(20);
  const [layer, setLayer] = useState(.2);
  const [supports, setSupports] = useState('standard');
  const [finish, setFinish] = useState('standard');
  const [walls, setWalls] = useState(2);
  const [topLayers, setTopLayers] = useState(4);
  const [bottomLayers, setBottomLayers] = useState(3);
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState('White');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const [measuredVolume, setMeasuredVolume] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState<{ x: number; y: number; z: number }>();
  const [scale, setScale] = useState(1);
  const [thumbnail, setThumbnail] = useState<string>();
  const [advanced, setAdvanced] = useState(false);
  const [inCart, setInCart] = useState(false);
  const navigate = useNavigate();
  const changed = () => setInCart(false);
  const thumbnailChanged = useCallback((image: string) => setThumbnail(image), []);
  const fileSelected = (file: File) => { setUploadedFile(file.name); setModelFile(file); setFileSize(file.size); changed(); };

  const materialData = MATERIALS[material];
  const infillMultiplier = INFILL.find((item) => item[0] === infill)![2];
  const layerMultiplier = LAYERS.find((item) => item[0] === layer)![2];
  const supportMultiplier = SUPPORTS.find((item) => item[0] === supports)![2];
  const finishMultiplier = FINISHES.find((item) => item[0] === finish)![2];
  // STLViewer supplies measured scaled cm³. Its uniform scaling is scale³.
  const volume = measuredVolume ?? (fileSize > 0 ? fileSize / 1024 * .5 : 0);
  const weight = volume * materialData.density;
  const factor = materialData.multiplier * infillMultiplier * layerMultiplier * supportMultiplier * finishMultiplier * (1 + (walls - 2) * .12) * (1 + (topLayers - 4) * .04) * (1 + (bottomLayers - 3) * .04);
  const webUnitPrice = price(volume, factor);
  const discount = discountFor(quantity);
  const unitPrice = webUnitPrice * (1 - discount);
  const totalPrice = unitPrice * quantity;

  const addToCart = async () => {
    if (!modelFile || !uploadedFile) return;
    await addPrintCartItem({ id: crypto.randomUUID(), fileName: uploadedFile, file: modelFile, thumbnail, price: unitPrice, material: materialData.name, color, infill, quality: layer, estimatedVolume: volume, estimatedWeight: weight, dimensions, scale, quantity, createdAt: Date.now() });
    setInCart(true);
  };
  const number = (value: string, minimum: number) => Math.max(minimum, Number(value) || minimum);

  return <main className="min-h-screen bg-kiwi-light pb-16 pt-24"><div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
    <div className="relative mb-12 text-center"><h1 className="text-3xl font-heading font-semibold text-kiwi-dark lg:text-4xl">Instant 3D Quote</h1><p className="mt-3 text-kiwi-base/70">Upload your STL file and get an instant price for your 3D print.</p><p className="mt-2 text-sm"><span className="text-kiwi-base/50">Prefer to discuss your project? </span><Link to="/contact" className="font-medium text-kiwi-base underline">Get in touch</Link></p><button type="button" onClick={() => navigate('/cart')} className="mt-5 inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white px-4 py-2 text-sm font-semibold text-forest shadow-sm lg:absolute lg:right-0 lg:top-0"><ShoppingCart className="h-5 w-5" />Cart</button></div>
    <div className="grid gap-8 lg:grid-cols-5"><div className="lg:col-span-3">
      <STLViewer onFileSelect={fileSelected} onFileLoad={(nextVolume, nextDimensions) => { setMeasuredVolume(nextVolume); setDimensions(nextDimensions); setScale(1); changed(); }} onScaleChange={(nextVolume, nextDimensions, nextScale) => { setMeasuredVolume(nextVolume); setDimensions(nextDimensions); setScale(nextScale); changed(); }} onPreviewColorChange={(nextColor) => { setColor(nextColor); changed(); }} onThumbnailChange={thumbnailChanged} onClear={() => { setUploadedFile(null); setModelFile(null); setFileSize(0); setMeasuredVolume(null); setDimensions(undefined); setScale(1); setThumbnail(undefined); changed(); }} />
      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6"><h2 className="mb-5 flex items-center gap-2 font-heading font-semibold text-kiwi-dark"><Info className="h-4 w-4 text-kiwi-base" />Quote Details</h2><div className="grid gap-5 sm:grid-cols-2">
        <label><span className="mb-2 block text-xs font-medium uppercase tracking-wider text-kiwi-base/60">Material</span><select value={material} onChange={(event) => { setMaterial(event.target.value as keyof typeof MATERIALS); changed(); }} className={selectClass}>{Object.entries(MATERIALS).map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}</select></label>
        <label><span className="mb-2 block text-xs font-medium uppercase tracking-wider text-kiwi-base/60">Quantity</span><input type="number" min="1" max="99" value={quantity} onChange={(event) => { setQuantity(Math.min(99, Math.round(number(event.target.value, 1)))); changed(); }} className={selectClass} /></label>
      </div><button type="button" onClick={() => setAdvanced((value) => !value)} className="mt-6 flex items-center gap-2 text-sm text-kiwi-base/70"><span className="text-xs font-medium uppercase tracking-wider">Advanced print settings</span><ChevronDown className={'h-4 w-4 ' + (advanced ? 'rotate-180' : '')} /></button>
      {advanced && <div className="mt-5 grid gap-5 border-t border-gray-100 pt-5 sm:grid-cols-2">
        <label><span className="mb-2 block text-xs font-medium uppercase tracking-wider text-kiwi-base/60">Infill</span><select value={infill} onChange={(event) => { setInfill(Number(event.target.value)); changed(); }} className={selectClass}>{INFILL.map((item) => <option key={item[0]} value={item[0]}>{item[1]}</option>)}</select></label>
        <label><span className="mb-2 block text-xs font-medium uppercase tracking-wider text-kiwi-base/60">Layer height</span><select value={layer} onChange={(event) => { setLayer(Number(event.target.value)); changed(); }} className={selectClass}>{LAYERS.map((item) => <option key={item[0]} value={item[0]}>{item[1]}</option>)}</select></label>
        <label><span className="mb-2 block text-xs font-medium uppercase tracking-wider text-kiwi-base/60">Supports</span><select value={supports} onChange={(event) => { setSupports(event.target.value); changed(); }} className={selectClass}>{SUPPORTS.map((item) => <option key={item[0]} value={item[0]}>{item[1]}</option>)}</select></label>
        <label><span className="mb-2 block text-xs font-medium uppercase tracking-wider text-kiwi-base/60">Finish</span><select value={finish} onChange={(event) => { setFinish(event.target.value); changed(); }} className={selectClass}>{FINISHES.map((item) => <option key={item[0]} value={item[0]}>{item[1]}</option>)}</select></label>
        <label><span className="mb-2 block text-xs font-medium uppercase tracking-wider text-kiwi-base/60">Walls</span><input type="number" min="2" value={walls} onChange={(event) => { setWalls(number(event.target.value, 2)); changed(); }} className={selectClass} /></label>
        <label><span className="mb-2 block text-xs font-medium uppercase tracking-wider text-kiwi-base/60">Top layers</span><input type="number" min="4" value={topLayers} onChange={(event) => { setTopLayers(number(event.target.value, 4)); changed(); }} className={selectClass} /></label>
        <label><span className="mb-2 block text-xs font-medium uppercase tracking-wider text-kiwi-base/60">Bottom layers</span><input type="number" min="3" value={bottomLayers} onChange={(event) => { setBottomLayers(number(event.target.value, 3)); changed(); }} className={selectClass} /></label>
      </div>}</section>
    </div><aside className="lg:col-span-2"><section className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6"><div className="mb-6 flex items-center justify-between"><h2 className="font-heading font-semibold text-kiwi-dark">Estimated Price</h2><span className="text-xs font-semibold text-forest/70">{inCart ? 'Added to cart' : 'Cart empty'}</span></div>
    {uploadedFile ? <div className="space-y-4"><div className="py-4 text-center"><p className="text-4xl font-heading font-bold text-kiwi-dark">{'NZ$'}{totalPrice.toFixed(2)}</p><p className="mt-1 text-sm text-kiwi-base/50">total for {quantity} {quantity === 1 ? 'unit' : 'units'}</p></div><div className="space-y-2 border-t border-gray-100 pt-4 text-sm"><div className="flex justify-between"><span>Material</span><span>{materialData.name}</span></div><div className="flex justify-between"><span>Scale</span><span>{Math.round(scale * 100)}%</span></div><div className="flex justify-between"><span>Volume per unit</span><span>{volume.toFixed(1)} cm³</span></div><div className="flex justify-between"><span>Estimated weight</span><span>{weight.toFixed(1)} g</span></div><div className="flex justify-between"><span>Web unit price</span><span>{'NZ$'}{webUnitPrice.toFixed(2)}</span></div><div className="flex justify-between"><span>Quantity discount</span><span>{(discount * 100).toFixed(0)}%</span></div><div className="flex justify-between border-t border-gray-100 pt-2 font-bold"><span>Final unit price</span><span>{'NZ$'}{unitPrice.toFixed(2)}</span></div><div className="flex justify-between font-bold"><span>Total</span><span>{'NZ$'}{totalPrice.toFixed(2)}</span></div></div>
    <button onClick={() => void addToCart()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3.5 font-bold text-forest-dark"><ShoppingCart className="h-4 w-4" />{inCart ? 'Added to cart' : 'Add to cart'}</button>{inCart && <div className="rounded-xl border border-forest/15 bg-off-white p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-forest-dark">{uploadedFile}</p><p className="mt-1 text-xs text-forest/60">{materialData.name} · {color} · {quantity} units</p></div><button type="button" onClick={() => setInCart(false)} className="text-red-600" aria-label="Remove item from cart"><Trash2 className="h-4 w-4" /></button></div><button onClick={() => navigate('/cart')} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 font-bold text-white">Open cart <ArrowRight className="h-4 w-4" /></button></div>}<a href="https://wa.me/64274365339?text=Hi%20KiwiKoru!%20I%20have%20a%20project%20in%20mind.%20How%20can%20we%20get%20started%3F" target="_blank" rel="noopener noreferrer" className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-medium text-white"><MessageCircle className="h-4 w-4" />Discuss the design via WhatsApp</a></div> : <div className="py-8 text-center"><div className="mx-auto mb-4 h-1 w-12 rounded bg-gray-200" /><p className="text-sm text-kiwi-base/40">Upload a model to see pricing</p></div>}</section></aside></div>
  </div></main>;
}
