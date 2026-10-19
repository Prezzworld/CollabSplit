const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authorization = req.headers["x-auth-token"];
  if(!authorization) {
    const authError = new Error("Missing token");
    authError.statusCode = 401;
    return next(authError)
  }
  const authTokenSplit = authorization.split(" ");
  const [bearer, token] = authTokenSplit;
  if (bearer.toLowerCase() !== "bearer") {
    const authSchemeError = new Error("Invalid authorization scheme");
    authSchemeError.statusCode = 401;
    return next(authSchemeError);
  }
  if (!token) {
    const authError = new Error("Missing token");
    authError.statusCode = 401;
    return next(authError)
  }
  try {
    const verifyUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verifyUser
    return next()
  } catch (err) {
    const invalidTokenError = new Error("Invalid or expired token");
    invalidTokenError.statusCode = 401;
    return next(invalidTokenError);
  }
};

module.exports = { authenticate };
