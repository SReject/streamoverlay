(function () {
    'use strict';

    let config,
        displaybox,
        next,
        cancelled,
        poller,
        counter;

    const streamOverlay = window.streamOverlay;
    const util          = streamOverlay.util;
    const mixer         = streamOverlay.mixer;
    const empty         = (node) => { while (node.firstChild) node.firstChild.remove(); return node };
    const formatTime    = (expire) => {
        if (expire <= Date.now()) {
            return 'expired';
        }
        let time = Math.floor((expire - Date.now()) / 1000);
        let min  = Math.floor(time / 60);
        let sec  = ('00' + String(time % 60)).slice(-2);
        return `${min}:${sec}`;
    };

    // build ooy-gui the hard way
    const errorBox = document.createElement('div');
    errorBox.className = "error hide";

    const infoBox = document.createElement('div');
    infoBox.className = 'info';
    infoBox.appendChild(document.createTextNode('After logging into your mixer stream account, navigate to '));

    const mixerLink = document.createElement('a');
    infoBox.appendChild(mixerLink);
    mixerLink.setAttribute('href', 'https://mixer.com/go');
    mixerLink.setAttribute('target', '_blank');
    mixerLink.appendChild(document.createTextNode('mixer.com/go'));
    infoBox.appendChild(document.createTextNode(' and then click the \'Get Code\' button below'));

    const codegroupBox = document.createElement('div');
    codegroupBox.className = 'codegroup hide';

    const codeBox = document.createElement('div');
    codegroupBox.appendChild(codeBox);
    codeBox.className = 'code';

    const expireBox = document.createElement('div');
    codegroupBox.appendChild(expireBox);
    expireBox.className = 'expires';
    expireBox.appendChild(document.createTextNode('After inputting the code into mixer, it may take upto 10seconds for this page to be notified.'));
    expireBox.appendChild(document.createElement('br'));
    expireBox.appendChild(document.createTextNode('The authorization code will expire in '));

    const expireTime = document.createElement('span');
    expireBox.appendChild(expireTime);
    expireTime.setAttribute('id', 'expiretime');

    const codeButtonBox = document.createElement('div');
    codeButtonBox.className = 'codebuttonbox';

    const codeButton = document.createElement('a');
    codeButtonBox.appendChild(codeButton);
    codeButton.appendChild(document.createTextNode('Get Code'));
    codeButton.className = 'getcode btn';
    codeButton.addEventListener('click', authorize);

    // authorizing function
    function authorize(evt) {
        evt.preventDefault();

        // reset errorbox
        empty(errorBox).className = 'error hide';

        // update button
        empty(codeButton).className = 'getcode btn disabled';
        codeButton.appendChild(document.createTextNode('Retrieving Code...'));
        codeButton.style.color = 'black';

        mixer.getShortCode('channel:details:self user:details:self')
        .then((res) => {
            if (cancelled) return;

            // update infobox
            empty(infoBox).appendChild(document.createTextNode('Enter the following code in the input provided by '));
            infoBox.appendChild(mixerLink);

            // update codegroup box
            codegroupBox.className = 'codegroup';
            codeBox.appendChild(document.createTextNode(res.code));
            expireTime.innerHTML = formatTime(res.expires);
            counter = setInterval(() => {
                expireTime.innerHTML = formatTime(res.expires);
                if (cancelled) {
                    clearTimeout(counter);
                }
            }, 500);

            // update button
            codeButton.innerHTML = 'Waiting for Authorization';

            // poll for authorization
            return poller = mixer.pollForAuth(res.handle, res.expires);
        })
        .then((authcode) => {
            if (counter) {
                clearInterval(counter);
                counter = null;
            }
            if (cancelled) return;

            // empty infobox
            empty(infoBox);

            // reset code box
            codegroupBox.className = 'codegroup hide';
            codeBox.innerHTML = "";
            empty(expireTime);

            // update button text
            codeButton.innerHTML = 'Exchanging code for authorization';

            // attempt to exchange authcode for oauth token
            return mixer.getTokenFromCode(authcode);
        })
        .then((token) => {
            localStorage.setItem('streamoverlay:mixeralerts:auth', JSON.stringify(token));
            next();
        })
        .catch((err) => {
            console.log(err);
            if (poller) {
                poller.cancel();
                poller = null
            }
            if (counter) {
                clearInterval(counter);
                counter = null;
            }
            if (!cancelled) {

                // update errorbox
                errorBox.innerHTML = `Error: ${err.message}`;
                errorBox.className = 'error';

                // reset infobox
                empty(infoBox).appendChild(document.createTextNode('After logging into your mixer stream account, navigate to '));
                infoBox.appendChild(mixerLink);
                infoBox.appendChild(document.createTextNode(' and then click the \'Get Code\' button below'));

                // reset code box
                codegroupBox.className = 'codegroup hide';
                codeBox.innerHTML = "";
                empty(expireTime);

                // reset button
                empty(codeButton).className = 'getcode btn';
                codeButton.style.color = '';
                codeButton.appendChild(document.createTextNode('Get Code'));
            }
        });
    }

    // register cancelled
    window.widgetexit = () => {
        if (poller) {
            poller.cancel();
            poll = null;
        }
        if (counter) {
            clearInterval(counter);
            counter = null;
        }
        cancelled = true;
    };

    // wait for the init function to get called
    window.widgetinit = (widgetConfig, widgetDisplayBox, loadNextWidget) => {
        config     = widgetConfig;
        displaybox = widgetDisplayBox;
        next       = loadNextWidget;

        // load style sheet
        util.loadStyleSheet('./widgets/mixeralerts/configure.css').then(() => {
            displaybox.appendChild(errorBox);
            displaybox.appendChild(infoBox);
            displaybox.appendChild(codegroupBox);
            displaybox.appendChild(codeButtonBox);

        // catch errors
        }).catch((err) => {
            console.error('[mixeralerts] Failed to load stylesheet');
            next();
        });
    };
}());
