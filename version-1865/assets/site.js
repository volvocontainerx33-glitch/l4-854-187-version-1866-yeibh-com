(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
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
        play();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function initFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
    if (!lists.length) return;
    var input = document.querySelector('[data-search-input]');
    var year = document.querySelector('[data-year-filter]');
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (input && q) input.value = q;

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var selectedYear = normalize(year ? year.value : '');
      var visible = 0;
      lists.forEach(function (list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year')
          ].join(' '));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matched = (!keyword || haystack.indexOf(keyword) !== -1) && (!selectedYear || cardYear === selectedYear);
          card.classList.toggle('is-hidden', !matched);
          if (matched) visible += 1;
        });
      });
      if (empty) empty.classList.toggle('show', visible === 0);
    }

    if (input) input.addEventListener('input', apply);
    if (year) year.addEventListener('change', apply);
    apply();
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();

function initMoviePlayer(src) {
  var video = document.querySelector('[data-player-video]');
  var start = document.querySelector('[data-player-start]');
  if (!video || !start || !src) return;
  var loaded = false;
  var hls = null;

  function attach() {
    if (loaded) return;
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
  }

  function play() {
    attach();
    start.classList.add('hidden');
    video.controls = true;
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {
        start.classList.remove('hidden');
      });
    }
  }

  start.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) play();
  });
}
