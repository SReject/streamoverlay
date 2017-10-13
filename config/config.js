streamOverlayConfig = {
    widgets:[
        /* Widgets may be enabled or disabled by setting their 'enable' property
        ** to true (to enable) or false(to disable)
        **
        **
        ** Each widget may have the following values of which a user SHOULD NOT edit:
        **
        ** name: Required; Indicates the widget's name and the directory within
        **       /widgets/ where its resources reside
        **
        ** nojs: Optional; if true, the widget indicates it doesn't have a js
        **       file to load
        **
        ** nocss: Optional; if true, the widget indicates it doesn't have a css
        **        file to load
        **
        ** nocfg: Optional; if true, the widget indicates it doesn't have a
        **        configure pagelet to load
        */

        // Shows a list of social-platform user Id's at the top of the overlay
        {
            name:   'socialbox',
            enable: true,
            nocfg:  true,

            // List of social platforms
            //     text: The text to display byside the social icon
            //     icon: The font-awesome icon to use (see http://fontawesome.io/icons/ for icon list)
            //     iconfile: the path to an icon file to use instead of a font-icon
            //
            // Include as may as you like
            platforms: [
                {
                    icon: "twitter-square",
                    text: "SR3ject"
                }, {
                    icon: "steam-square",
                    text: "SR3ject"
                }, {
                    icon: "github-square",
                    text: "SReject",
                }
            ]
        },

        // Plays music from pandora
        {
            name:   'pandora',
            enable: true,
            nocss:  true,

            // default playback volume; must be a decimal between 0 and 1 (inclusive)
            volume: 0.35
        },

        // Shows the song title and artist of the currently played pandora song
        {
            name:   'pandorainfo',
            enable: true,
            nocfg:  true
        },

        // draws an audio visualization of the currently played pandora song
        {
            name:   'pandoraspectrum',
            enable: true,
            nocfg:  true
        },

        // Shows an overlaid box dependant on the currently obs scene
        {
            name:   'infobox',
            enable: true,
            nocfg:  true,

            // A list of scenes of which to show an info box
            scenes: {

                // obs scene named "starting"
                starting: {
                    // true|false to enable the infobox for the scene
                    show: true,

                    // Title text; shown as large text
                    title: 'SREJECT',

                    // Message under the title; smaller text
                    message: 'Starting',

                    // Starts a count-down from 300secs(5minutes)
                    // Once expired, the counter is replaced with "SoonTM"
                    //
                    // See the brb scene for a count-up timer
                    counter: {
                        type: 'down',
                        from: 300,
                        text: 'Soon\u2122'
                    }
                },
                brb: {
                    show: true,
                    title: 'Be Right Back',
                    message: 'Gone For',

                    // counts up from 0s
                    counter: {
                        type: 'up'
                    }
                },
                ending: {
                    show: true,
                    title: 'SREJECT',
                    message: 'Thanks for watching'
                }
            }
        },

        // Monitors for alerts(followers, subscribers, hosts) from mixer
        // and emits events; this DOES NOT handle showing an alert in the overlay
        {
            name:   'mixeralerts',
            enable: true,
            nocss:  true
        }
    ]
};
