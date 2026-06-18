(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.getElementById("videoPlayer");
    var button = document.querySelector("[data-play-button]");
    var message = document.querySelector("[data-player-message]");

    if (!video || !button) {
      return;
    }

    button.addEventListener("click", function () {
      var source = video.getAttribute("data-src");
      button.classList.add("is-hidden");
      setMessage("正在载入播放源...");

      if (!source) {
        setMessage("当前影片缺少播放源。请检查 m3u8 地址。")
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage("");
          video.play().catch(function () {
            setMessage("浏览器阻止了自动播放，请再次点击视频播放。")
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage("播放源加载失败，请稍后重试。")
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          setMessage("");
          video.play().catch(function () {
            setMessage("浏览器阻止了自动播放，请再次点击视频播放。")
          });
        }, { once: true });
      } else {
        setMessage("当前浏览器不支持 HLS 播放，请更换现代浏览器。")
      }
    });

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }
  });
})();
