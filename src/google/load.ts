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
