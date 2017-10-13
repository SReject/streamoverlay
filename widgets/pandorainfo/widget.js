(function (config) {
    let pandora = streamOverlay.pandora;

    const songinfo           = document.createElement('span');
    songinfo.style.display   = 'hidden';
    songinfo.style.animation = '';

    const songbox     = document.createElement('div');
    songbox.className = 'songinfo';
    songbox.appendChild(songinfo);

    const container = document.createElement('div');
    container.id    = "widget_pandorainfo";
    container.appendChild(songbox);
    document.body.appendChild(container);
    const htmlEscape = (str) => str.replace(/[<>&]/g, (a) => {
        if (a === '<') return '&lt;';
        if (a === '>') return '&gt;';
        if (a === '&') return '&amp;';
    });
    const setSongInfo = () => {
        if (pandora.isPlaying) {
            let title   = htmlEscape(pandora.songTitle),
                artist = htmlEscape(pandora.songArtist);

            songinfo.innerHTML = `<span class="songtitle">${title}</span><span class="seperator">by</span><span class="songartist">${artist}</span>`;
            setTimeout(() => {
                if (songinfo.offsetWidth > 400) {
                    songinfo.style.transform  = 'translateX(100%)';
                    songinfo.style.animmation = 'widget_pandoramarquee 20s linear infinite';
                }
                songinfo.style.display = 'inline-block';
            },0)

        } else if (songinfo.style.display !== 'hidden') {
            songinfo.style.display   = 'hidden';
            songinfo.style.animation = '';
            songinfo.innerHTML       = '';
        }
    };
    const init = () => {
        pandora = streamOverlay.pandora;
        streamOverlay.addEventListener('pandora:songplay', setSongInfo);
        streamOverlay.addEventListener('pandora:songend', setSongInfo);
        streamOverlay.addEventListener('pandora:error', (...args) => {
            console.log(args);
            setSongInfo();
        });
        setSongInfo();
    }

    if (pandora && pandora.isReady) {
        init();
    } else {
        streamOverlay.addEventListener('pandora:ready', init);
    }
}(streamOverlay.config.widgets[document.querySelector('[data-widgetname=pandorainfo]').getAttribute('data-widgetindex')]));
