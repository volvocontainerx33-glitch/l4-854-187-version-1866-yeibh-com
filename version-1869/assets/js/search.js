(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var input = document.getElementById("searchInput");
    var typeSelect = document.getElementById("searchType");
    var regionSelect = document.getElementById("searchRegion");
    var results = document.getElementById("searchResults");
    var count = document.getElementById("searchCount");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (!input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    input.value = initialQuery;

    function render() {
      var query = input.value.trim().toLowerCase();
      var typeValue = typeSelect ? typeSelect.value : "";
      var regionValue = regionSelect ? regionSelect.value : "";
      var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = movie.searchText || "";
        var ok = !query || haystack.indexOf(query) !== -1;

        if (typeValue && movie.type !== typeValue) {
          ok = false;
        }

        if (regionValue && movie.region.indexOf(regionValue) === -1) {
          ok = false;
        }

        return ok;
      }).slice(0, 240);

      results.innerHTML = matched.map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + movie.url + '">',
          '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="poster-fallback">' + escapeHtml(movie.title) + '</span>',
          '    <span class="play-pill">播放</span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
          '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
          '    <p>' + escapeHtml(movie.oneLine) + '</p>',
          '    <div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');

      if (count) {
        count.textContent = String(matched.length);
      }

      results.querySelectorAll("img").forEach(function (img) {
        img.addEventListener("error", function () {
          img.classList.add("image-missing");
          img.removeAttribute("src");
        });
      });
    }

    input.addEventListener("input", render);
    if (typeSelect) {
      typeSelect.addEventListener("change", render);
    }
    if (regionSelect) {
      regionSelect.addEventListener("change", render);
    }

    render();
  });

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }
})();
