let api = window.wrappedJSObject.externalAPI;
let sendState = () => {
    let state = {
        ...api.getCurrentTrack(),
        ...api.getControls(),
        isPlaying: api.isPlaying(),
        volume: api.getVolume() || 0
    }
    browser.runtime.sendMessage({ state })
}

let copyLink = () => {
    let buff = document.querySelector('#buff-link');
    buff.value = (api.getCurrentTrack()) ? window.location.hostname + api.getCurrentTrack().link : ';)';
    buff.select();
    document.execCommand('copy');
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
                break;
            case 'volume-down':
                api.setVolume(api.getVolume() - 0.1 < 0 ? 0 : api.getVolume() - 0.1);
                break;
            case 'copy-link':
                copyLink();
                break;
            default:
                break;
        }
    }
});

(function initObserver() {
    //window.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    let config = {
        attributes: true
    };

    /* Кнопки */
    let target = document.querySelector('body')
    let observer = new MutationObserver(mutation => {
        if (mutation[0].attributeName === 'data-unity-state' ||
            mutation[0].attributeName === 'data-unity-supports') {
            sendState();
        }
    })
    observer.observe(target, config);

    /* Громкость */
    let volumeTarget = document.querySelector('.volume__icon');
    let volumeObserver = new MutationObserver(mutation => {
        if (mutation[0].attributeName == 'class') {
            sendState()
        }
    });
    volumeObserver.observe(volumeTarget, config);
    
    /* Элемент-буффер куда пихается ссылка на песню */
    let newEl = document.createElement('input');
    newEl.id = 'buff-link';
    newEl.value= '';
    document.body.append(newEl); 
})()

