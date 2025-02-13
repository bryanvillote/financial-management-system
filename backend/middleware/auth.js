const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET; // Ensure this matches your secret

const auth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  const token = authHeader.split(" ")[1]; // bearer token
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. Invalid token format." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; //add user data to the request object
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = auth;
