(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var menu = document.querySelector('.mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = !menu.hasAttribute('hidden');
      if (isOpen) {
        menu.setAttribute('hidden', '');
        button.setAttribute('aria-expanded', 'false');
      } else {
        menu.removeAttribute('hidden');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
  }

  function setupPageFilter() {
    var input = document.getElementById('pageFilter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        card.style.display = haystack.indexOf(keyword) === -1 ? 'none' : '';
      });
    });
  }

  function setupVideos() {
    var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-m3u8]'));
    videos.forEach(function (video) {
      var src = video.getAttribute('data-m3u8');
      var shell = video.closest('[data-video-shell]');
      var overlay = shell ? shell.querySelector('.player-overlay') : null;
      if (!src) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }

      function play() {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }

      function toggle() {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      }

      if (overlay) {
        overlay.addEventListener('click', function (event) {
          event.preventDefault();
          play();
        });
      }
      video.addEventListener('click', function () {
        toggle();
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
      video.addEventListener('ended', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    });
  }

  function cardTemplate(movie) {
    return [
      '<article class="movie-card group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">',
      '<a href="' + movie.url + '" class="block">',
      '<div class="relative overflow-hidden aspect-[3/4]">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async">',
      '<div class="absolute inset-0 bg-card-hover opacity-0 group-hover:opacity-100 transition-opacity"><div class="absolute inset-0 flex items-center justify-center"><span class="play-badge">▶</span></div></div>',
      '<span class="absolute top-3 left-3 bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-medium">' + escapeHtml(movie.region) + '</span>',
      '<span class="absolute top-3 right-3 bg-amber-500 text-white px-2 py-1 rounded text-xs font-medium">' + escapeHtml(movie.type) + '</span>',
      '<div class="absolute bottom-0 left-0 right-0 p-3 card-gradient"><span class="text-white text-xs">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</span></div>',
      '</div>',
      '<div class="p-4">',
      '<h3 class="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">' + escapeHtml(movie.title) + '</h3>',
      '<p class="text-sm text-gray-600 line-clamp-2 leading-relaxed">' + escapeHtml(movie.oneLine) + '</p>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupSearchPage() {
    var data = window.MOVIE_SEARCH_DATA;
    var results = document.getElementById('searchResults');
    var input = document.getElementById('searchInput');
    var status = document.getElementById('searchStatus');
    if (!data || !results || !input || !status) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;
    if (!query.trim()) {
      status.textContent = '热门内容推荐';
      return;
    }
    var words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    var matched = data.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' ').toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);
    status.textContent = matched.length ? '找到 ' + matched.length + ' 条相关内容' : '没有找到完全匹配的内容，可尝试更换关键词';
    results.innerHTML = matched.map(cardTemplate).join('');
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupPageFilter();
    setupVideos();
    setupSearchPage();
  });
})();
