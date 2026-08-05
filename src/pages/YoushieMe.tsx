import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { ArrowLeft, Download, ImagePlus, RotateCcw, Share2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import './YoushieMe.css'

export default function YoushieMe() {
  const [photo, setPhoto] = useState<string>()
  const [photoFile, setPhotoFile] = useState<File>()
  const [generatedPhoto, setGeneratedPhoto] = useState<string>()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string>()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo) }, [photo])

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (photo) URL.revokeObjectURL(photo)
    setPhoto(URL.createObjectURL(file))
    setPhotoFile(file)
    setGeneratedPhoto(undefined)
    setError(undefined)
  }

  async function prepareImage(file: File) {
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
    setCreating(true)
    setError(undefined)
    setGeneratedPhoto(undefined)
    try {
      const image = await prepareImage(photoFile)
      const response = await fetch('/api/youshie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, mimeType: 'image/jpeg' }),
      })
      const result = await response.json() as { image?: string; mimeType?: string; error?: string }
      if (!response.ok || !result.image) throw new Error(result.error || 'Could not create your Youshie.')
      setGeneratedPhoto(`data:${result.mimeType || 'image/png'};base64,${result.image}`)
      window.setTimeout(() => document.getElementById('youshie-result')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Could not create your Youshie. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  async function share() {
    const data = { title: 'My Youshie', text: 'I made my own Youshie with KiwiKoru 3D!', url: window.location.href }
    if (navigator.share) await navigator.share(data).catch(() => undefined)
    else await navigator.clipboard.writeText(window.location.href)
  }

  return (
    <div className="youshie-page">
      <div className="youshie-orb orb-one" /><div className="youshie-orb orb-two" />
      <header className="youshie-header">
        <Link to="/" className="back-link"><ArrowLeft size={18} /> KiwiKoru 3D</Link>
        <div className="youshie-logo" aria-label="Youshies"><span>YOU</span>SHIES<i>✎</i></div>
        <span className="limited-pill">Limited experience</span>
      </header>

      <main className="youshie-main">
        <section className="youshie-intro">
          <div className="eyebrow"><Sparkles size={16} /> Made for you. Made like you.</div>
          <h1>Meet your little<br /><em>3D alter ego.</em></h1>
          <p>Upload a photo and watch yourself become a playful, one-of-a-kind Youshie designed with four printable colours.</p>
          <div className="steps"><span><b>1</b> Add a photo</span><span><b>2</b> Get Youshified</span><span><b>3</b> Save your figure</span></div>
        </section>

        <section className="creator-card" aria-label="Youshie creator">
          <div className="card-heading"><div><small>YOUR TURN</small><h2>Youshie Me!</h2></div><span className="wiggle">✦</span></div>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={choosePhoto} hidden />
          <button className={`photo-drop ${photo ? 'has-photo' : ''}`} onClick={() => inputRef.current?.click()}>
            {photo ? <img src={photo} alt="Your uploaded portrait" /> : <><span className="upload-icon"><ImagePlus size={30} /></span><strong>Choose your favourite photo</strong><small>Clear, front-facing photos work best</small><span className="browse-pill">Browse photo</span></>}
            {photo && <span className="change-photo">Change photo</span>}
          </button>
          <div className="four-colour-badge"><span>4</span><div><strong>Four-colour ready</strong><small>Designed with real 3D printing in mind</small></div></div>
          <button className="create-button" onClick={createYoushie} disabled={creating}>{creating ? <><span className="spinner" /> Creating your Youshie… this can take a minute</> : <><Sparkles size={20} /> {photo ? 'Youshify me!' : 'Add a photo to begin'}</>}</button>
          {error && <p className="generation-error" role="alert">{error}</p>}
          <p className="gemini-note"><span className="gemini-star">✦</span> Powered by Gemini AI · Your photo is used only to create your Youshie</p>
        </section>

        {generatedPhoto && <section id="youshie-result" className="result-section">
          <div className="result-copy"><span className="eyebrow"><Sparkles size={15} /> TA-DA!</span><h2>Your Youshie is ready.</h2><p>Your photo has been transformed into an original four-colour, 3D-printable collectible concept.</p><div className="result-actions"><a href={generatedPhoto} download="my-youshie.png"><Download size={18} /> Download</a><button onClick={share}><Share2 size={18} /> Share</button><button className="again" onClick={() => setGeneratedPhoto(undefined)}><RotateCcw size={18} /> Make another</button></div></div>
          <div className="result-preview"><img src={generatedPhoto} alt="Your generated Youshie collectible" /></div>
        </section>}
      </main>
      <footer className="youshie-footer"><div className="youshie-logo mini"><span>YOU</span>SHIES<i>✎</i></div><p>A playful KiwiKoru 3D experience · Whangārei, New Zealand</p></footer>
    </div>
  )
}
