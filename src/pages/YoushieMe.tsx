import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { ArrowLeft, Download, ImagePlus, RotateCcw, Share2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import './YoushieMe.css'

const themes = [
  { id: 'galaxy', emoji: '⚔️', name: 'Galaxy Hero', note: 'Epic space adventurer' },
  { id: 'monster', emoji: '💙', name: 'Friendly Monster', note: 'Big, fluffy & lovable' },
  { id: 'astronaut', emoji: '🚀', name: 'Little Astronaut', note: 'Ready for orbit' },
  { id: 'hero', emoji: '⚡', name: 'Super Hero', note: 'Cape, courage & colour' },
]

export default function YoushieMe() {
  const [photo, setPhoto] = useState<string>()
  const [theme, setTheme] = useState(themes[0].id)
  const [creating, setCreating] = useState(false)
  const [ready, setReady] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo) }, [photo])

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (photo) URL.revokeObjectURL(photo)
    setPhoto(URL.createObjectURL(file))
    setReady(false)
  }

  function createYoushie() {
    if (!photo) { inputRef.current?.click(); return }
    setCreating(true)
    window.setTimeout(() => { setCreating(false); setReady(true) }, 1500)
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
          <p>Upload a photo, pick a world, and watch yourself become a playful, one-of-a-kind Youshie.</p>
          <div className="steps"><span><b>1</b> Add a photo</span><span><b>2</b> Pick your vibe</span><span><b>3</b> Get Youshified</span></div>
        </section>

        <section className="creator-card" aria-label="Youshie creator">
          <div className="card-heading"><div><small>YOUR TURN</small><h2>Youshie Me!</h2></div><span className="wiggle">✦</span></div>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={choosePhoto} hidden />
          <button className={`photo-drop ${photo ? 'has-photo' : ''}`} onClick={() => inputRef.current?.click()}>
            {photo ? <img src={photo} alt="Your uploaded portrait" /> : <><span className="upload-icon"><ImagePlus size={30} /></span><strong>Choose your favourite photo</strong><small>Clear, front-facing photos work best</small><span className="browse-pill">Browse photo</span></>}
            {photo && <span className="change-photo">Change photo</span>}
          </button>

          <div className="theme-heading"><span>Choose your Youshie world</span><small>More coming soon!</small></div>
          <div className="theme-grid">
            {themes.map(item => <button key={item.id} onClick={() => { setTheme(item.id); setReady(false) }} className={theme === item.id ? 'active' : ''}><span>{item.emoji}</span><strong>{item.name}</strong><small>{item.note}</small></button>)}
          </div>
          <button className="create-button" onClick={createYoushie} disabled={creating}>{creating ? <><span className="spinner" /> Creating your Youshie…</> : <><Sparkles size={20} /> {photo ? 'Youshify me!' : 'Add a photo to begin'}</>}</button>
          <p className="gemini-note"><span className="gemini-star">✦</span> Powered by Gemini AI · Your photo is used only to create your Youshie</p>
        </section>

        {ready && photo && <section className="result-section">
          <div className="result-copy"><span className="eyebrow"><Sparkles size={15} /> TA-DA!</span><h2>Your Youshie is ready.</h2><p>This preview is ready to save and share. The full AI transformation activates when the Gemini service key is connected.</p><div className="result-actions"><a href={photo} download="my-youshie.jpg"><Download size={18} /> Download</a><button onClick={share}><Share2 size={18} /> Share</button><button className="again" onClick={() => setReady(false)}><RotateCcw size={18} /> Make another</button></div></div>
          <div className="result-frame"><div className="frame-title">MY Y<span>OU</span>SHIE</div><div className={`result-image theme-${theme}`}><img src={photo} alt="Your Youshie preview" /><div className="spark s1">✦</div><div className="spark s2">✦</div></div><div className="frame-footer"><strong>KiwiKoru 3D</strong><span>3D solutions for people & industry</span><small>kiwikoru.co.nz · 027 436 5339</small></div></div>
        </section>}
      </main>
      <footer className="youshie-footer"><div className="youshie-logo mini"><span>YOU</span>SHIES<i>✎</i></div><p>A playful KiwiKoru 3D experience · Whangārei, New Zealand</p></footer>
    </div>
  )
}
