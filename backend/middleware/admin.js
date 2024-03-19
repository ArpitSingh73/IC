const isAdmin = (req, res, next) => {
  const admin = req.header("admin");
  if (!admin) {
    res.status(401).send({ error: "Not an admin" });
  } else if (admin) {
      next()
    }
    
};


module.exports = isAdmin