(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalFilters();
    initPlayer();
    initSearchPage();
  });

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initLocalFilters() {
    var bars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar]'));
    bars.forEach(function (bar) {
      var scope = document.querySelector(bar.getAttribute('data-filter-bar')) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var input = bar.querySelector('[data-filter-text]');
      var select = bar.querySelector('[data-filter-select]');
      var reset = bar.querySelector('[data-filter-reset]');
      var empty = document.querySelector('[data-empty-state]');

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var selected = select ? select.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
          var type = card.getAttribute('data-type') || '';
          var typeOk = !selected || type === selected || keywords.indexOf(selected.toLowerCase()) !== -1;
          var ok = (!query || keywords.indexOf(query) !== -1) && typeOk;
          card.style.display = ok ? '' : 'none';
          if (ok) visible += 1;
        });
        if (empty) empty.classList.toggle('visible', visible === 0);
      }

      if (input) input.addEventListener('input', apply);
      if (select) select.addEventListener('change', apply);
      if (reset) {
        reset.addEventListener('click', function () {
          if (input) input.value = '';
          if (select) select.value = '';
          apply();
        });
      }
    });
  }

  function initPlayer() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.play-overlay');
      var state = shell.querySelector('.video-state');
      var stream = video ? video.getAttribute('data-stream') : '';
      var attached = false;
      var hls = null;
      if (!video || !stream) return;

      function setState(text) {
        if (!state) return;
        state.textContent = text;
        state.classList.add('show');
        window.clearTimeout(state._timer);
        state._timer = window.setTimeout(function () {
          state.classList.remove('show');
        }, 2500);
      }

      function attach() {
        if (attached) return Promise.resolve();
        attached = true;
        var lower = stream.toLowerCase();
        if (lower.indexOf('.m3u8') !== -1 && window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) return;
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
              setState('正在重新连接');
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
              setState('正在恢复播放');
            } else {
              setState('播放暂不可用');
            }
          });
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            window.setTimeout(resolve, 900);
          });
        }
        video.src = stream;
        return Promise.resolve();
      }

      function play() {
        attach().then(function () {
          if (button) button.classList.add('hidden');
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
              setState('点击视频继续播放');
            });
          }
        });
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          play();
        });
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        if (button) button.classList.add('hidden');
      });

      video.addEventListener('pause', function () {
        setState('已暂停');
      });

      window.addEventListener('beforeunload', function () {
        if (hls) hls.destroy();
      });
    });
  }

  function initSearchPage() {
    var root = document.querySelector('[data-search-page]');
    if (!root || !window.SEARCH_ITEMS) return;
    var form = root.querySelector('[data-search-form]');
    var input = root.querySelector('[data-search-input]');
    var result = root.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) input.value = query;

    function render(value) {
      var q = (value || '').trim().toLowerCase();
      var items = window.SEARCH_ITEMS.filter(function (item) {
        return !q || item.k.toLowerCase().indexOf(q) !== -1;
      }).slice(0, 80);
      if (!items.length) {
        result.innerHTML = '<div class="empty-state visible">没有找到匹配的影片</div>';
        return;
      }
      result.innerHTML = '<div class="grid-cards large">' + items.map(function (item) {
        return '<article class="movie-card"><a class="card-link" href="' + escapeHtml(item.u) + '"><div class="poster-wrap"><img src="' + escapeHtml(item.i) + '" alt="' + escapeHtml(item.t) + '" loading="lazy" onerror="this.remove()"><span class="year-badge">' + escapeHtml(item.y) + '</span><span class="play-badge">▶</span></div><div class="card-info"><div class="tag-line"><span>' + escapeHtml(item.r) + '</span><span>' + escapeHtml(item.g) + '</span></div><h3>' + escapeHtml(item.t) + '</h3><p>' + escapeHtml(item.o) + '</p></div></a></article>';
      }).join('') + '</div>';
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render(input ? input.value : '');
      });
    }

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    render(query);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
