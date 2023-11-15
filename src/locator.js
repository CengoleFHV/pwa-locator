import cameraImage from "./camera.svg";
import saveImage from "./svgs/save.svg";
import pauseImage from "./svgs/pause-btn.svg";
import playImage from "./svgs/play-btn.svg";
import xCircleImage from "./svgs/x-circle.svg";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const COORD_FORMATTER = Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 6,
  maximumFractionDigits: 6,
  minimumIntegerDigits: 3,
  style: "unit",
  unit: "degree",
});
const DIST_FORMATTER = Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  style: "unit",
  unit: "meter",
});
const DEG_FORMATTER = Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  style: "unit",
  unit: "degree",
});

const LOCATION_LEFT_ID = "location-left";
const LOCATION_MIDDLE_ID = "location-middle";
const CAMERA_INPUT_ID = "camera";

//map state
var map;
var ranger;

function isTouchDevice() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

function configureMap(latLngArray) {
  map = L.map("map").setView(latLngArray, 17);
  if (isTouchDevice()) {
    map.removeControl(map.zoomControl);
  }
  map.attributionControl.setPosition("bottomleft");

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  ranger = L.circle(latLngArray, { radius: 20.0 }).addTo(map);

  map.on("locationfound", onLocationFound);
  map.on("locationerror", onLocationError);
}

function updatePosition(position) {
  const locatorLeftDiv = document.getElementById(LOCATION_LEFT_ID);
  const locatorMiddleDiv = document.getElementById(LOCATION_MIDDLE_ID);

  const coords = position.coords;
  console.debug(`got new coordinates: ${coords}`);
  locatorLeftDiv.innerHTML = `
        <dl>
            <dt>LAT</dt>
            <dd>${COORD_FORMATTER.format(coords.latitude)}</dd>
            <dt>LONG</dt>
            <dd>${COORD_FORMATTER.format(coords.longitude)}</dd>
            <dt>ALT</dt>
            <dd>${
              coords.altitude ? DIST_FORMATTER.format(coords.altitude) : "-"
            }</dd>
        </dl>`;
  locatorMiddleDiv.innerHTML = `
        <dl>
            <dt>ACC</dt>
            <dd>${DIST_FORMATTER.format(coords.accuracy)}</dd>
            <dt>HEAD</dt>
            <dd>${
              coords.heading ? DEG_FORMATTER.format(coords.heading) : "-"
            }</dd>
            <dt>SPD</dt>
            <dd>${coords.speed ? DIST_FORMATTER.format(coords.speed) : "-"}</dd>
        </dl>`;
  var ll = [coords.latitude, coords.longitude];

  map.setView(ll);

  ranger.setLatLng(ll);
  ranger.setRadius(coords.accuracy);
}

/* setup component */
window.onload = () => {
  const cameraButton = document.getElementById(CAMERA_INPUT_ID);
  const queryParams = new URLSearchParams(window.location.search);

  //setup UI
  cameraButton.src = cameraImage;

  //init leaflet
  configureMap([47.406653, 9.744844]);

  //init footer
  updatePosition({
    coords: {
      latitude: 47.406653,
      longitude: 9.744844,
      altitude: 440,
      accuracy: 40,
      heading: 45,
      speed: 1.8,
    },
  });

  // setup service worker
  const swDisbaled = queryParams.get("service-worker") === "disabled";
  console.debug(
    `query param 'service-worker': ${queryParams.get(
      "service-worker"
    )}, disabled: ${swDisbaled}`
  );
  if (!swDisbaled && "serviceWorker" in navigator) {
    navigator.serviceWorker
      .register(new URL("serviceworker.js", import.meta.url), {
        type: "module",
      })
      .then(() => {
        console.log("Service worker registered!");
      })
      .catch((error) => {
        console.warn("Error registering service worker:");
        console.warn(error);
      });
  }

  map.locate({ setView: true, maxZoom: 18 });
};

function onLocationFound(e) {
  var radius = e.accuracy;

  updatePosition({
    coords: {
      latitude: e.latlng.lat,
      longitude: e.latlng.lng,
      accuracy: radius,
      heading: Math.random() * 360,
      speed: Math.random() * 25,
    },
  });
}

function onLocationError(e) {
  alert(e.message);
}

/*
 *
 * had to import everything into one file somehow or parcel will explode
 * was originally in cameraDialog.js
 */

var video;
var playing = true;

window.openCamera = function openCamera() {
  let cameraDialog = document.getElementById("camera-dialog");

  cameraDialog.classList.remove("hidden");
  cameraDialog.innerHTML =
    "<video id='camera-element' autoplay></video><div id='camera-control'></div>";
  cameraElement = document.getElementById("camera-element");

  playCamera();

  let cameraControl = document.getElementById("camera-control");

  cameraControl.innerHTML +=
    "<input id='save-image' type='image' onClick='save()' disabled />";
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
  playing = true;
};

window.togglePause = function togglePause() {
  let cameraElement = document.getElementById("camera-element");
  let pausePlayElement = document.getElementById("pause-play");
  let saveImageElement = document.getElementById("save-image");

  if (playing) {
    saveImageElement.removeAttribute("disabled");
    pausePlayElement.src = playImage;
    cameraElement.pause();
    playing = false;
  } else {
    saveImageElement.setAttribute("disabled", "true");
    pausePlayElement.src = pauseImage;
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

window.save = async function save(location) {
  const ll = ranger._latlng;

  let popupContainer = document.createElement("div");
  popupContainer.classList.add("popup-container");

  let canvas = document.createElement("canvas");
  popupContainer.appendChild(canvas);

  let locationParagraph = document.createElement("p");
  locationParagraph.classList.add("popup-location-text");
  locationParagraph.innerHTML = `${ll.lat}, ${ll.lng}`;

  popupContainer.appendChild(locationParagraph);

  canvas.classList.add("image-popup");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  canvas
    .getContext("2d")
    .drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

  const markerPopup = L.popup().setContent(popupContainer);
  L.marker([ll.lat, ll.lng]).bindPopup(markerPopup).addTo(map);

  closeCamera();
};
