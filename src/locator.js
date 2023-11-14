import cameraImage from "./camera.svg";

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
