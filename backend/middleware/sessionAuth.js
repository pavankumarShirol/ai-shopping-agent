module.exports = (req, res, next) => {
  const sessionId = req.headers.authorization;

  if (!sessionId) {
    return res.status(401).json({ message: "Session ID missing" });
  }

  // TEMP validation (later DB-backed)
  if (!sessionId.startsWith("sess_")) {
    return res.status(401).json({ message: "Invalid session" });
  }

  req.sessionId = sessionId;
  next();
};