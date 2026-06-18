(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = qs("[data-menu-toggle]");
        var panel = qs("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            document.body.classList.toggle("nav-open", open);
            button.setAttribute("aria-expanded", String(open));
        });
    }

    function initHero() {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = qsa("[data-hero-slide]", hero);
        var dots = qsa("[data-hero-dot]", hero);
        var prev = qs("[data-hero-prev]", hero);
        var next = qs("[data-hero-next]", hero);
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener("click", function () {
                show(itemIndex);
                start();
            });
        });
        hero.addEventListener("mouseenter", function () {
            clearInterval(timer);
        });
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var forms = qsa("[data-filter-form]");
        forms.forEach(function (form) {
            var scope = form.closest("main") || document;
            var grid = qs("[data-filter-grid]", scope);
            if (!grid) {
                return;
            }
            var cards = qsa("[data-filter-card]", grid);
            var input = qs("[data-filter-input]", form);
            var year = qs("[data-year-filter]", form);
            var region = qs("[data-region-filter]", form);
            var genre = qs("[data-genre-filter]", form);
            var empty = qs("[data-empty-state]", scope);
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value.trim().toLowerCase() : "";
                var regionValue = region ? region.value.trim().toLowerCase() : "";
                var genreValue = genre ? genre.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
                    var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
                    var cardGenre = (card.getAttribute("data-genre") || "").toLowerCase();
                    var match = true;
                    if (query && text.indexOf(query) === -1) {
                        match = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        match = false;
                    }
                    if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                        match = false;
                    }
                    if (genreValue && cardGenre.indexOf(genreValue) === -1 && text.indexOf(genreValue) === -1) {
                        match = false;
                    }
                    card.hidden = !match;
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, year, region, genre].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                apply();
            });
            apply();
        });
    }

    function initPlayer(streamUrl) {
        var video = qs("[data-player-video]");
        var cover = qs("[data-player-cover]");
        var trigger = qs("[data-player-button]");
        if (!video || !streamUrl) {
            return;
        }
        var started = false;
        var hls;

        function begin() {
            if (started) {
                video.play();
                return;
            }
            started = true;
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                    started = false;
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", begin);
        }
        if (trigger) {
            trigger.addEventListener("click", begin);
        }
        video.addEventListener("click", function () {
            if (!started) {
                begin();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
    });

    window.MovieSite = {
        initPlayer: initPlayer
    };
})();
