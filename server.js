// ------------------------ IMPORTS ------------------------
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const connectDB = require("./database/db"); // DB connection
const Driver = require("./models/Driver"); // driver model
const authenticateToken = require("./middlewares/auth"); // JWT middleware

// ------------------------ LOAD ENV ------------------------
dotenv.config();
connectDB(); // connect to MongoDB Atlas

// ------------------------ INITIALIZE APP ------------------------
const app = express();

// ------------------------ VIEW ENGINE ------------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ------------------------ MIDDLEWARE ------------------------
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------ ROUTES ------------------------

// Landing page
app.get("/", (req, res) => {
  res.render("landing");
});

// Driver login page
app.get("/login-driver", (req, res) => {
  res.render("driverLogin", { error: null });
});

// Driver login POST
app.post("/login-driver", async (req, res) => {
  const { email, password } = req.body;

  try {
    const driver = await Driver.findOne({ email, password }); // simple check, no hashing
    if (!driver) {
      return res.render("driverLogin", { error: "Invalid email or password" });
    }

    // Generate JWT token for the driver
    const token = jwt.sign(
      { id: driver._id, email: driver.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.render("driverDashboard", { token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Driver dashboard (protected with JWT)
app.get("/driver", authenticateToken, (req, res) => {
  res.render("driverDashboard");
});

// Student dashboard (map view)
app.get("/user", (req, res) => {
  res.render("student");
});

// ------------------------ SOCKET.IO ------------------------
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// In-memory storage for driver locations
let drivers = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for user type
  socket.on("userType", (type) => {
    console.log(`User type: ${type} is online with socket ID: ${socket.id}`);

    // If the user is a student, send all current driver locations immediately
    if (type === "student") {
      Object.keys(drivers).forEach((driverId) => {
        socket.emit("updateDriverLocation", {
          id: driverId,
          ...drivers[driverId],
        });
      });
    }
  });

  // Listen for driver location updates
  socket.on("driverLocation", (coords) => {
    drivers[socket.id] = coords;
    io.emit("updateDriverLocation", { id: socket.id, ...coords });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete drivers[socket.id];
    io.emit("removeDriver", socket.id);
  });
});

// ------------------------ SERVER LISTEN ------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server + Socket.IO running on http://localhost:${PORT}`);
});
