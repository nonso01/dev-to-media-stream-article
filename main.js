import eruda from "eruda";
import On from "on-dom";
import "./style.css";

(() => {
  eruda.init();
  const log = console.log;

  const ONESEC = 1e3;

  const appClose = select(".app-close");
  const appTimer = select(".app-timer");
  const appFlash = select(".app-flash");
  const captureButton = select(".capture");
  const videoButton = select("button.video");
  const photoButton = select("button.photo");

  const canvas = select("canvas");
  const video = select("video");

  let streaming = false;
  let isPhoto = true;
  let timer = 0;
  let sec = 0;
  let timerCallback;

  function select(str = "html") {
    return document.querySelector(str);
  }

  function time() {
    let date = new Date();
    sec = date.getSeconds();
    sec >= 59 ? (timer += 1) : void 0;
    appTimer.textContent = `${Math.round(timer / 60)}: ${sec}`;
    timerCallback = requestAnimationFrame(time);
  }

  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
      log(stream);
      video.play();
    })
    .catch((err) => console.warn(err));

  const captureEvents = new On(captureButton, {
    pointerover() {
      this.classList.add("over");
    },
    pointerleave() {
      this.classList.remove("over");
    },
    click() {
      !isPhoto ? (timerCallback = requestAnimationFrame(time)) : void 0;
    },
  });

  videoButton.onclick = (e) => {
    isPhoto = false;
    captureButton.classList.add("is-video");
  };
  photoButton.onclick = (e) => {
    cancelAnimationFrame(timerCallback);
    isPhoto = true;
    captureButton.classList.contains("is-video")
      ? captureButton.classList.remove("is-video")
      : void 0;
  };
})();
