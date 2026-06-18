(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navPanel = document.querySelector('[data-nav-panel]');

    if (navToggle && navPanel) {
        navToggle.addEventListener('click', function () {
            navPanel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterList = document.querySelector('[data-filter-list]');
    var emptyState = document.querySelector('[data-empty-state]');
    var clearButton = document.querySelector('[data-filter-clear]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var activeChip = '';

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function updateFilter() {
        if (!filterList) {
            return;
        }

        var query = normalize(filterInput ? filterInput.value : '');
        var chip = normalize(activeChip);
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-movie-card]'));
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' '));
            var queryMatch = !query || haystack.indexOf(query) !== -1;
            var chipMatch = !chip || haystack.indexOf(chip) !== -1;
            var shouldShow = queryMatch && chipMatch;
            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', visible === 0);
        }
    }

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var queryParam = params.get('q');
        if (queryParam) {
            filterInput.value = queryParam;
        }
        filterInput.addEventListener('input', updateFilter);
    }

    if (clearButton) {
        clearButton.addEventListener('click', function () {
            if (filterInput) {
                filterInput.value = '';
            }
            activeChip = '';
            filterButtons.forEach(function (button) {
                button.classList.toggle('active', button.getAttribute('data-filter-value') === '');
            });
            updateFilter();
        });
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeChip = button.getAttribute('data-filter-value') || '';
            filterButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });
            updateFilter();
        });
    });

    updateFilter();

    var hlsLoader = null;

    function ensureHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        if (hlsLoader) {
            hlsLoader.addEventListener('load', callback, { once: true });
            return;
        }

        hlsLoader = document.createElement('script');
        hlsLoader.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
        hlsLoader.async = true;
        hlsLoader.addEventListener('load', callback, { once: true });
        document.head.appendChild(hlsLoader);
    }

    function preparePlayer(frame, shouldPlay) {
        var source = frame.getAttribute('data-video-source');
        var video = frame.querySelector('video');
        var overlay = frame.querySelector('.player-overlay');

        if (!source || !video) {
            return;
        }

        function playVideo() {
            frame.classList.add('is-ready');
            if (overlay) {
                overlay.setAttribute('aria-hidden', 'true');
            }
            if (shouldPlay) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        }

        if (frame.getAttribute('data-player-ready') === 'true') {
            playVideo();
            return;
        }

        frame.setAttribute('data-player-ready', 'true');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
            video.load();
            return;
        }

        ensureHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            } else {
                video.src = source;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
                video.load();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-video-source]')).forEach(function (frame) {
        var overlay = frame.querySelector('.player-overlay');
        var bar = frame.closest('.player-card');
        var trigger = bar ? bar.querySelector('[data-player-trigger]') : null;

        frame.addEventListener('click', function (event) {
            if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
                preparePlayer(frame, false);
                return;
            }
            preparePlayer(frame, true);
        });

        if (overlay) {
            overlay.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                preparePlayer(frame, true);
            });
        }

        if (trigger) {
            trigger.addEventListener('click', function () {
                preparePlayer(frame, true);
                frame.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }
    });
})();
