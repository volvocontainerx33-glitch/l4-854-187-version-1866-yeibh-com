(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initMobileMenu() {
        var toggle = qs('[data-menu-toggle]');
        var menu = qs('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initGlobalSearch() {
        qsa('.global-search').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input[name="q"]', form);
                var query = input ? input.value.trim() : '';
                var url = './categories.html';
                if (query) {
                    url += '?q=' + encodeURIComponent(query);
                }
                window.location.href = url;
            });
        });
    }

    function initHero() {
        var slider = qs('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = qsa('[data-hero-slide]', slider);
        var dots = qsa('[data-hero-dot]', slider);
        var prev = qs('[data-hero-prev]', slider);
        var next = qs('[data-hero-next]', slider);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener('click', function () {
                show(itemIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function initFilters() {
        var panel = qs('[data-filter-panel]');
        var list = qs('[data-filter-list]');
        if (!panel || !list) {
            return;
        }
        var cards = qsa('[data-title]', list);
        var searchInput = qs('[data-filter-search]', panel);
        var regionSelect = qs('[data-filter-region]', panel);
        var typeSelect = qs('[data-filter-type]', panel);
        var yearSelect = qs('[data-filter-year]', panel);
        var reset = qs('[data-filter-reset]', panel);
        var empty = qs('[data-filter-empty]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');
        if (initial && searchInput) {
            searchInput.value = initial;
        }

        function matches(card) {
            var query = normalize(searchInput ? searchInput.value : '');
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var text = normalize(card.getAttribute('data-tags') || card.textContent);
            var ok = true;
            if (query) {
                ok = ok && text.indexOf(query) !== -1;
            }
            if (region) {
                ok = ok && (card.getAttribute('data-region') || '') === region;
            }
            if (type) {
                ok = ok && (card.getAttribute('data-type') || '') === type;
            }
            if (year) {
                ok = ok && (card.getAttribute('data-year') || '') === year;
            }
            return ok;
        }

        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var ok = matches(card);
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        if (reset) {
            reset.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                }
                if (regionSelect) {
                    regionSelect.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                apply();
            });
        }
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initGlobalSearch();
        initHero();
        initFilters();
    });
})();
