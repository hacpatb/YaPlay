//configuration of the observer:
let config = { attributes: true, childList: true, characterData: true };
//title observer
let title = document.querySelector('head > title');
let titleObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        browser.runtime.sendMessage({
            action: 'setTitle',
            title: mutation.target.innerText
        })
            .then(handleResponse, onError);
    });
});
titleObserver.observe(title, config);

//button observer
let butTarget = document.querySelector('.player-controls__btn_play');
let butObserver1 = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.attributeName == 'class') {
            let isPlayed = mutation.target.className.split(' ').some((i) => {
                return i.search('pause') != -1;
            });
            browser.runtime.sendMessage({
                action: 'setPlay',
                isPlayed: isPlayed
            })
                .then(handleResponse, onError);
        }

    });
});
butObserver1.observe(butTarget, config);

//volume observer
let volumeTarget = document.querySelector('.volume__icon');
let volumeObserver1 = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.attributeName == 'class') {
            let isMute = mutation.target.className.split(' ').some((i) => {
                return i.search('mute') != -1;
            });
            browser.runtime.sendMessage({
                action: 'setMute',
                isMute: isMute
            })
                .then(handleResponse, onError);
        }

    });
});
volumeObserver1.observe(volumeTarget, config);

function getState() {
    let api = window.wrappedJSObject.externalAPI
    state = {
        ...api.getCurrentTrack(),
        ...api.getControls(),
        isPlaying: api.isPlaying(),
        volume: api.getVolume() || 0
    }
}

browser.runtime.onMessage.addListener(request => {
    if (request) {
        let api = window.wrappedJSObject.externalAPI
        switch (request.action) {
            case 'toggle-playback':
                api.togglePause();
                break;
            case 'previous-song':
                api.prev();
                break;
            case 'next-song':
                api.next();
                break;
            case 'toogle-mute':
                api.toggleMute();
                break;
            case 'liked':
                api.toggleLike();
                //sendPlayerState() // toggleLike can't be detected by observer
                break;
            case 'disliked':
                api.toggleDislike();
                //sendPlayerState() // toggleDislike can't be detected by observer
                break;
            case 'volume-up':
                api.setVolume(api.getVolume() + 0.1 > 1 ? 1 : api.getVolume() + 0.1);
                //sendPlayerState()
                break;
            case 'volume-down':
                api.setVolume(api.getVolume() - 0.1 < 0 ? 0 : api.getVolume() - 0.1);
                //sendPlayerState()
                break;
            case 'GET_PLAYER_STATE':
                //sendPlayerState()
                break;
            default:
                break;
        }
    }
})

function handleResponse(message) {
    console.log(`[YaPlay] Message from background: ${message.response}`);
}

function onError(error) {
    console.log(`[YaPlay] error: ${error}`);
}




// later, you can stop observing
//observer.disconnect();

