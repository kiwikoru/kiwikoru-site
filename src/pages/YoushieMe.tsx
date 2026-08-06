import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties } from 'react'
import { ArrowLeft, Download, ImagePlus, Share2, ShoppingBag, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import './YoushieMe.css'

const magicMessages = [
  'Reading the little details that make you, you…',
  'Choosing four perfect printable colours…',
  'Sculpting your tiny Youshie…',
  'Adding one last touch of magic…',
]

export default function YoushieMe() {
  const [photo, setPhoto] = useState<string>()
  const [photoFile, setPhotoFile] = useState<File>()
  const [generatedPhoto, setGeneratedPhoto] = useState<string>()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string>()
  const [magicStep, setMagicStep] = useState(0)
  const [revealCount, setRevealCount] = useState<number | 'BOOM' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<AudioContext | null>(null)

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo) }, [photo])
  useEffect(() => {
    if (!creating) { setMagicStep(0); return }
    const timer = window.setInterval(() => setMagicStep(step => Math.min(step + 1, magicMessages.length - 1)), 6500)
    return () => window.clearInterval(timer)
  }, [creating])

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (photo) URL.revokeObjectURL(photo)
    setPhoto(URL.createObjectURL(file))
    setPhotoFile(file)
    setGeneratedPhoto(undefined)
    setError(undefined)
  }

  async function prepareImage(file: Blob) {
    const image = await createImageBitmap(file)
    const scale = Math.min(1, 1536 / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(image.width * scale)
    canvas.height = Math.round(image.height * scale)
    canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
    image.close()
    return canvas.toDataURL('image/jpeg', 0.88).split(',')[1]
  }

  async function createYoushie() {
    if (!photoFile) { inputRef.current?.click(); return }
    if (!audioRef.current) audioRef.current = new AudioContext()
    await audioRef.current.resume().catch(() => undefined)
    setCreating(true)
    setError(undefined)
    setGeneratedPhoto(undefined)
    try {
      const image = await prepareImage(photoFile)
      const styleReference = await fetch('/youshie-style-reference.jpg')
        .then(response => response.blob())
        .then(prepareImage)
      const response = await fetch('/api/youshie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, styleReference, mimeType: 'image/jpeg' }),
      })
      const result = await response.json() as { image?: string; mimeType?: string; error?: string }
      if (!response.ok || !result.image) throw new Error(result.error || 'Could not create your Youshie.')
      const rawImage = `data:${result.mimeType || 'image/png'};base64,${result.image}`
      const finishedImage = await addKiwiKoruFrame(rawImage)
      for (const count of [3, 2, 1]) {
        setRevealCount(count)
        await new Promise(resolve => window.setTimeout(resolve, 720))
      }
      setRevealCount('BOOM')
      playFairyChime()
      await new Promise(resolve => window.setTimeout(resolve, 520))
      setGeneratedPhoto(finishedImage)
      try { sessionStorage.setItem('youshie-order-image', finishedImage) } catch { /* The navigation state still carries the image if browser storage is full. */ }
      setRevealCount(null)
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Could not create your Youshie. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  async function addKiwiKoruFrame(source: string) {
    const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = src
    })
    const [figure, logo, kiwiKoruLogo] = await Promise.all([load(source), load('/youshies-logo-transparent.png'), load('/images/kiwikoru-logo-transparent.png')])
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 1500
    const context = canvas.getContext('2d')
    if (!context) return source
    context.fillStyle = '#f8f3ff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#6c35c9'
    context.fillRect(0, 0, canvas.width, 178)
    const logoWidth = 470
    const logoHeight = logoWidth * logo.height / logo.width
    context.drawImage(logo, (canvas.width - logoWidth) / 2, (178 - logoHeight) / 2, logoWidth, logoHeight)
    const availableWidth = 1120
    const availableHeight = 1020
    const scale = Math.min(availableWidth / figure.width, availableHeight / figure.height)
    const width = figure.width * scale
    const height = figure.height * scale
    context.fillStyle = '#ffffff'
    context.fillRect(40, 198, 1120, 1032)
    context.drawImage(figure, (canvas.width - width) / 2, 204 + (1020 - height) / 2, width, height)
    context.fillStyle = '#ffffff'
    context.fillRect(0, 1250, canvas.width, 250)
    context.fillStyle = '#7541c5'
    context.fillRect(0, 1250, canvas.width, 5)
    context.drawImage(kiwiKoruLogo, 108, 1291, 150, 116)
    context.textAlign = 'left'
    context.fillStyle = '#173e2c'
    context.font = '800 43px Nunito, Arial, sans-serif'
    context.fillText('KiwiKoru 3D', 288, 1338)
    context.fillStyle = '#6f6578'
    context.font = '600 23px Nunito, Arial, sans-serif'
    context.fillText('3D solutions for people and industry', 288, 1381)
    context.fillStyle = '#7040bd'
    context.font = '700 22px Nunito, Arial, sans-serif'
    context.fillText('kiwikoru.co.nz   ·   027 436 5339', 288, 1423)
    return canvas.toDataURL('image/png')
  }

  function playFairyChime() {
    const audio = audioRef.current
    if (!audio || audio.state !== 'running') return
    const now = audio.currentTime
    ;[659.25, 783.99, 987.77, 1318.51].forEach((frequency, index) => {
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()
      oscillator.type = index % 2 ? 'sine' : 'triangle'
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.11)
      gain.gain.setValueAtTime(0.0001, now + index * 0.11)
      gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.11 + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.11 + 1.15)
      oscillator.connect(gain).connect(audio.destination)
      oscillator.start(now + index * 0.11)
      oscillator.stop(now + index * 0.11 + 1.2)
    })
  }

  async function share() {
    const data = { title: 'My Youshie', text: 'I made my own Youshie with KiwiKoru 3D!', url: window.location.href }
    if (navigator.share) await navigator.share(data).catch(() => undefined)
    else await navigator.clipboard.writeText(window.location.href)
  }

  return (
    <div className="youshie-page">
      <div className="youshie-orb orb-one" /><div className="youshie-orb orb-two" />
        {revealCount !== null && <div className={`reveal-magic ${revealCount === 'BOOM' ? 'is-boom' : ''}`} aria-hidden="true"><div className="magic-halo" /><div className="magic-ring" />{Array.from({ length: 22 }, (_, index) => <i key={index} style={{ '--i': index } as CSSProperties}>{index % 3 === 0 ? '✧' : '✦'}</i>)}</div>}
      <header className="youshie-header">
        <Link to="/" className="back-link"><ArrowLeft size={18} /> KiwiKoru 3D</Link>
        <img className="youshie-logo-img" src="/youshies-logo-transparent.png" alt="Youshies — Your photo. Your figure. Your Youshie." />
        <span className="limited-pill">Limited experience</span>
      </header>

      <main className="youshie-main">
        <section className="youshie-intro">
          <div className="eyebrow"><Sparkles size={16} /> Made for you. Made like you.</div>
          <h1>Meet your little<br /><em>3D alter ego.</em></h1>
          <p>Upload a photo and watch yourself become a playful, one-of-a-kind Youshie designed with four printable colours.</p>
          <div className="steps"><span><b>1</b> Add a photo</span><span><b>2</b> Watch the magic</span><span><b>3</b> Meet your Youshie</span></div>
        </section>

        <section className={`creator-card ${generatedPhoto ? 'has-generated' : ''}`} aria-label="Youshie creator">
          <div className="card-heading"><div><small>{generatedPhoto ? 'TA-DA!' : 'YOUR TURN'}</small><h2>{generatedPhoto ? 'Your Youshie!' : 'Youshie Me!'}</h2></div><span className="wiggle">✦</span></div>
          {!generatedPhoto && <div className="once-message"><Sparkles size={22} /><div><strong>Testing mode is open.</strong><p>Create as many Youshies as you need while we perfect the magic. The final competition experience will return to one surprise creation per person.</p></div></div>}
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={choosePhoto} hidden />
          <button className={`photo-drop ${photo || generatedPhoto ? 'has-photo' : ''} ${generatedPhoto ? 'has-result' : ''}`} onClick={() => !generatedPhoto && inputRef.current?.click()} disabled={creating}>
            {generatedPhoto ? <img className="inline-result" src={generatedPhoto} alt="Your generated Youshie collectible" /> : photo ? <img src={photo} alt="Your uploaded portrait" /> : <><span className="upload-icon"><ImagePlus size={30} /></span><strong>Choose your favourite photo</strong><small>Clear, front-facing photos work best</small><span className="browse-pill">Browse photo</span></>}
            {photo && !creating && !generatedPhoto && <span className="change-photo">Change photo</span>}
            {creating && <div className={`magic-stage magic-overlay ${revealCount !== null ? 'is-revealing' : ''}`} aria-live="polite">{revealCount !== null ? <div key={revealCount} className={`magic-count ${revealCount === 'BOOM' ? 'boom' : ''}`}><span>✦</span>{revealCount}<span>✦</span></div> : <><div className="magic-figure"><span>✦</span><span>✦</span><span>✦</span><div className="magic-head" /><div className="magic-body" /></div><strong>{magicMessages[magicStep]}</strong><div className="magic-progress"><i style={{ width: `${25 * (magicStep + 1)}%` }} /></div><small>Please keep this page open. Your reveal can take about a minute.</small></>}</div>}
          </button>
          <div className="four-colour-badge"><span>4</span><div><strong>Four-colour ready</strong><small>Designed with real 3D printing in mind</small></div></div>
          <p className="generation-limit">Unlimited testing is temporarily enabled</p>
          {!generatedPhoto && <button className="create-button" onClick={createYoushie} disabled={creating}>{creating ? <><span className="spinner" /> Making magic…</> : <><Sparkles size={20} /> {photo ? 'Youshify me!' : 'Add a photo to begin'}</>}</button>}
          {generatedPhoto && <div className="inline-result-copy"><p>Your framed four-colour collectible concept is ready.</p><div className="result-actions"><a href={generatedPhoto} download="my-youshie-kiwikoru.png"><Download size={18} /> Download</a><span className="share-promo"><button onClick={share}><Share2 size={18} /> Share</button><span className="share-bubble"><b>Enter the giveaway!</b> Share for a chance to win your Youshie free or a Youshie stand.</span></span><button className="again" onClick={() => setGeneratedPhoto(undefined)}><Sparkles size={18} /> Try again</button></div><Link className="order-youshie-cta" to="/youshie-order" state={{ generatedPhoto }}><ShoppingBag size={24} /><span><strong>Bring your Youshie home</strong><small>Order your real 10 cm collectible</small></span><b>→</b></Link></div>}
          {error && <p className="generation-error" role="alert">{error}</p>}
          <p className="gemini-note"><span className="gemini-star">✦</span> Powered by Gemini AI · Your photo is used only to create your Youshie</p>
        </section>

      </main>
      <footer className="youshie-footer"><img className="youshie-logo-img mini" src="/youshies-logo-transparent.png" alt="Youshies" /><p>A playful KiwiKoru 3D experience · Whangārei, New Zealand</p></footer>
    </div>
  )
}
