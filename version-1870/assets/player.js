(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".player-cover");
      var button = shell.querySelector(".player-start");

      if (!video || !cover || !button) {
        return;
      }

      var stream = video.getAttribute("data-stream");
      var initialized = false;
      var hls = null;

      function attachStream() {
        if (initialized || !stream) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }

        initialized = true;
      }

      function startPlayback() {
        attachStream();
        cover.classList.add("is-hidden");
        video.controls = true;
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }

      button.addEventListener("click", startPlayback);
      cover.addEventListener("click", startPlayback);
      video.addEventListener("click", function () {
        if (!initialized) {
          startPlayback();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
