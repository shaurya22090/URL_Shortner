const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send("auth token missing");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_Secrete_key);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).send("invalid or expired token");
  }
};

module.exports = authMiddleware;
