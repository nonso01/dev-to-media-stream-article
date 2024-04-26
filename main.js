import On from "on-dom";
import "./style.css";

const log = console.log;
const ONESEC = 1e3;

// const appRotate = select(".app-rotate");
const appType = select(".app-type");
const appBeep = select(".app-beep");
const captureButton = select(".capture");
const videoButton = select("button.video");
const photoButton = select("button.photo");

const canvas = select("canvas");
const video = select("video");
const photo = select(".app-media img");
const link = document.createElement("a");

const ctx = canvas.getContext("2d");

const videoChunks = [];

let streaming = false;
let isPhoto = true;

function select(str = "html") {
  return document.querySelector(str);
}

function clearPhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const data = canvas.toDataURL("image/png");
  photo.setAttribute("src", data);
}

function capturePhoto(w = video.videoWidth, h = video.videoHeight) {
  if (w && h) {
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);
    const data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);

    fetch(data, { mode: "no-cors" }) /* download your image */
      .then((res) => res.blob())
      .then((blob) => {
        const photoLink = URL.createObjectURL(blob);
        link.href = photoLink;
        link.download = `image-${Math.floor(Math.random() * 250)}.png`;
        link.click();

        URL.revokeObjectURL(photoLink);
      })
      .catch((err) => console.warn(err?.message));
  } else clearPhoto();
}

// Make sure to grant your browser permission for both mic and webcam else nothing will work
const grantAccess = navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream /* MediaStream */) => {
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp8,opus",
    });

    video.srcObject = stream;
    video.play();

    const recorderEvents = new On(recorder, {
      start: (e) => log("video started"),
      dataavailable: (e) => videoChunks.push(e.data),
      stop() {
        const blob = new Blob(videoChunks, { type: "video/webm" });
        const videoLink = URL.createObjectURL(blob);
        link.href = videoLink;
        link.download = `video-${Math.floor(Math.random() * 255)}.webm`;
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
          clearPhoto();

          appBeep.classList.add("beep");
        } else if (!streaming && !isPhoto) {
          recorder.stop();
          clearPhoto();

          appBeep.classList?.remove("beep");
          // stream.getTracks().forEach((track) => track.stop());
          log("video ended");
        } else if (!streaming && isPhoto) {
          capturePhoto();

          // minimal animation
          photo.classList.add("captured");
          photo.ontransitionend = () =>
            setTimeout(() => {
              photo.classList?.remove("captured");
            }, ONESEC * 1.5);
        }
      },
    });

    videoButton.onclick = (e) => {
      isPhoto = false;
      clearPhoto();

      appType.textContent = "🎥";
      captureButton.classList.add("is-video");
    };

    photoButton.onclick = (e) => {
      appType.textContent = "📷";
      recorder.stop();

      isPhoto = true;
      streaming = false;

      captureButton.classList.contains("is-video")
        ? captureButton.classList.remove("is-video")
        : void 0;
      appBeep.classList.remove("beep");
    };
  })
  .catch((err) => console.warn(err));
