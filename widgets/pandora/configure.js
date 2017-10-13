(function() {
    window.widgetinit = (config, displaybox, next) => {

        // load style sheet
        window.streamOverlay.util.loadStyleSheet('./widgets/pandora/configure.css')
        .then(() => {
            let infoBox = document.createElement('div');
            infoBox.className = "info";
            infoBox.appendChild(document.createTextNode(`Due to pandora not having an offical API a username and password is required. Your login information is NEVER shared outside of interacting with pandora's own site and is stored within Chromium's own encrypted LocalStorage interface.`));
            displaybox.appendChild(infoBox);

            let form = document.createElement('form');
            form.addEventListener('submit', function verify(evt) {
                evt.preventDefault();

                let user = userInput.value, pass = passInput.value;

                if (user && pass) {
                    localStorage.setItem('streamoverlay:pandora', JSON.stringify({user: user, pass: pass}));
                    form.removeEventListener('submut', verify);
                    next();
                }
            });
            displaybox.appendChild(form);

            let groupBox = document.createElement('div');
            groupBox.className = "group";
            form.appendChild(groupBox);

            let userBox = document.createElement('div');
            groupBox.appendChild(userBox);

            let userLabel = document.createElement('label');
            userBox.appendChild(userLabel);
            userLabel.setAttribute('for', 'pandora_email');
            userLabel.appendChild(document.createTextNode('Email'));

            let userInput = document.createElement('input');
            userBox.appendChild(userInput);
            userInput.setAttribute('type', 'email');
            userInput.setAttribute('id', 'pandora_email');
            userInput.required = true;

            let passBox = document.createElement('div');
            groupBox.appendChild(passBox);

            let passLabel = document.createElement('label');
            passBox.appendChild(passLabel);
            passLabel.setAttribute('for', 'pandora_pass');
            passLabel.appendChild(document.createTextNode('Password'));

            let passInput = document.createElement('input');
            passBox.appendChild(passInput);
            passInput.setAttribute('type', 'password');
            passInput.setAttribute('id', 'pandora_pass');
            passInput.required = true;

            let saveBox = document.createElement('div');
            groupBox.appendChild(saveBox);
            saveBox.className = "savecontainer";

            let saveButton = document.createElement('input');
            saveBox.appendChild(saveButton);
            saveButton.setAttribute('type', 'submit');
            saveButton.className = 'save btn';
            saveButton.value = 'Save';

        // stylesheet failed to load
        })
    };
}());
