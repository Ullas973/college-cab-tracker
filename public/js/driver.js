const socket = io();
const sendBtn = document.getElementById("sendLocationBtn");
const statusText = document.getElementById("statusText");
const latSpan = document.getElementById("lat");
const lngSpan = document.getElementById("lng");

let watchId = null;

sendBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    statusText.textContent = "Geolocation not supported by your browser.";
    return;
  }

 watchId = navigator.geolocation.watchPosition(
   (position) => {
     const coords = {
       lat: position.coords.latitude,
       lng: position.coords.longitude,
     };
     latSpan.textContent = coords.lat.toFixed(6); // prettier
     lngSpan.textContent = coords.lng.toFixed(6);
     socket.emit("driverLocation", coords);
     statusText.textContent = "You have started sharing your location!";
   },
   (err) => {
     console.error(err);
     if (err.code === 1)
       statusText.textContent = "Permission denied. Please allow location.";
     else if (err.code === 2)
       statusText.textContent = "Position unavailable. Check your GPS.";
     else if (err.code === 3)
       statusText.textContent = "Request timed out. Try again.";
     else statusText.textContent = "Unable to fetch location.";
   },
   { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 } // 20 seconds
 );



  statusText.textContent = "You have started sharing your location!";
  sendBtn.disabled = true;
});
