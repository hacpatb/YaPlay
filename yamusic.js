//configuration of the observer:
let config = { attributes: true, childList: true, characterData: true };
//title observer
let title = document.querySelector('head > title');
let titleObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        browser.runtime.sendMessage({
            action:'setTitle',
            title: mutation.target.innerText
        })
            .then(handleResponse, handleError);
    });
});
titleObserver.observe(title, config);

//button observer
let butTarget = document.querySelector('.player-controls__btn_play');
let butObserver1 = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if(mutation.attributeName == 'class'){
            let isPlayed = mutation.target.className.split(' ').some( (i) => {
                return i.search('pause') != -1;
            });
            browser.runtime.sendMessage({
                action:'setPlay',
                isPlayed: isPlayed
            })
                .then(handleResponse, handleError);
        }

    });
});
butObserver1.observe(butTarget, config);

//volume observer
let volumeTarget = document.querySelector('.volume__icon');
let volumeObserver1 = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if(mutation.attributeName == 'class'){
            let isMute = mutation.target.className.split(' ').some( (i) => {
                return i.search('mute') != -1;
            });
            browser.runtime.sendMessage({
                action:'setMute',
                isMute: isMute
            })
                .then(handleResponse, handleError);
        }

    });
});
volumeObserver1.observe(volumeTarget, config);




// later, you can stop observing
//observer.disconnect();

