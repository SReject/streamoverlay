(function (config) {
    let walk = streamOverlay.util.walk;

    let container = document.createElement('div');
    container.id ="widget_socialbox";

    if (Array.isArray(walk(config, 'platforms'))) {
        let added = false;

        config.platforms.forEach(platform => {
            let item = document.createElement('div'), iconGph;
            if (typeof platform.text === 'string' && platform.text !== '') {
                if (typeof platform.icon === 'string' && platform.icon !== '') {
                    iconGph = document.createElement('i');
                    iconGph.className = "socialicon fa fa-" + platform.icon;
                    item.appendChild(iconGph);

                } else if (typeof platform.iconfile === 'string' && platform.iconfile !== '') {
                    iconGph = document.createElement('img');
                    iconGph.src = platform.iconfile;
                    iconGph.className = 'icon';
                    item.appendChild(iconGph);
                }
                text = document.createElement('span');
                text.appendChild(document.createTextNode(platform.text));
                item.appendChild(text);
                container.appendChild(item);
                added = true;
            }
        });
        if (added) {
            document.body.appendChild(container);
        }
    }
}(streamOverlay.config.widgets[document.querySelector('[data-widgetname=socialbox]').getAttribute('data-widgetindex')]));
