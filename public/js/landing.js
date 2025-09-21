const socket = io();

document.getElementById("studentBtn").addEventListener("click", () => {
  socket.emit("userType", "student");
  window.location.href = "/user";
});

document.getElementById("driverBtn").addEventListener("click", () => {
  socket.emit("userType", "driver");
  window.location.href = "/login-driver";
});
