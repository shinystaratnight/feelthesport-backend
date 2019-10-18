module.exports = (req, res, next) => {
  console.log(req)
  if (req.isAuthenticated()) next();
  else res.status(401).send("Unauthorized");
};
