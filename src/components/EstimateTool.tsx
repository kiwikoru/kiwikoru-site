import { useState, useMemo } from 'react'
import {
  Calculator, AlertTriangle, MessageSquare, ChevronDown, ChevronUp,
  HelpCircle, Minus, Plus, Briefcase, Clock,
} from 'lucide-react'

/* ── Types ── */
interface ModelInfo {
  volume: number
  dimensions: { x: number; y: number; z: number }
}

interface EstimateToolProps {
  modelInfo?: ModelInfo
  onContact?: () => void
}

/* ── Pricing Constants ── */
const BASE_FEE = 8
const COST_PER_CM3 = 0.35

/* ── Materials ── */
const MATERIALS = {
  pla:  { key: 'pla',  name: 'PLA',  label: 'PLA - Standard',             mult: 1.00, colors: ['White','Black','Grey','Red','Blue','Green','Yellow','Orange'] },
  petg: { key: 'petg', name: 'PETG', label: 'PETG - Durable (+20%)',     mult: 1.20, colors: ['White','Black','Clear','Red','Blue'] },
  asa:  { key: 'asa',  name: 'ASA',  label: 'ASA - Impact Res. (+35%)',  mult: 1.35, colors: ['White','Black','Red','Blue','Silver'] },
  tpu:  { key: 'tpu',  name: 'TPU',  label: 'TPU - Flexible (+50%)',     mult: 1.50, colors: ['Black','Red','Blue','Green','Yellow'] },
}

/* ── Infill ── */
const INFILL_OPTS = [
  { value: 10,  label: '10% - Economy',  mult: 1.00 },
  { value: 20,  label: '20% - Standard', mult: 1.10 },
  { value: 50,  label: '50% - Strong',   mult: 1.35 },
  { value: 100, label: '100% - Solid',   mult: 1.80 },
]

/* ── Advanced Options ── */
const WALL_OPTS      = [{ v: 2, m: 1.00 }, { v: 3, m: 1.08 }, { v: 4, m: 1.15 }, { v: 5, m: 1.25 }]
const TOP_OPTS       = [{ v: 3, m: 1.00 }, { v: 4, m: 1.03 }, { v: 5, m: 1.06 }, { v: 6, m: 1.09 }, { v: 8, m: 1.15 }]
const BOTTOM_OPTS    = [{ v: 3, m: 1.00 }, { v: 4, m: 1.03 }, { v: 5, m: 1.06 }, { v: 6, m: 1.09 }, { v: 8, m: 1.15 }]
const LAYER_OPTS     = [{ v: 0.28, label: '0.28 mm (Fast)',       m: 0.90 }, { v: 0.20, label: '0.20 mm (Standard)',   m: 1.00 }, { v: 0.12, label: '0.12 mm (Fine)',       m: 1.35 }]
const SUPPORT_OPTS   = [{ v: 'none',     label: 'None',                 m: 1.00 }, { v: 'plate',    label: 'Touching Build Plate', m: 1.10 }, { v: 'every',    label: 'Everywhere',           m: 1.25 }]
const FINISH_OPTS    = [{ v: 'standard', label: 'Standard',             m: 1.00 }, { v: 'high',     label: 'High Quality',         m: 1.15 }, { v: 'present',  label: 'Presentation Quality', m: 1.35 }]

/* ── Bulk Discount ── */
function bulkDiscount(qty: number): number {
  if (qty >= 50) return 0.75
  if (qty >= 25) return 0.80
  if (qty >= 10) return 0.85
  if (qty >= 5)  return 0.90
  if (qty >= 2)  return 0.95
  return 1.00
}
function bulkLabel(qty: number): string {
  if (qty >= 50) return '25% off'
  if (qty >= 25) return '20% off'
  if (qty >= 10) return '15% off'
  if (qty >= 5)  return '10% off'
  if (qty >= 2)  return '5% off'
  return 'No discount'
}

/* ── Print Time Estimate ── */
function printTimeLabel(qty: number): string {
  if (qty >= 25) return 'Custom production schedule'
  if (qty >= 10) return 'Approx. 5-10 days'
  if (qty >= 2)  return 'Approx. 2-5 days'
  return 'Approx. 1-2 days'
}

