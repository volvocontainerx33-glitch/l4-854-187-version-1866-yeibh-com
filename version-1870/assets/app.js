(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.hidden = !mobileNav.hidden;
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));

    if (slides.length > 1) {
      var active = 0;
      var showSlide = function (index) {
        active = index;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === active);
        });
      };

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });

      setInterval(function () {
        showSlide((active + 1) % slides.length);
      }, 5200);
    }

    var searchInput = document.getElementById("movie-search");
    var regionSelect = document.getElementById("filter-region");
    var typeSelect = document.getElementById("filter-type");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));

    var applyFilters = function () {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var region = regionSelect ? regionSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";

      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }

        card.hidden = !matched;
      });
    };

    [searchInput, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  });
})();
