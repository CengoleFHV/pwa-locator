import saveImage from "./save.svg";

var video;

window.openCamera = function openCamera() {
  let cameraDialog = document.getElementById("camera-dialog");

  cameraDialog.classList.remove("hidden");
  cameraDialog.innerHTML =
    "<video id='camera-element' autoplay='true'></video><div id='camera-control'></div>";
  cameraElement = document.getElementById("camera-element");

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

  let cameraControl = document.getElementById("camera-control");

  cameraControl.innerHTML +=
    "<input id='save-image' class='camera-control-button' type='image' onClick='saveImage()' />";
  cameraControl.innerHTML +=
    "<input id='pause-play' class='camera-control-button' type='image' onClick='togglePause()' />";
  cameraControl.innerHTML +=
    "<input id='closeCamera' class='camera-control-button' type='image' onClick='closeCamera()' />";

  saveImage = document.getElementById("saveImage");
  pausePlay = document.getElementById("pause-play");
  save = document.getElementById("save");

  saveImage.src = saveImage;
};

window.closeCamera = function closeCamera() {
  let cameraDialog = document.getElementById("camera-dialog");
  let cameraElement = document.getElementById("camera-element");

  cameraElement.remove();
  cameraDialog.classList.add("hidden");

  stopCamera();
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