/* ── Main Price Calculation ── */
function calcPrice(vol: number, mk: string, inf: number, w: number, t: number, b: number, lh: number, sup: string, fin: string, qty: number) {
  const mat = Object.values(MATERIALS).find((m) => m.key === mk) ?? MATERIALS.pla
  const i = INFILL_OPTS.find((o) => o.value === inf) ?? INFILL_OPTS[1]
  const wm = WALL_OPTS.find((o) => o.v === w) ?? WALL_OPTS[0]
  const tm = TOP_OPTS.find((o) => o.v === t) ?? TOP_OPTS[0]
  const bm = BOTTOM_OPTS.find((o) => o.v === b) ?? BOTTOM_OPTS[0]
  const lm = LAYER_OPTS.find((o) => o.v === lh) ?? LAYER_OPTS[1]
  const sm = SUPPORT_OPTS.find((o) => o.v === sup) ?? SUPPORT_OPTS[0]
  const fm = FINISH_OPTS.find((o) => o.v === fin) ?? FINISH_OPTS[0]
  const bd = bulkDiscount(qty)

  const unitPrice = (BASE_FEE + vol * COST_PER_CM3 * mat.mult * i.mult * wm.m * tm.m * bm.m * lm.m * sm.m * fm.m) * bd
  const totalPrice = unitPrice * qty

  return { unitPrice, totalPrice, bd }
}

