import eruda from "eruda";
import On from "on-dom";
import "./style.css";

(() => {
  eruda.init();
  const log = console.log;

  const ONESEC = 1e3;

  // const appRotate = select(".app-rotate");
  const appType = select(".app-type");
  // const appFlash = select(".app-flash");
  const captureButton = select(".capture");
  const videoButton = select("button.video");
  const photoButton = select("button.photo");

  const canvas = select("canvas");
  const video = select("video");
  const link = document.createElement("a");

  const videoChunks = [];

  let streaming = false;
  let isPhoto = true;
  let timer = 0;
  let sec = 0;

  function select(str = "html") {
    return document.querySelector(str);
  }

  // Make sure to grant your browser permission for both mic and webcam else nothing will work
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then((stream) => {
      const recorder = new MediaRecorder(stream);
      video.srcObject = stream;
      video.play();

      new On(recorder, {
        start: (e) => log("started"),
        dataavailable(e) {
          videoChunks.push(e.data);
        },
        stop() {
          const blob = new Blob(videoChunks, { type: "video/mp4" });
          const videoLink = URL.createObjectURL(blob);
          link.href = videoLink;
          link.download = `video-${Math.floor(Math.random() * 255)}.mp4`;
          link.click();

          videoChunks.length = 0; // clean up
          URL.revokeObjectURL(videoLink); // against data leaks
        },
        error: (e) => log(e),
      });

      const captureEvents = new On(captureButton, {
        pointerover() {
          this.classList.add("over");
        },
        pointerleave() {
          this.classList.remove("over");
        },
        click() {
          streaming = !streaming;
          if (streaming && !isPhoto) {
            recorder.start();
          } else if (!streaming && !isPhoto) {
            recorder.stop();
            // stream.getTracks().forEach((track) => track.stop());
          }
        },
      });

      videoButton.onclick = (e) => {
        isPhoto = false;
        appType.textContent = "🎥";
        captureButton.classList.add("is-video");
      };
      photoButton.onclick = (e) => {
        appType.textContent = "📷";
        isPhoto = true;
        streaming = false;
        captureButton.classList.contains("is-video")
          ? captureButton.classList.remove("is-video")
          : void 0;
      };
    })
    .catch((err) => console.warn(err));
})();
