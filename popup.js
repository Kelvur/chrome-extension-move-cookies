
const COOKIES_KEY = 'cookies'

async function getActiveTab(){
  return (await chrome.tabs.query({active: true}))[0]
}

async function getCookies(domain){
  return chrome.cookies.getAll({ domain })
}

async function setCookie(cookie){
  return chrome.cookies.set(cookie)
}

async function writeToLocalStorage(key, value){
  return chrome.storage.local.set({ [key]: value})
}

async function readFromLocalStorage(key){
  const value = await chrome.storage.local.get(key)
  return value[key]
}

async function writeToClipboard(value){
  return navigator.clipboard.writeText(value)
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
  JSON.parse(cookiesAsString).forEach(({ hostOnly, session, storeId, ...restCookie}) => {
    setCookie({...restCookie, url: url.origin, domain: url.hostname})
  })
}
