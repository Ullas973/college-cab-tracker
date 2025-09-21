const socket = io();

const map = L.map("map").setView([12.524, 76.896], 15);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const driverMarkers = {};
const noDriverText = document.getElementById("noDriverText");
noDriverText.style.display = "block";

// Tell server this client is a student
socket.emit("userType", "student");

// Receive all current driver locations when joining
socket.on("currentDrivers", (drivers) => {
  if (Object.keys(drivers).length === 0) {
    noDriverText.style.display = "block";
  } else {
    noDriverText.style.display = "none";
    for (const id in drivers) {
      const { lat, lng } = drivers[id];
      if (!driverMarkers[id]) {
        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup("Driver").openPopup();
        driverMarkers[id] = marker;
      }
    }
  }
});

socket.on("updateDriverLocation", (data) => {
  const { id, lat, lng } = data;
  noDriverText.style.display = "none";

  if (driverMarkers[id]) {
    driverMarkers[id].setLatLng([lat, lng]);
  } else {
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup("Driver").openPopup();
    driverMarkers[id] = marker;
  }
  map.panTo([lat, lng]);
});

socket.on("removeDriver", (id) => {
  if (driverMarkers[id]) {
    map.removeLayer(driverMarkers[id]);
    delete driverMarkers[id];
  }
  if (Object.keys(driverMarkers).length === 0) {
    noDriverText.style.display = "block";
  }
});
