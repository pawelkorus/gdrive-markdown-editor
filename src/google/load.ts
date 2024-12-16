export const ensureGISLibraryLoaded = new Promise<void>((resolve) => {
  const gisEle = document.createElement('script') as HTMLScriptElement
  gisEle.defer = true
  gisEle.src = 'https://accounts.google.com/gsi/client'
  gisEle.addEventListener('load', () => {
    resolve()
  })
  document.body.appendChild(gisEle)
})

export const ensureGAPILibraryLoaded = new Promise<void>((resolve) => {
  const gapiEle = document.createElement('script') as HTMLScriptElement
  gapiEle.defer = true
  gapiEle.src = 'https://apis.google.com/js/api.js'
  gapiEle.addEventListener('load', () => {
    resolve()
  })
  document.body.appendChild(gapiEle)
})

export const loadGapiClient = new Promise<void>((resolve, reject) => {
  ensureGAPILibraryLoaded.then(() => {
    gapi.load('client', {
      callback: () => resolve(),
      onerror: (err: unknown) => reject('Failed to load gapi client. ' + err),
      timeout: 15000,
      ontimeout: () => reject('Timeout when loading gapi client'),
    })
  })
})

export const loadPicker = new Promise<void>((resolve, reject) => {
  ensureGAPILibraryLoaded.then(() => {
    gapi.load('picker', {
      callback: () => resolve(),
      onerror: (err: unknown) => reject('Failed to load picker. ' + err),
      timeout: 15000,
      ontimeout: () => reject('Timeout when loading picker'),
    })
  })
})
