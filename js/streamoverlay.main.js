(function () {
    const obs           = window.obsstudio;
    const streamOverlay = window.streamOverlay;
    const util          = streamOverlay.util;
    const config        = streamOverlay.config;

    let docReady      = document.readyState !== "loading";

    // hook obs events
    let emitObsEvent = (event) => {
        var name = 'obs' + event.type.replace(/^./, a => a.toUpperCase());
        streamOverlay.dispatchEvent(name, event.cancelable, event.data);
    };
    obs.addEventListener('streamingState', emitObsEvent, false);
    obs.addEventListener('recordingState', emitObsEvent, false);
    obs.addEventListener('sceneChange',    emitObsEvent, false);
    obs.addEventListener('exit',           emitObsEvent, false);


    // wait for obsstudio to get ready the load widgets
    let loadWidgets = () => {
        if (!Array.isArray(util.walk(config, 'widgets'))) {
            console.log('[streamOverlay#start/loadWidgets] No widgets to load')
            return
        }

        config.widgets.forEach((widget, idx) => {
            console.log(`[streamOverlay#start/loadWidgets] Processing: ${widget.name}`);
            try {
                if (widget.enable) {
                    if (!widget.nojs) {
                        console.log(`    Loading /widgets/${widget.name}/widget.js`);

                        let script = document.createElement("script");
                        script.src = `./widgets/${widget.name}/widget.js`;
                        script.setAttribute("data-widgetname", widget.name);
                        script.setAttribute("data-widgetIndex", idx);
                        document.body.appendChild(script);

                    } else {
                        console.log(`    Ignoring Script`);
                    }

                    if (!widget.nocss) {
                        console.log(`    Loading /widgets/${widget.name}/widget.css`);
                        let style = document.createElement("link");
                        style.rel = "stylesheet";
                        style.href = `./widgets/${widget.name}/widget.css`;
                        document.body.appendChild(style);
                    } else {
                        console.log(`    Ignoring Style`);
                    }
                } else {
                    console.log(`    Disabled`);
                }
            } catch (e) {
                console.log(e)

            }
        });
    };

    if (docReady && obs.isReady) {
        loadWidgets();

    } else {
        const readyCheck = function readyCheck() {
            if (!docReady && document.readyState !== "loading") {
                docReady = true;
                if (docReady) {
                    document.removeEventListener('readystatechange', readyCheck);
                }
            }
            if (docReady && obs.isReady) {
                loadWidgets();
            }
        }
        if (!obs.isReady) {
            obs.on('ready', readyCheck, true);
        }
        if (document.readyState === 'loading') {
            document.addEventListener('readystatechange', readyCheck);
        }
    }
}());
