(function () {
    const streamOverlay = window.streamOverlay;
    const config        = streamOverlay.config;

    let authTitleText = document.getElementById("configure_title_widgetname"),
        displayBox    = document.getElementById("configure_widgetdisplaybox"),
        skipButton    = document.getElementById("configure_footer_skipbutton").firstChild,
        index = -1,
        script,
        loadNextWidget;


    skipButton.addEventListener('click', (evt) => {
        evt.preventDefault();
        if (streamOverlay.util.isCallable(window.widgetexit)) {
            window.widgetexit();
        }
        if (script) {
            delete window.widgetinit;
            delete window.widgetexit;
            script.onerror = null;
            script.onload = null;
            script.remove();
            script = null;
        }
        if (config && Array.isArray(config.widgets) && index < config.widgets.length) {
            console.log('[StreamOverlay#Configure] Skipping current widget');
            loadNextWidget();
        }
    });


    loadNextWidget = () => {

        // cleanup last script loaded
        if (script) {
            delete window.widgetinit;
            delete window.widgetexit;
            script.onload = null;
            script.onerror = null;
            script.remove();
            skipButton.className = "btn disabled";
        }

        index += 1;

        // no more widgets to configure? Move to overlay page
        if (index >= config.widgets.length) {
            console.log('[StreamOverlay#configure] Done loading widget configure pages; redirecting to overlay');
            location.href = "./overlay.html";

        // Skip disabled widgets
        } else if (!config.widgets[index].enable) {
            console.log(`[StreamOverlay#configure] ${config.widgets[index].name} disabled; ignoring...`);
            loadNextWidget();

        } else if (config.widgets[index].nocfg) {
            console.log(`[StreamOverlay#Configure] ${config.widgets[index].name} indicates it does not have a configure page; ignoring...`);
            loadNextWidget();

        } else {
            let widget = config.widgets[index];

            authTitleText.innerText = widget.name;
            displayBox.innerHTML    = "Loading...";

            script = document.createElement('script');
            script.src = `./widgets/${widget.name}/configure.js`;

            script.onerror = ()=>{

                // cleanup after script
                delete window.widgetinit;
                delete window.widgetexit;
                script.onload = null;
                script.onerror = null;
                script.remove();

                // Attempt to load next widget configure.js
                console.log(`[StreamOverlay#configure] ${widget.name} failed to load; ignoring...`);
                loadNextWidget();
            };

            script.onload = ()=>{
                let init = window.widgetinit;
                let exit = window.widgetexit;

                // cleanup after the skip;
                delete window.widgetinit;
                delete window.widgetexit;
                script.onload = null;
                script.onerror = null;
                script.remove();

                // call the widgets init function
                if (streamOverlay.util.isCallable(init)) {
                    console.log(`[StreamOverlay#Configure] ${widget.name} configure.js Loaded`);
                    skipButton.className = "btn";
                    displayBox.className = widget.name;
                    displayBox.innerHTML = "";
                    init(widget, displayBox, loadNextWidget);

                // no init function? next widget please
                } else {
                    console.log(`[StreamOverlay#Configure] ${widget.name} configure.js did not provide a widgetinit function; ignoring...`);
                    loadNextWidget();
                }
            };
            document.body.appendChild(script);
        }
    };

    if (config && Array.isArray(config.widgets) && config.widgets.length) {
        console.log('[StreamOverlay#Configure] Loading widget configure pages...')
        loadNextWidget();

    } else {
        console.log('[StreamOverlay#Configure] No widgets to load')
        location.href = "./overlay.html"
    }
}());
