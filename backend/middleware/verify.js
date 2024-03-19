const jwt = require("jsonwebtoken");
const secret = "qwertyuhgfdsanbvcx";

const verifyUser = async (req, res, next) => {
  const token = req.header("token");

  if (!token) {
   return res.status(401).send({ error: "Invalid token" });
  }
  try {
    const data = jwt.verify(token, secret);
    req.user = data.user;
    next();
  } catch (error) {
   return  res.status(401).send({ error: "Authenticate with valid token" });
  }
};

module.exports = verifyUser;
