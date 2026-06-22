// Automatisk import til Google Slides.
// Logger inn med Google (kun tilgang til filer appen selv lager), laster opp .pptx
// til Google Drive med automatisk konvertering til et Google Slides-dokument,
// og returnerer lenken til den ferdige presentasjonen.
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
export const googleConfigured = () => !!CLIENT_ID

let gisLoaded = null
export function loadGis() {
  if (gisLoaded) return gisLoaded
  gisLoaded = new Promise((resolve, reject) => {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) return resolve()
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true; s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Kunne ikke laste Google-innlogging'))
    document.head.appendChild(s)
  })
  return gisLoaded
}

function getToken() {
  return new Promise((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (resp) => { if (resp && resp.access_token) resolve(resp.access_token); else reject(new Error(resp && resp.error ? resp.error : 'Ingen tilgang')) },
        error_callback: (err) => reject(new Error((err && err.message) || 'Innlogging avbrutt')),
      })
      client.requestAccessToken()
    } catch (e) { reject(e) }
  })
}

// getBlob: en funksjon som returnerer (en Promise på) en .pptx Blob.
export async function importToGoogleSlides(getBlob, title) {
  if (!CLIENT_ID) throw new Error('NO_CLIENT_ID')
  await loadGis()
  const token = await getToken()
  const blob = await getBlob()
  const meta = { name: title || 'Presentasjon', mimeType: 'application/vnd.google-apps.presentation' }
  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
  form.append('file', blob, (title || 'presentasjon') + '.pptx')
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
    body: form,
  })
  if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error('Google Drive svarte ' + res.status + (t ? ': ' + t.slice(0, 160) : '')) }
  const data = await res.json()
  if (!data.id) throw new Error('Mangler fil-id fra Google')
  return 'https://docs.google.com/presentation/d/' + data.id + '/edit'
}
