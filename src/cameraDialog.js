import saveImage from "./svgs/save.svg";
import pauseImage from "./svgs/pause-btn.svg";
import xCircleImage from "./svgs/x-circle.svg";

var video;
var playing = true;

console.log(saveImage);

window.openCamera = function openCamera() {
  let cameraDialog = document.getElementById("camera-dialog");

  cameraDialog.classList.remove("hidden");
  cameraDialog.innerHTML =
    "<video id='camera-element' autoplay></video><div id='camera-control'></div>";
  cameraElement = document.getElementById("camera-element");

  playCamera();

  let cameraControl = document.getElementById("camera-control");

  cameraControl.innerHTML +=
    "<input id='save-image' type='image' onClick='save()' />";
  cameraControl.innerHTML +=
    "<input id='pause-play' type='image' onClick='togglePause()' />";
  cameraControl.innerHTML +=
    "<input id='close-camera' type='image' onClick='closeCamera()' />";

  saveImageElement = document.getElementById("save-image");
  pausePlayElement = document.getElementById("pause-play");
  closeElement = document.getElementById("close-camera");

  saveImageElement.src = saveImage;
  pausePlayElement.src = pauseImage;
  closeElement.src = xCircleImage;
};

window.closeCamera = function closeCamera() {
  let cameraDialog = document.getElementById("camera-dialog");
  let cameraElement = document.getElementById("camera-element");

  cameraElement.remove();
  cameraDialog.classList.add("hidden");

  stopCamera();
};

window.togglePause = function togglePause() {
  let cameraElement = document.getElementById("camera-element");

  if (playing) {
    cameraElement.pause();
    playing = false;
  } else {
    playCamera();
    playing = true;
  }
};

function stopCamera() {
  var stream = video.srcObject;
  var tracks = stream.getTracks();

  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];
    track.stop();
  }

  video.srcObject = null;
}

function playCamera() {
  video = document.querySelector("#camera-element");

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function (error) {
        console.log("Something went wrong!");
      });
  }
}
