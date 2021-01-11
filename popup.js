
const COOKIES_KEY = 'cookies'

function getSelectedTab(){
  return new Promise(resolve => {
    chrome.tabs.getSelected(tab => resolve(tab))
  })
}

function getCookies(domain){
  return new Promise(resolve => {
    chrome.cookies.getAll({ domain }, cookies => resolve(cookies))
  })
}

function setCookie(cookie){
  return new Promise((resolve, reject) => {
    chrome.cookies.set(cookie, cookie => {
      cookie === null ? reject() : resolve(cookie)
    })
  })
}

function writeToLocalStorage(key, value){
  chrome.storage.local.set({ [key]: value})
}

function readFromLocalStorage(key){
  return new Promise(resolve => {
    chrome.storage.local.get(key, value => resolve(value[key]))
  })
}

function writeToClipboard(value){
  navigator.clipboard.writeText(value)
}


const copyButton = document.getElementById('copyButton')

copyButton.onclick = async () => {
  const tab = await getSelectedTab()
  const url = new URL(tab.url)
  const cookies = await getCookies(url.hostname)

  const toBeCopied = JSON.stringify(cookies)

  writeToLocalStorage(COOKIES_KEY, toBeCopied)
  writeToClipboard(toBeCopied)
}

const pasteButton = document.getElementById('pasteButton')

pasteButton.onclick = async () => {
  const tab = await getSelectedTab()
  const url = new URL(tab.url)
  const cookiesAsString = await readFromLocalStorage(COOKIES_KEY)
  JSON.parse(cookiesAsString).forEach(({ hostOnly, session, secure, storeId, ...restCookie}) => {
    setCookie({...restCookie, url: url.origin, domain: url.hostname})
  })
}
