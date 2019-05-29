/*Событие нажатия на кнопку */
browser.browserAction.onClicked.addListener(playBtnClick);
/*Событие commands из манифеста*/
browser.commands.onCommand.addListener(hotKeyCommand);
/*Обработчик сообщения */
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request['state']) {
        refreshButton(request['state']['isPlaying']);
        browser.browserAction.setTitle({ title: ` ${request['state']['artists'].map(artist => artist['title']).join(', ')} - ${request['state']['title']}` });
        refreshMute(request['state']['volume'] == 0);

    }
});

const yandexPlayerUrl = 'https://music.yandex.ru/*';
const togglePlaybackCommand = 'toggle-playback';
const previousSongCommand = 'previous-song';
const nextSongCommand = 'next-song';
const toogleMuteCommand = 'toogle-mute';
const volumeUpCommand = 'volume-up';
const volumeDownCommand = 'volume-down';
const copyLinkToSongCommand = 'copy-link';


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

/* Выполнение скрипта */
async function executeYandexMusicCommand(command) {
    console.log('[YaPlay] executing command:', command);
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
let isPressed = false;
let timerId = null;
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
            executeYandexMusicCommand(togglePlaybackCommand).catch((msg) => { onError(msg) });
            break;
        case 'previous':
            executeYandexMusicCommand(previousSongCommand).catch((msg) => { onError(msg) });
            break;
        case 'next':
            executeYandexMusicCommand(nextSongCommand).catch((msg) => { onError(msg) });
            break;
        case 'mute':
            executeYandexMusicCommand(toogleMuteCommand).catch((msg) => { onError(msg) });
            break;
        case 'volumeUp':
            executeYandexMusicCommand(volumeUpCommand).catch((msg) => { onError(msg) });
            break;
        case 'volumeDown':
            executeYandexMusicCommand(volumeDownCommand).catch((msg) => { onError(msg) });
            break;
        case 'copyLink':
            executeYandexMusicCommand(copyLinkToSongCommand)
            .then(() => { browser.notifications.create({
                    type: `basic`,
                    title: browser.i18n.getMessage('copyLinkToSong'),
                    message: browser.i18n.getMessage('copyLinkToSongMessage')
                });
            })
            .catch((msg) => { onError(msg) });
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
    onclick: () => executeYandexMusicCommand(toogleMuteCommand).catch((msg) => { onError(msg) })
});

browser.contextMenus.create({
    id: 'copy-link-tab-menu-item',
    title: browser.i18n.getMessage('copyLinkToSong'),
    contexts: ['browser_action'],
    icons: {
        16: 'icons/link_16.png',
        32: 'icons/link_32.png'
    },
    onclick: () => executeYandexMusicCommand(copyLinkToSongCommand)
    .then(() => { browser.notifications.create({
            type: `basic`,
            title: browser.i18n.getMessage('copyLinkToSong'),
            message: browser.i18n.getMessage('copyLinkToSongMessage')
        });
    })
    .catch((msg) => { onError(msg) })
});

browser.contextMenus.create({
    id: 'open-setting-menu-item',
    title: browser.i18n.getMessage('settings'),
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