(function (config) {
    let util = streamOverlay.util;
    let walk = streamOverlay.util.walk;

    let infobox = document.createElement('div');
    infobox.id = 'widget_infobox';

    let title = document.createElement('div');
    title.className = 'title';
    infobox.appendChild(title);

    let content = document.createElement('div');
    content.className = 'content';
    infobox.appendChild(content);

    let message = document.createElement('div');
    message.className = 'message';
    content.appendChild(message);

    let counter = document.createElement('div');
    counter.className = 'counter';
    counter.style.display = "none";
    content.appendChild(counter);

    let counterId = null;
    let counterDetails;
    let counterStart;

    function texttodiv(parent, text) {
        text.split('').forEach(chr => {
            let chrCont = document.createElement('div');
            if (chr === ' ') {
                  chrCont.appendChild(document.createTextNode('\u00A0'));
            } else {
                chrCont.appendChild(document.createTextNode(chr.toUpperCase()));
            }
            parent.appendChild(chrCont);
        });
    }

    function counterTick() {
        var hrs, min, sec, text = '';

        if (counterDetails.type == 'up') {
            sec = Math.floor((Date.now() - counterStart) / 1000);
        } else if (counterDetails.type === 'down') {
            sec = Math.ceil( (counterStart + (counterDetails.from * 1000) - Date.now()) / 1000);
        } else {
            throw new Error("Invalid infobox#counter type");
        }

        if (sec <= 0) {
            text = counterDetails.text || '00:00';
        } else {
            sec -= (hrs = Math.floor(sec / 3600)) * 3600;
            sec -= (min = Math.floor(sec / 60)) * 60;
            if (hrs) {
                text = (hrs < 10 ? ('0' + hrs) : hrs) + ':';
            }
            text += (min < 10 ? ('0' + min) : min) + ':';
            text += sec < 10 ? ('0' + sec) : String(sec);
        }

        if (counter.textContent !== text) {
            while (counter.firstChild) {
                counter.removeChild(counter.firstChild);
            }
            counter.appendChild(document.createTextNode(text));
        }
        if (sec >= 0 || counterDetails.type === 'up') {
            counterId = setTimeout(counterTick, 250);
        }
    }

    function update() {
        if (counterId) {
            clearTimeout(counterId);
            counterId = null;
        }
        if (walk(config, 'scenes', obsstudio.sceneName)) {
            let opts = config.scenes[obsstudio.sceneName];

            // title
            while (title.firstChild) {
                title.removeChild(title.firstChild);
            }
            if (opts.title) {
                texttodiv(title, opts.title);
                message.style.display = "flex";
            } else {
                message.style.display = "none";
            }

            // message
            while (message.firstChild) {
                message.removeChild(message.firstChild);
            }
            if (opts.message) {
                texttodiv(message, opts.message);
                message.style.display = "flex";
            } else {
                message.style.display = "none";
            }

            // counter
            if (walk(opts, 'counter')) {
                counterDetails = opts.counter;
                counterStart = Date.now();
                counterTick();
                counter.style.display = "block";
            } else {
                counter.style.display = "none";
            }
            document.body.appendChild(infobox);
        } else if (infobox.parentNode) {
            infobox.parentNode.removeChild(infobox);
        }
    }
    streamOverlay.addEventListener('obsSceneChange', update);
    update();
}(streamOverlay.config.widgets[document.querySelector('[data-widgetname=infobox]').getAttribute('data-widgetindex')]));
