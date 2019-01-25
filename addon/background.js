/*Событие нажатия на кнопку */
browser.browserAction.onClicked.addListener(playBtnClick);
/*Событие commands из манифеста*/
browser.commands.onCommand.addListener(hotKeyCommand);
/*Обработчик сообщения */
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request['action']) {
        case 'setTitle':
            browser.browserAction.setTitle({ title: request.title });
            break;
        case 'setPlay':
            refreshButton(request.isPlayed);
            break;
        case 'setMute':
            refreshMute(request.isMute);
            break;
    }
    sendResponse({ response: 'ok' });
});

const yandexPlayerUrl = 'https://music.yandex.ru/*';
const togglePlaybackCommand = 'toggle-playback';
const previousSongCommand = 'previous-song';
const nextSongCommand = 'next-song';
const toogleMuteComand = 'toogle-mute';
const volumeUpComand = 'volume-up';
const volumeDownComand = 'volume-down';


let isPressed = false;
let timerId = null;

/* Обновление иконки звука */
function refreshMute(isMute) {
    if (isMute) {
        browser.contextMenus.update('mute-tab-menu-item', {
            title: browser.i18n.getMessage('unmute'),
            icons: {
                16: 'icons/unmute_16.png',
                32: 'icons/unmute_32.png'
            }
        });
    } else {
        browser.contextMenus.update('mute-tab-menu-item', {
            title: browser.i18n.getMessage('mute'),
            icons: {
                16: 'icons/mute_16.png',
                32: 'icons/mute_32.png'
            }
        });
    }

}

/** Обновление иконки play */
function refreshButton(isPlay) {

    if (isPlay) {
        browser.browserAction.setBadgeText({
            text: ''
        });
        browser.browserAction.setIcon({
            path: {
                16: 'icons/pause_16.png',
                32: 'icons/pause_32.png',
                48: 'icons/pause_48.png',
                64: 'icons/pause_64.png',
                96: 'icons/pause_96.png'
            }
        });
        browser.contextMenus.update('toggle-playback-menu-item', {
            title: browser.i18n.getMessage('pause'),
            icons: {
                16: 'icons/pause_16.png',
                32: 'icons/pause_32.png'
            }
        });
    } else {
        browser.browserAction.setBadgeText({
            text: ''
        });
        browser.browserAction.setIcon({
            path: {
                16: 'icons/play_16.png',
                32: 'icons/play_32.png',
                48: 'icons/play_48.png',
                64: 'icons/play_64.png',
                96: 'icons/play_96.png'
            }
        });
        browser.contextMenus.update('toggle-playback-menu-item', {
            title: browser.i18n.getMessage('play'),
            icons: {
                16: 'icons/play_16.png',
                32: 'icons/play_32.png'
            }
        });
    }
}

async function openYandexMusic() {
    await browser.tabs.create({
        pinned: true,
        url: yandexPlayerUrl.replace('*', '')
    })
}
/*
function scriptFor(command) {
    switch (command) {
        case togglePlaybackCommand:
            break;
        //return scriptThatClicksOn('player-controls__btn_play', 'click');
        case previousSongCommand:
            return scriptThatClicksOn('player-controls__btn_prev', 'click');
        case nextSongCommand:
            return scriptThatClicksOn('player-controls__btn_next', 'click');
        case toogleMuteComand:
            return scriptThatClicksOn('volume__btn', 'mousedown');
    }
}

function scriptThatClicksOn(actionName, eventType, keyCode) {
    let script = function () {
        let button = document.getElementsByClassName('kitty');
        if (button.length > 0) {
            button[0].dispatchEvent(new Event('eventType', { bubbles: true, cancelable: false }));
        }
    };
    return '(' + script.toString().replace('kitty', actionName).replace('eventType', eventType) + ')()'
}
*/
/* Выполнение скрипта */
async function executeYandexMusicCommand(command) {
    console.log('[YaPlay] executing command: ', command);
    const ymTabs = await browser.tabs.query({ url: yandexPlayerUrl });
    if (ymTabs.length === 0) {
        openYandexMusic();
        return
    }
    for (let tab of ymTabs) {
        browser.tabs.sendMessage(tab.id, { action: command })
    }
}
/* Двойное нажатие на кнопку */
function playBtnClick() {
    if (isPressed) {
        clearTimeout(timerId);
        executeYandexMusicCommand(nextSongCommand);
        isPressed = false;
    } else {
        isPressed = true;
        timerId = setTimeout(() => {
            executeYandexMusicCommand(togglePlaybackCommand);
            isPressed = false;
        }, 300);
    }
}
/* Обработка горячих клавиш */
function hotKeyCommand(command) {
    switch (command) {
        case 'play':
            executeYandexMusicCommand(togglePlaybackCommand).catch((msg) => { onError(msg) })
            break;
        case 'previous':
            executeYandexMusicCommand(previousSongCommand).catch((msg) => { onError(msg) })
            break;
        case 'next':
            executeYandexMusicCommand(nextSongCommand).catch((msg) => { onError(msg) })
            break;
        case 'mute':
            executeYandexMusicCommand(toogleMuteComand).catch((msg) => { onError(msg) })
            break;
        case 'volumeUp':
            executeYandexMusicCommand(volumeUpComand).catch((msg) => { onError(msg) })
            break;
        case 'volumeDown':
            executeYandexMusicCommand(volumeDownComand).catch((msg) => { onError(msg) })
            break;
        default: console.log(`[YaPlay] Command ${command} not found `);
    }
}

/* Контекстное меню */
browser.contextMenus.create({
    id: 'toggle-playback-menu-item',
    title: browser.i18n.getMessage('play'),
    contexts: ['browser_action'],
    icons: {
        16: 'icons/play_16.png',
        32: 'icons/play_32.png'
    },
    onclick: () => executeYandexMusicCommand(togglePlaybackCommand).catch((msg) => { onError(msg) })
});
browser.contextMenus.create({
    id: 'previous-song-menu-item',
    title: browser.i18n.getMessage('previous'),
    contexts: ['browser_action'],
    icons: {
        16: 'icons/previoust_16.png',
        32: 'icons/previoust_32.png'
    },
    onclick: () => executeYandexMusicCommand(previousSongCommand).catch((msg) => { onError(msg) })
});
browser.contextMenus.create({
    id: 'next-song-menu-item',
    title: browser.i18n.getMessage('next'),
    contexts: ['browser_action'],
    icons: {
        16: 'icons/next_16.png',
        32: 'icons/next_32.png'
    },
    onclick: () => executeYandexMusicCommand(nextSongCommand).catch((msg) => { onError(msg) })
});

browser.contextMenus.create({
    id: 'mute-tab-menu-item',
    title: browser.i18n.getMessage('mute'),
    contexts: ['browser_action'],
    icons: {
        16: 'icons/mute_16.png',
        32: 'icons/mute_32.png'
    },
    onclick: () => executeYandexMusicCommand(toogleMuteComand).catch((msg) => { onError(msg) })
});

browser.contextMenus.create({
    id: 'open-setting-menu-item',
    title: browser.i18n.getMessage('Settings'),
    contexts: ['browser_action'],
    icons: {
        16: 'icons/setting_16.png',
        32: 'icons/setting_32.png'
    },
    onclick: () => browser.runtime.openOptionsPage()
        .catch((err) => {
            onError(err);
            browser.tabs.create({ url: browser.extension.getURL('settings.html') })
        })
});


/*Обработка ошибки */
function onError(error) {
    browser.notifications.create({
        type: `basic`,
        title: `Error`,
        message: `Error: ${error}`
    });
    console.log(`[YaPlay] error: ${error}`);
}