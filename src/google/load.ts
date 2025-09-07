export const ensureGISLibraryLoaded = new Promise<void>((resolve) => {
  const gisEle = document.createElement('script')
  gisEle.defer = true
  gisEle.src = 'https://accounts.google.com/gsi/client'
  gisEle.addEventListener('load', () => {
    resolve()
  })
  document.body.appendChild(gisEle)
})

export const ensureGAPILibraryLoaded = new Promise<void>((resolve) => {
  const gapiEle = document.createElement('script')
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
      onerror: () => reject(new Error('Failed to load gapi client')),
      timeout: 15000,
      ontimeout: () => reject(new Error('Timeout when loading gapi client')),
    })
  })
  .catch(err => console.error(err))
})

export const loadPicker = new Promise<void>((resolve, reject) => {
  ensureGAPILibraryLoaded.then(() => {
    gapi.load('picker', {
      callback: () => resolve(),
      onerror: () => reject(new Error('Failed to load picker')),
      timeout: 15000,
      ontimeout: () => reject(new Error('Timeout when loading picker')),
    })
  })
  .catch(err => { console.log(err) })
})