export default function EstimateTool({ modelInfo, onContact }: EstimateToolProps) {
  const [material, setMaterial] = useState('pla')
  const [color, setColor] = useState('White')
  const [infill, setInfill] = useState(20)
  const [quantity, setQuantity] = useState(1)
  const [showAdvanced, setShowAdvanced] = useState(false)

  /* Advanced settings */
  const [walls, setWalls]       = useState(3)
  const [topL, setTopL]         = useState(5)
  const [botL, setBotL]         = useState(5)
  const [layerH, setLayerH]     = useState(0.20)
  const [support, setSupport]   = useState('plate')
  const [finish, setFinish]     = useState('standard')
  const [bizOrder, setBizOrder] = useState(false)

  const mat = Object.values(MATERIALS).find((m) => m.key === material) ?? MATERIALS.pla

  useMemo(() => { if (!mat.colors.includes(color)) setColor(mat.colors[0]) }, [material])

  const hasModel = modelInfo && modelInfo.volume > 0
  const vol  = hasModel ? modelInfo!.volume : 0
  const dims = hasModel ? modelInfo!.dimensions : { x: 0, y: 0, z: 0 }
  const { unitPrice, totalPrice } = calcPrice(vol, material, infill, walls, topL, botL, layerH, support, finish, quantity)
  const bdMult = bulkDiscount(quantity)
  const bdLabel = bulkLabel(quantity)

  const resetRecommended = () => {
    setMaterial('petg')
    setInfill(20)
    setWalls(3)
    setTopL(5)
    setBotL(5)
    setLayerH(0.20)
    setSupport('plate')
    setFinish('standard')
  }

  return (
    <div className="bg-white border border-border-light rounded-xl p-5 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-border-light">
        <Calculator size={18} className="text-forest" />
        <h3 className="text-base font-semibold text-charcoal">Quote Details</h3>
      </div>

      <div className="space-y-5">
        {/* ── Material ── */}
        <div>
          <label className="block text-[11px] font-semibold tracking-[0.08em] text-charcoal uppercase mb-1.5">Material</label>
          <select value={material} onChange={(e) => setMaterial(e.target.value)}
            className="w-full border border-border-light rounded-lg px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all bg-white appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a4a4a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
            {Object.values(MATERIALS).map((m) => (<option key={m.key} value={m.key}>{m.label}</option>))}
          </select>
        </div>

        {/* ── Colour ── */}
        <div>
          <label className="block text-[11px] font-semibold tracking-[0.08em] text-charcoal uppercase mb-1.5">Colour</label>
          <select value={color} onChange={(e) => setColor(e.target.value)}
            className="w-full border border-border-light rounded-lg px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all bg-white appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a4a4a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
            {mat.colors.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>

        {/* ── Infill ── */}
        <div>
          <label className="block text-[11px] font-semibold tracking-[0.08em] text-charcoal uppercase mb-1.5">Infill Density</label>
          <select value={infill} onChange={(e) => setInfill(Number(e.target.value))}
            className="w-full border border-border-light rounded-lg px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all bg-white appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a4a4a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
            {INFILL_OPTS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </div>

        {/* ── Quantity ── */}
        <div>
          <label className="block text-[11px] font-semibold tracking-[0.08em] text-charcoal uppercase mb-1.5">Quantity</label>
          <div className="flex items-center">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 border border-border-light rounded-l-lg flex items-center justify-center text-charcoal hover:bg-off-white transition-colors focus-gold"
              aria-label="Decrease quantity">
              <Minus size={14} />
            </button>
            <input type="number" min={1} max={1000} value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
              className="w-full h-10 border-y border-border-light text-center text-sm text-charcoal font-semibold focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button type="button" onClick={() => setQuantity(Math.min(1000, quantity + 1))}
              className="w-10 h-10 border border-border-light rounded-r-lg flex items-center justify-center text-charcoal hover:bg-off-white transition-colors focus-gold"
              aria-label="Increase quantity">
              <Plus size={14} />
            </button>
          </div>
          {quantity >= 50 && (
            <p className="mt-1.5 text-[10px] text-amber-700 bg-amber-50 rounded px-2 py-1">
              Custom quote recommended for 50+ units
            </p>
          )}
        </div>

        {/* ── Advanced Print Settings Toggle ── */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between py-2 text-left focus-gold group"
        >
          <span className="text-[11px] font-semibold tracking-[0.08em] text-charcoal uppercase">Advanced Print Settings</span>
          {showAdvanced ? <ChevronUp size={16} className="text-charcoal-light" /> : <ChevronDown size={16} className="text-charcoal-light group-hover:text-charcoal transition-colors" />}
        </button>

        {/* ── Advanced Settings Panel ── */}
        {showAdvanced && (
          <div className="space-y-4 pt-2 border-t border-border-light/50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Wall Count */}
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.08em] text-charcoal uppercase mb-1.5">Wall Count</label>
              <select value={walls} onChange={(e) => setWalls(Number(e.target.value))}
                className="w-full border border-border-light rounded-lg px-3.5 py-2 text-sm text-charcoal focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all bg-white appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a4a4a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                {WALL_OPTS.map((o) => (<option key={o.v} value={o.v}>{o.v} Walls</option>))}
              </select>
            </div>

            {/* Top Layers */}
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.08em] text-charcoal uppercase mb-1.5">Top Layers</label>
              <select value={topL} onChange={(e) => setTopL(Number(e.target.value))}
                className="w-full border border-border-light rounded-lg px-3.5 py-2 text-sm text-charcoal focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all bg-white appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a4a4a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                {TOP_OPTS.map((o) => (<option key={o.v} value={o.v}>{o.v}</option>))}
              </select>
            </div>

            {/* Bottom Layers */}
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.08em] text-charcoal uppercase mb-1.5">Bottom Layers</label>
              <select value={botL} onChange={(e) => setBotL(Number(e.target.value))}
                className="w-full border border-border-light rounded-lg px-3.5 py-2 text-sm text-charcoal focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all bg-white appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a4a4a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                {BOTTOM_OPTS.map((o) => (<option key={o.v} value={o.v}>{o.v}</option>))}
              </select>
            </div>

            {/* Layer Height */}
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.08em] text-charcoal uppercase mb-1.5">Layer Height</label>
              <select value={layerH} onChange={(e) => setLayerH(Number(e.target.value))}
                className="w-full border border-border-light rounded-lg px-3.5 py-2 text-sm text-charcoal focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all bg-white appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a4a4a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                {LAYER_OPTS.map((o) => (<option key={o.v} value={o.v}>{o.label}</option>))}
              </select>
            </div>

            {/* Support Material */}
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.08em] text-charcoal uppercase mb-1.5">Support Material</label>
              <select value={support} onChange={(e) => setSupport(e.target.value)}
                className="w-full border border-border-light rounded-lg px-3.5 py-2 text-sm text-charcoal focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all bg-white appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a4a4a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                {SUPPORT_OPTS.map((o) => (<option key={o.v} value={o.v}>{o.label}</option>))}
              </select>
            </div>

            {/* Surface Finish */}
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.08em] text-charcoal uppercase mb-1.5">Surface Finish</label>
              <select value={finish} onChange={(e) => setFinish(e.target.value)}
                className="w-full border border-border-light rounded-lg px-3.5 py-2 text-sm text-charcoal focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all bg-white appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a4a4a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                {FINISH_OPTS.map((o) => (<option key={o.v} value={o.v}>{o.label}</option>))}
              </select>
            </div>

            {/* Need Help Choosing */}
            <button
              type="button"
              onClick={resetRecommended}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-gold/30 rounded-lg text-gold text-sm font-medium hover:bg-gold/5 transition-colors focus-gold"
            >
              <HelpCircle size={14} />
              Need Help Choosing?
            </button>
            {material === 'petg' && infill === 20 && walls === 3 && topL === 5 && botL === 5 && layerH === 0.20 && support === 'plate' && finish === 'standard' && (
              <p className="text-[10px] text-charcoal-light text-center -mt-1">Recommended settings for most functional parts.</p>
            )}
          </div>
        )}

        {/* ── Business Order Checkbox ── */}
        <label className="flex items-start gap-3 cursor-pointer pt-1">
          <input type="checkbox" checked={bizOrder} onChange={(e) => setBizOrder(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-border-light text-gold focus:ring-gold" />
          <span className="text-sm text-charcoal-light">This is a business or promotional order</span>
        </label>
        {bizOrder && (
          <div className="flex items-start gap-2 bg-forest/[0.04] border border-forest/10 rounded-lg px-3 py-2.5 -mt-2">
            <Briefcase size={14} className="text-forest shrink-0 mt-0.5" />
            <p className="text-[11px] text-charcoal-light leading-relaxed">
              Need branded products, promotional items, event giveaways, keychains or corporate gifts?
              <button type="button" onClick={onContact} className="text-gold font-medium hover:underline ml-1 focus-gold">Contact KiwiKoru</button> for a custom production quote.
            </p>
          </div>
        )}

        {/* ── Divider ── */}
        <div className="border-t border-border-light pt-5">

          {/* Model Specs */}
          {hasModel ? (
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal-light">Dimensions</span>
                <span className="text-xs font-medium text-charcoal">{dims.x} × {dims.y} × {dims.z} mm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal-light">Volume</span>
                <span className="text-xs font-medium text-charcoal">{vol.toFixed(1)} cm³</span>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal-light">Volume</span>
                <span className="text-xs font-medium text-amber-700">Manual review required</span>
              </div>
            </div>
          )}

          {/* ── Price Breakdown ── */}
          {hasModel && (
            <div className="bg-forest/[0.04] rounded-lg p-4 mb-4 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-charcoal-light">Unit Price</span>
                <span className="font-medium text-charcoal">${(unitPrice).toFixed(2)} NZD</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-charcoal-light">Quantity</span>
                <span className="font-medium text-charcoal">{quantity} {quantity === 1 ? 'unit' : 'units'}</span>
              </div>
              {bdMult < 1 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gold">Bulk Discount</span>
                  <span className="font-medium text-gold">{bdLabel}</span>
                </div>
              )}
              <div className="border-t border-border-light/50 pt-1.5 flex justify-between">
                <span className="text-sm font-semibold text-charcoal">Estimated Total</span>
                <span className="text-sm font-bold text-charcoal">${totalPrice.toFixed(2)} NZD</span>
              </div>
            </div>
          )}

          {/* Total Price (big, when no model too) */}
          {!hasModel && (
            <div className="mb-4">
              <p className="text-xs text-charcoal-light mb-1">Estimated Total</p>
              <p className="text-3xl font-bold text-charcoal">—</p>
            </div>
          )}

          {/* Print Time */}
          {hasModel && (
            <div className="flex items-center gap-2 mb-4 text-[11px] text-charcoal-light">
              <Clock size={12} className="text-forest" />
              {printTimeLabel(quantity)}
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mb-4">
            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800 leading-relaxed">
              <strong>Estimated Price Only.</strong> Final pricing may vary depending on model complexity, material selection, print settings, finishing requirements, shipping requirements and project scope.
            </p>
          </div>

          {/* Contact Us */}
          <button type="button" onClick={onContact}
            className="w-full py-3 bg-gold text-forest font-semibold text-sm rounded-lg transition-all duration-200 hover:bg-gold-light hover:-translate-y-0.5 focus-gold flex items-center justify-center gap-2">
            <MessageSquare size={16} />
            Contact Us
          </button>
        </div>
      </div>
    </div>
  )
}
