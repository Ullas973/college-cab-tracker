const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  // JWT can be sent via headers, query, or cookies
  const token = req.headers["authorization"]?.split(" ")[1] || req.query.token;

  if (!token) {
    // Redirect to login instead of sending access denied
    return res.redirect("/login-driver");
  }

  jwt.verify(token, process.env.JWT_SECRET || "supersecret", (err, decoded) => {
    if (err) {
      // Invalid token → redirect to login
      return res.redirect("/login-driver");
    }
    req.driver = decoded; // attach driver info to request
    next();
  });
}

module.exports = authenticateToken;
