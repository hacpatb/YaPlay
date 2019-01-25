/* global browser, ShortcutCustomizeUI */
async function buildShortcutCustomizeUI() {
  const browserInfo = await browser.runtime.getBrowserInfo()
  const runtimeBrowserName = browserInfo ? browserInfo.name : 'unknown'
  const runtimeIsFirefox = !!runtimeBrowserName.match('Firefox')
  const shortcutsSection = document.getElementById('hotkey')
  if (runtimeIsFirefox) {
    shortcutsSection.classList.add('firefox')
    // Firefox does not provide native UI for customizing shortcuts, just an API
    // so we use a lib that builds UI in userland
    ShortcutCustomizeUI.build().then(list => {
      // remove old UI, if any
      while (shortcutsSection.firstChild) {
        shortcutsSection.removeChild(shortcutsSection.firstChild)
      }
      shortcutsSection.insertAdjacentHTML('afterbegin', `<h2>${browser.i18n.getMessage('settingHotKeys')}</h2>`)
      shortcutsSection.appendChild(list)
      shortcutsSection.insertAdjacentHTML('beforeend', browser.i18n.getMessage("notificationContent", 'https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/commands#Shortcut_values'));
    })
  }
}
document.addEventListener('DOMContentLoaded', buildShortcutCustomizeUI)