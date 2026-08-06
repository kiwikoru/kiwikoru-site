const LOGO_URL = 'https://www.kiwikoru.co.nz/images/kiwikoru-logo-moss.png'

export function emailSafe(value: unknown) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character)
}

export function brandedEmail({ eyebrow, title, intro, content, internal = false }: { eyebrow: string; title: string; intro: string; content: string; internal?: boolean }) {
  return `<!doctype html><html><head><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"></head>
  <body style="margin:0;background:#eef0e8;padding:28px 10px;font-family:Arial,Helvetica,sans-serif;color:#1d2b21">
    <div role="article" aria-label="${emailSafe(title)}" style="max-width:660px;margin:0 auto;overflow:hidden;border:1px solid #d8ddcf;border-radius:22px;background:#ffffff;box-shadow:0 12px 36px rgba(26,40,30,.12)">
      <div style="background:#253126;padding:28px 24px;text-align:center">
        <img src="${LOGO_URL}" width="72" height="72" alt="KiwiKoru 3D" style="display:block;width:72px;height:72px;margin:0 auto 10px;border:0">
        <div style="color:#e8c9a0;font-size:23px;font-weight:800;letter-spacing:-.3px">KiwiKoru 3D</div>
        <div style="margin-top:5px;color:#f5f0e8;font-size:12px;letter-spacing:1.6px;text-transform:uppercase">Ideas made tangible in New Zealand</div>
      </div>
      <div style="padding:34px 30px 30px">
        <div style="color:#7b682d;font-size:12px;font-weight:800;letter-spacing:1.7px;text-transform:uppercase">${emailSafe(eyebrow)}</div>
        <h1 style="margin:10px 0 12px;color:#1b281e;font-size:29px;line-height:1.2">${emailSafe(title)}</h1>
        <p style="margin:0 0 24px;color:#526158;font-size:16px;line-height:1.65">${emailSafe(intro)}</p>
        ${content}
        <div style="margin-top:28px;padding:20px 22px;border-left:4px solid #89943a;border-radius:8px;background:#f2f4ea;color:#334237;font-size:15px;line-height:1.6">
          ${internal ? 'A new idea has become a real KiwiKoru project. Everything needed to move it forward is collected above.' : 'Thank you for trusting us with your idea. We hope the rest of your day brings something worth building — and we look forward to helping you make it real.'}
        </div>
      </div>
      <div style="background:#253126;padding:24px 28px;text-align:center;color:#f6f2e9;font-size:13px;line-height:1.7">
        <strong style="display:block;color:#e8c9a0;font-size:15px">KiwiKoru 3D</strong>
        <span>3D solutions for people and industry · Morningside, Whangārei, New Zealand</span><br>
        <a href="https://www.kiwikoru.co.nz" style="color:#ffffff;font-weight:700">www.kiwikoru.co.nz</a>
        <span style="color:#8f9d8d"> &nbsp;·&nbsp; </span><a href="tel:+64274365339" style="color:#ffffff;font-weight:700">027 436 5339</a>
        <span style="color:#8f9d8d"> &nbsp;·&nbsp; </span><a href="https://wa.me/64274365339" style="color:#ffffff;font-weight:700">WhatsApp</a>
        <div style="margin-top:12px;color:#b9c1b7;font-size:11px">Please keep this email for your records. You can reply directly if you need help.</div>
      </div>
    </div>
  </body></html>`
}

export function emailDetails(rows: Array<[string, string]>) {
  return `<table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0;overflow:hidden;border:1px solid #dfe3d8;border-radius:14px;background:#f8f8f4">${rows.map(([label, value], index) => `<tr><td style="width:34%;padding:12px 15px;${index ? 'border-top:1px solid #e3e6dd;' : ''}color:#647067;font-size:13px;font-weight:700">${emailSafe(label)}</td><td style="padding:12px 15px;${index ? 'border-top:1px solid #e3e6dd;' : ''}color:#243329;font-size:14px">${value}</td></tr>`).join('')}</table>`
}
