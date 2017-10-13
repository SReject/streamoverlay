(function (config) {
    let pandora = streamOverlay.pandora,

        infoUpdateId,
        animationId,

        audioCxt,
        audioSrc,
        audioAsr,
        audioBuf,
        cvsNode     = document.createElement('canvas'),
        cvsCtx      = cvsNode.getContext('2d'),
        cvsWidth,
        cvsHeight,
        cvsGradient,

        meterNum    = 60,
        meterSpace  = 2,
        meterWidth;


    // setup canvas & gradient
    cvsNode.id = 'widget_pandoraspectrum';

    const visualize = () => {
        let freqData,
            step,
            i = 0,
            value;

        freqData = new Uint8Array(audioAsr.frequencyBinCount);
        audioAsr.getByteFrequencyData(freqData);

        // clear canvas
        cvsCtx.clearRect(0, 0, cvsWidth, cvsHeight);

        // not playing
        if (!pandora.isPlaying) {
            console.log("[visualizer] Not playing; so not drawing");
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            return;
        }

        // draw meters
        step = Math.floor(freqData.length / meterNum);
        for (;i < meterNum; i += 1) {
            value = Math.floor(cvsHeight * (freqData[i * step] / 255));
            cvsCtx.fillStyle = cvsGradient;
            cvsCtx.fillRect(i * meterWidth,  cvsHeight - value, meterWidth, cvsHeight);
        }
        animationId = requestAnimationFrame(visualize);
    };

    const onAudioStart = () => {
        visualize();
    };
    const onAudioPause = (evt) => {
        if (evt.data === true) {
            cancelAnimationFrame(animationId);
            animationId = null;
        } else {
            visualize();
        }
    };
    const onAudioEnd = () => {
        cancelAnimationFrame(animationId);
        animationId = null;
        cvsCtx.clearRect(0, 0, cvsWidth, cvsHeight);
    };

    const init = () => {

        // store audio context and analyser
        audioCtx = pandora.audioContext;
        audioAsr = pandora.audioAnalyser;

        // prepare canvas
        let parent = document.getElementById("widget_pandorainfo");
        if (parent.firstChild) {
            parent.insertBefore(cvsNode, parent.firstChild);
        } else {
            parent.appendChild(cvsNode);
        }
        cvsWidth  = cvsNode.offsetWidth;
        cvsHeight = cvsNode.offsetHeight;

        // Prepare gradient
        cvsGradient = cvsCtx.createLinearGradient(0, 0, 1, cvsHeight);
        cvsGradient.addColorStop(0, 'rgba(0,192,255, .15)');
        cvsGradient.addColorStop(.5,'rgba(0,128,192, .25)');
        cvsGradient.addColorStop(1, 'rgba(0,128,192, .75)');

        meterWidth = cvsWidth / (meterNum + meterSpace);

        // listen for related events
        streamOverlay.addEventListener('pandora:songplay',  onAudioStart);
        streamOverlay.addEventListener('pandora:songend',   onAudioEnd);
        streamOverlay.addEventListener('pandora:songstop',  onAudioEnd);

        if (pandora.isPlaying) {
            visualize();
        }
    };

    if (!streamOverlay.pandoraPlay || !streamOverlay.pandoraplay.ready) {
        streamOverlay.addEventListener('pandora:ready', init);
    } else {
        init();
    }
}(streamOverlay.config.widgets[document.querySelector('[data-widgetname=pandoraspectrum]').getAttribute('data-widgetindex')]));
