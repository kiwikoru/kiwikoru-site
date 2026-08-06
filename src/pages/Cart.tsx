import { useEffect, useState } from 'react'
import { ArrowRight, Box, ShoppingCart, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { listPrintCart, removePrintCartItem } from '../lib/printCart'
import type { PrintCartItem } from '../lib/printCart'

export default function Cart() {
  const [items, setItems] = useState<PrintCartItem[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const refresh = async () => {
    try { setItems(await listPrintCart()) } finally { setLoading(false) }
  }

  useEffect(() => { void refresh() }, [])

  const remove = async (id: string) => {
    await removePrintCartItem(id)
    await refresh()
  }

  return (
    <main className="min-h-screen bg-kiwi-light pb-20 pt-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-bold uppercase tracking-[.18em] text-gold-dark">Your saved prints</p><h1 className="mt-2 text-4xl font-bold text-forest-dark">Shopping cart</h1><p className="mt-2 text-forest/65">Every model keeps its selected material, colour, scale and print settings.</p></div>
          <Link to="/quote" className="rounded-xl bg-gold px-5 py-3 font-bold text-forest-dark shadow-sm hover:bg-gold-light">Add another model</Link>
        </div>

        {loading ? <p className="mt-12 text-forest/60">Opening your cart…</p> : items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-forest/10 bg-white p-12 text-center shadow-sm"><ShoppingCart className="mx-auto h-12 w-12 text-forest/25"/><h2 className="mt-4 text-2xl font-bold text-forest-dark">Your cart is empty</h2><p className="mt-2 text-forest/60">Upload a model, configure it and add it here.</p><Link to="/quote" className="mt-6 inline-flex rounded-xl bg-forest px-6 py-3 font-bold text-white">Get an instant estimate</Link></div>
        ) : (
          <div className="mt-10 grid gap-5">
            {items.map(item => (
              <article key={item.id} className="grid gap-5 rounded-3xl border border-forest/10 bg-white p-5 shadow-sm sm:grid-cols-[180px_1fr_auto] sm:items-center">
                <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl bg-forest-dark">{item.thumbnail ? <img src={item.thumbnail} alt={`3D preview of ${item.fileName}`} className="h-full w-full object-cover"/> : <Box className="h-12 w-12 text-gold/70"/>}</div>
                <div className="min-w-0"><h2 className="truncate text-xl font-bold text-forest-dark">{item.fileName}</h2><p className="mt-2 text-sm text-forest/65">{item.material} · {item.color} · {item.infill}% infill · {item.quality} mm layers</p><p className="mt-1 text-sm text-forest/65">Scale {Math.round(item.scale * 100)}%{item.dimensions ? ` · X ${item.dimensions.x} × Y ${item.dimensions.y} × Z ${item.dimensions.z} mm` : ''}</p><p className="mt-3 text-2xl font-bold text-forest-dark">NZ${item.price.toFixed(2)}</p></div>
                <div className="flex gap-2 sm:flex-col"><button onClick={() => navigate('/print-order', { state: { modelFile: item.file, quote: { fileName: item.fileName, price: item.price, material: item.material, color: item.color, infill: item.infill, quality: item.quality, estimatedVolume: item.estimatedVolume } } })} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 font-bold text-white hover:bg-forest-light">Order <ArrowRight size={16}/></button><button onClick={() => void remove(item.id)} className="grid h-12 w-12 place-items-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50" aria-label={`Remove ${item.fileName}`}><Trash2 size={18}/></button></div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
