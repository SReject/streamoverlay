(function (config) {
    const streamOverlay = window.streamOverlay;
    const mixer         = streamOverlay.mixer;
    const util          = streamOverlay.util;
    const request       = util.request;

    let auth      = localStorage.getItem('streamoverlay:mixeralerts:auth'),
        followers = JSON.parse(localStorage.getItem('streamoverlay:mixeralerts:followers') || '{}'),
        folLastUpdate = followers.lastUpdate,
        folPage   = 0,
        hosters   = {},
        chanid,
        userid,
        alertws;

    if (!auth) {
        console.error("[widget/mixeralerts] No authorization stored; not loading");
        return;
    }
    try {
        auth = JSON.parse(auth);
    } catch (err) {
        console.error("[widget/mixeralerts] Authorization invalid; not loading");
        return;
    }
    console.log('[widget/mixeralerts] Validating stored authorization');

    const getFollowers = () => {
        let url = `${mixer.uris.apibase}channels/${chanid}/follow?limit=100&page=${folPage}&fields=id`;
        if (folLastUpdate) {
            let since = new Date(folLastUpdate)
            url += `&where=followed.createdAt:gt:${since.toISOString()}`;
        }
        request('GET', url)
        .then((req) => {
            if (req.status !== 200) {
                throw new Error(`Mixer returned ${req.status} status code while trying to retrieve followers`);
            } else {
                JSON.parse(req.responseText).forEach((user) => {
                    followers[user.id] = true;
                });
                followers.lastUpdate = Date.now();
                folPage += 1;
                let folCount = folPage * 100 + 100;
                let max = req.getResponseHeader('x-total-count');
                if (max && folCount < max) {
                    getFollowers();
                } else {
                    localStorage.setItem('streamoverlay:mixeralerts:followers', JSON.stringify(followers))
                }
            }
        })
        .catch((err) => {
            console.error('[widget/mixeralerts] Failed to get follower list', err);
        });
    };
    const startAlerts = () => {
        alertws = new WebSocket(`${mixer.uris.realtime}?authorization=Bearer%20${auth.token}`);
        alertws.addEventListener('open', (event) => {
            alertws.send(JSON.stringify({
                type: 'method',
                method: 'livesubscribe',
                params: {
                    events: [
                        `channel:${chanid}:followed`,
                        `channel:${chanid}:subscribed`,
                        `channel:${chanid}:hosted`
                    ]
                },
                id: 0
            }));
        });
        alertws.addEventListener('message', (event) => {
            let msg = JSON.parse(event.data);
            if (msg.type === 'event' && msg.event === 'live') {
                let evttype = msg.data.channel.replace(/^(?:[^:]+:)+/g, '');

                // track followers
                if (evttype === 'followed' && !util.owns(followers, msg.data.payload.user.id) && msg.data.payload.following) {
                    streamOverlay.dispatchEvent('mixeralert:follow', true, msg.data);
                    followers[msg.data.payload.user.id] = true;
                    followers.lastUpdate = Date.now();
                    localStorage.setItem('streamoverlay:mixeralerts:followers', JSON.stringify(followers));

                } else if (evttype === 'subscribed') {
                    streamOverlay.dispatchEvent('mixeralert:subscribe', true, msg.data);

                } else if (evttype === 'hosted') {
                    if (!util.owns(hosters, msg.data.payload.hosterId)) {
                        streamOverlay.dispatchEvent('mixeralert:host', true, msg.data);
                    }
                    hosters[msg.data.payload.hosterId] = true;
                }
            }
        });
        alertws.addEventListener('close', (event) => {
            startAlerts();
        });
    };
    const validate = (norefresh) => {
        return new Promise((resolve, reject) => {
            request(
                'GET',
                `${mixer.uris.apibase}users/current`,
                [['Authorization', `Bearer ${auth.token}`]]
            )
            .then((req) => {
                if (req.status === 200) {
                    let res = JSON.parse(req.responseText);
                    resolve({
                        user: res.id,
                        chan: res.channel.id
                    });

                } else if (req.status === 403) {
                    reject(new Error('BAD OAUTH REQUEST'));

                } else if (req.status !== 401) {
                    reject(new Error(`UNKNOWN_STATUS_CODE:${req.status}`));

                } else if (norefresh) {
                    reject(new Error('FAILED TO REFRESH AUTH'));

                } else {
                    return mixer.refreshOAuthToken(auth.refresh).then((token) => {
                        localStorage.setItem('streamoverlay:mixeralerts:auth', JSON.stringify(auth = token));
                        return validate(true);
                    });
                }
            })
            .catch((err) => {
                reject(err);
            });
        });
    };
    validate()
    .then((res) => {
        console.log('validated', res);
        userid = res.user;
        chanid = res.chan;
        getFollowers();
        startAlerts();
        streamOverlay.dispatchEvent('mixeralerts:ready', false);
    })
    .catch((err) => {
        console.error('[widget/mixeralerts] Auth validation failed:', err)
    });
}(streamOverlay.config.widgets[document.querySelector('[data-widgetname=mixeralerts]').getAttribute('data-widgetindex')]));
