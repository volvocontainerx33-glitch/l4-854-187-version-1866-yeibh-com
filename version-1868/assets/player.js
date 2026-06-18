(function () {
    window.initMoviePlayer = function (url) {
        var video = document.getElementById('movieVideo');
        var gate = document.getElementById('playGate');
        if (!video || !url) {
            return;
        }
        var loaded = false;
        var hls = null;

        function begin() {
            if (!loaded) {
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new Hls({ enableWorker: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    video.src = url;
                }
                video.setAttribute('controls', 'controls');
            }
            if (gate) {
                gate.classList.add('is-hidden');
            }
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        if (gate) {
            gate.addEventListener('click', begin);
        }
        video.addEventListener('click', begin);
        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    };
})();
