(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var header = document.querySelector(".site-header");
    var button = document.querySelector(".menu-toggle");
    if (!header || !button) {
      return;
    }
    button.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = parseInt(dot.getAttribute("data-slide"), 10);
        show(next);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupCatalogFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".catalog-filter"));
    forms.forEach(function (form) {
      var section = form.closest("section") || document;
      var items = Array.prototype.slice.call(section.querySelectorAll(".catalog-item"));
      var empty = section.querySelector(".empty-state");

      function filter() {
        var keyword = normalize(form.querySelector('[name="keyword"]') && form.querySelector('[name="keyword"]').value);
        var region = normalize(form.querySelector('[name="region"]') && form.querySelector('[name="region"]').value);
        var type = normalize(form.querySelector('[name="type"]') && form.querySelector('[name="type"]').value);
        var year = normalize(form.querySelector('[name="year"]') && form.querySelector('[name="year"]').value);
        var visible = 0;

        items.forEach(function (item) {
          var text = normalize([
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-type"),
            item.getAttribute("data-year"),
            item.getAttribute("data-genre"),
            item.getAttribute("data-tags")
          ].join(" "));
          var ok = true;
          if (keyword && text.indexOf(keyword) === -1) {
            ok = false;
          }
          if (region && normalize(item.getAttribute("data-region")) !== region) {
            ok = false;
          }
          if (type && normalize(item.getAttribute("data-type")) !== type) {
            ok = false;
          }
          if (year && normalize(item.getAttribute("data-year")) !== year) {
            ok = false;
          }
          item.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      form.addEventListener("input", filter);
      form.addEventListener("change", filter);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        filter();
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-cover");
      var stream = player.getAttribute("data-stream");
      var attached = false;
      var hls = null;

      if (!video || !stream) {
        return;
      }

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function start() {
        attach();
        player.classList.add("is-playing");
        var playback = video.play();
        if (playback && typeof playback.catch === "function") {
          playback.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          start();
        });
      }

      player.addEventListener("click", function (event) {
        if (event.target === video || video.contains(event.target)) {
          return;
        }
        if (!player.classList.contains("is-playing")) {
          start();
        }
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  function createMovieCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      '<a class="movie-card" href="./' + escapeHtml(movie.file) + '">',
      '<span class="poster-wrap">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="play-pulse">▶</span>',
      '<span class="corner-tag left">' + escapeHtml(movie.region) + '</span>',
      '<span class="corner-tag right">' + escapeHtml(movie.type) + '</span>',
      '<span class="poster-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</span>',
      '</span>',
      '<span class="movie-card-body">',
      '<strong>' + escapeHtml(movie.title) + '</strong>',
      '<span class="card-tags">' + tags + '</span>',
      '<em>' + escapeHtml(movie.oneLine) + '</em>',
      '</span>',
      '</a>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    if (!form || !results || !summary || !window.MOVIE_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var queryInput = form.querySelector('[name="q"]');
    var regionSelect = form.querySelector('[name="region"]');
    var typeSelect = form.querySelector('[name="type"]');

    var regions = [];
    var types = [];
    window.MOVIE_DATA.forEach(function (movie) {
      if (regions.indexOf(movie.region) === -1) {
        regions.push(movie.region);
      }
      if (types.indexOf(movie.type) === -1) {
        types.push(movie.type);
      }
    });

    regions.sort().forEach(function (region) {
      var option = document.createElement("option");
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    });

    types.sort().forEach(function (type) {
      var option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    });

    queryInput.value = params.get("q") || "";
    regionSelect.value = params.get("region") || "";
    typeSelect.value = params.get("type") || "";

    function runSearch() {
      var q = normalize(queryInput.value);
      var region = normalize(regionSelect.value);
      var type = normalize(typeSelect.value);
      var matched = window.MOVIE_DATA.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          movie.tags.join(" ")
        ].join(" "));
        if (q && text.indexOf(q) === -1) {
          return false;
        }
        if (region && normalize(movie.region) !== region) {
          return false;
        }
        if (type && normalize(movie.type) !== type) {
          return false;
        }
        return true;
      });
      var shown = matched.slice(0, 120);
      results.innerHTML = shown.map(createMovieCard).join("");
      summary.textContent = "找到 " + matched.length + " 部影片" + (matched.length > shown.length ? "，当前显示前 " + shown.length + " 部" : "");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var next = new URLSearchParams();
      if (queryInput.value.trim()) {
        next.set("q", queryInput.value.trim());
      }
      if (regionSelect.value) {
        next.set("region", regionSelect.value);
      }
      if (typeSelect.value) {
        next.set("type", typeSelect.value);
      }
      var url = window.location.pathname + (next.toString() ? "?" + next.toString() : "");
      window.history.replaceState(null, "", url);
      runSearch();
    });

    form.addEventListener("input", runSearch);
    form.addEventListener("change", runSearch);
    runSearch();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupCatalogFilters();
    setupPlayers();
    setupSearchPage();
  });
})();
