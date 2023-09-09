
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

class AlertController {

  constructor(){
    this.ID_CONTAINER = 'alerts'
    this.timeouts = []
  }

  _buildAlert({message, type}){
    const alert = document.createElement('div')
    alert.classList = `alert-item ${type}`
    const alertMessage = document.createElement('p')
    alertMessage.innerHTML = message

    alert.appendChild(alertMessage)
    return alert
  }

  publishAlert({
    message = '',
    timeoutInMilliseconds = 5000,
    type = 'warning',
  }){
    const alertAsElement = this._buildAlert({ message, type })
    const container = document.getElementById(this.ID_CONTAINER)

    container.appendChild(alertAsElement)
    if(this.timeouts.length === 0){
      container.style.display = 'flex'
    }

    const idTimeout = setTimeout(() => {
      container.removeChild(alertAsElement)

      this.timeouts = this.timeouts.filter(val => val !== idTimeout)
      if(this.timeouts.length === 0){
        container.style.display = 'none'
      }

    }, timeoutInMilliseconds)
    this.timeouts.push(idTimeout)
  }

}

const alertController = new AlertController()

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
    const canPastePrefixedCookie = url.protocol === 'https:'
    const prefixedCookieHasToBeReplaced = cookieHasSecurePrefixes && !canPastePrefixedCookie

    const cookieParams = {
      ...restCookie,
      name: prefixedCookieHasToBeReplaced ? name.replace(/^__/, '_'): name,
      url: url.origin,
      domain: name.startsWith('__Host-') ? undefined : url.hostname,
    }
    if(prefixedCookieHasToBeReplaced){
      alertController.publishAlert({
        message: `The cookie whose name is ${name} has to be stripped of the '_' on the start as cannot be created programmatically, edit the cookie manually`
      })
    }
    await setCookie(cookieParams)
  })
}
