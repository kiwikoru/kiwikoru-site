import { useEffect, useState } from 'react'
import { ArrowRight, Box, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { listPrintCart, removePrintCartItem, updatePrintCartQuantity } from '../lib/printCart'
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

  const changeQuantity = async (item: PrintCartItem, quantity: number) => {
    await updatePrintCartQuantity(item.id, quantity)
    await refresh()
  }

  const unitCount = items.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

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
                <div className="min-w-0"><h2 className="truncate text-xl font-bold text-forest-dark">{item.fileName}</h2><p className="mt-2 text-sm text-forest/65">{item.material} · {item.color} · {item.infill}% infill · {item.quality} mm layers</p><p className="mt-1 text-sm text-forest/65">Scale {Math.round(item.scale * 100)}%{item.dimensions ? ` · X ${item.dimensions.x} × Y ${item.dimensions.y} × Z ${item.dimensions.z} mm` : ''}</p><div className="mt-3 flex flex-wrap items-center gap-4"><p className="text-2xl font-bold text-forest-dark">NZ${(item.price * item.quantity).toFixed(2)}</p><span className="text-xs text-forest/55">NZ${item.price.toFixed(2)} each</span></div></div>
                <div className="flex items-center gap-2 sm:flex-col"><div className="flex items-center rounded-xl border border-forest/15 bg-off-white p-1" aria-label={`Quantity for ${item.fileName}`}><button onClick={() => void changeQuantity(item, item.quantity - 1)} disabled={item.quantity <= 1} className="grid h-10 w-10 place-items-center rounded-lg text-forest hover:bg-white disabled:opacity-30" aria-label="Remove one unit"><Minus size={16}/></button><span className="w-10 text-center text-lg font-black text-forest-dark">{item.quantity}</span><button onClick={() => void changeQuantity(item, item.quantity + 1)} disabled={item.quantity >= 99} className="grid h-10 w-10 place-items-center rounded-lg text-forest hover:bg-white disabled:opacity-30" aria-label="Add one more unit"><Plus size={16}/></button></div><button onClick={() => void remove(item.id)} className="grid h-12 w-12 place-items-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50" aria-label={`Remove ${item.fileName}`}><Trash2 size={18}/></button></div>
              </article>
            ))}
            <section className="mt-3 rounded-3xl bg-forest-dark p-6 text-white shadow-xl sm:flex sm:items-center sm:justify-between sm:gap-8"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-gold-light">Complete cart</p><h2 className="mt-2 text-2xl font-bold">{unitCount} {unitCount === 1 ? 'unit' : 'units'} · NZ${cartTotal.toFixed(2)}</h2><p className="mt-1 text-sm text-white/65">Delivery is selected once and added at checkout.</p></div><button onClick={() => navigate('/print-order', { state: { cartItems: items } })} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-7 py-4 font-black text-forest-dark shadow-md hover:bg-gold-light sm:mt-0 sm:w-auto">Buy all <ArrowRight size={18}/></button></section>
          </div>
        )}
      </div>
    </main>
  )
}
