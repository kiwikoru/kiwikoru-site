export type PrintCartItem = {
  id: string
  fileName: string
  file: File
  thumbnail?: string
  price: number
  material: string
  color: string
  infill: number
  quality: number
  estimatedVolume: number
  dimensions?: { x: number; y: number; z: number }
  scale: number
  createdAt: number
}

const DB_NAME = 'kiwikoru-print-cart'
const STORE_NAME = 'items'
export const CART_UPDATED_EVENT = 'kiwikoru-cart-updated'

function openCartDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openCartDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode)
    const request = action(transaction.objectStore(STORE_NAME))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => db.close()
  })
}

const announceUpdate = () => window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT))

export async function listPrintCart(): Promise<PrintCartItem[]> {
  const items = await withStore<PrintCartItem[]>('readonly', store => store.getAll())
  return items.sort((a, b) => b.createdAt - a.createdAt)
}

export async function addPrintCartItem(item: PrintCartItem) {
  await withStore<IDBValidKey>('readwrite', store => store.put(item))
  announceUpdate()
}

export async function removePrintCartItem(id: string) {
  await withStore<undefined>('readwrite', store => store.delete(id))
  announceUpdate()
}

export async function getPrintCartCount() { return (await listPrintCart()).length }
