
const LOCAL_STORAGE_KEY = 'move_cookies'

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
  const tab = await getActiveTab()
  const url = new URL(tab.url)
  const cookies = await getCookies(url.hostname)

  const toBeCopied = JSON.stringify(cookies)

  writeToLocalStorage(LOCAL_STORAGE_KEY, toBeCopied)
  writeToClipboard(toBeCopied)
}

const pasteButton = document.getElementById('pasteButton')

pasteButton.onclick = async () => {
  const tab = await getActiveTab()
  const url = new URL(tab.url)
  const cookiesAsString = await readFromLocalStorage(LOCAL_STORAGE_KEY)

  if(!cookiesAsString || cookiesAsString === 'undefined') {
    return
  }

  JSON.parse(cookiesAsString).forEach(async ({
    // hostOnly, session are removed as they are not accepted parameters by chrome.cookies.set
    hostOnly,
    session,
    // storeId it is removed as the origin tab and the actual tab can be different
    storeId,
    name,
    ...restCookie
  }) => {
    const cookieHasSecurePrefixes = /^__(Host|Secure)/.test(name)
    const cookieParams = {
      ...restCookie,
      name: cookieHasSecurePrefixes ? name.replace(/^__/, '_'): name,
      url: url.origin,
      domain: name.startsWith('__Host-') ? undefined : url.hostname,
    }
    
    await setCookie(cookieParams)
  })
}
