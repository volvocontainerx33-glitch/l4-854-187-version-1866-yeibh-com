(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
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
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-slide"));
        show(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function textOf(card, name) {
    return (card.getAttribute(name) || "").toLowerCase();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var section = panel.parentElement;
      var grid = section ? section.querySelector("[data-movie-grid]") : null;
      var empty = section ? section.querySelector("[data-empty-state]") : null;
      var input = panel.querySelector("[data-filter-search]");
      var year = panel.querySelector("[data-filter-year]");
      var chips = Array.prototype.slice.call(panel.querySelectorAll(".filter-chip"));
      var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];
      var activeType = "all";

      if (panel.hasAttribute("data-search-page") && input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        input.value = q;
        if (year && year.options.length <= 1) {
          var years = [];
          cards.forEach(function (card) {
            var y = card.getAttribute("data-year") || "";
            if (y && years.indexOf(y) === -1) {
              years.push(y);
            }
          });
          years.sort(function (a, b) {
            return Number((b.match(/\d+/) || [0])[0]) - Number((a.match(/\d+/) || [0])[0]);
          });
          years.slice(0, 100).forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            year.appendChild(option);
          });
        }
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "all";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            textOf(card, "data-title"),
            textOf(card, "data-tags"),
            textOf(card, "data-region"),
            textOf(card, "data-year"),
            textOf(card, "data-type")
          ].join(" ");
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchYear = selectedYear === "all" || card.getAttribute("data-year") === selectedYear;
          var cardType = card.getAttribute("data-type") || "";
          var matchType = activeType === "all" || cardType === activeType;
          var show = matchQuery && matchYear && matchType;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("active");
          });
          chip.classList.add("active");
          activeType = chip.getAttribute("data-type") || "all";
          apply();
        });
      });
      apply();
    });
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-overlay");
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute("data-stream") || "";
      var loaded = false;
      var hls = null;

      function attach() {
        if (loaded || !stream) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          video.src = stream;
        }
      }

      function play() {
        attach();
        var result = video.play();
        shell.classList.add("playing");
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            shell.classList.remove("playing");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("play", function () {
        shell.classList.add("playing");
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("playing");
      });
      video.addEventListener("ended", function () {
        shell.classList.remove("playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
