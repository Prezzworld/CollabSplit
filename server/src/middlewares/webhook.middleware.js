const crypto = require("crypto");

const verifyPaystackSignature = (req, res, next) => {
  const signature = req.headers["x-paystack-signature"]
  if(!signature) {
    const signatureError = new Error("Missing signature")
    signatureError.statusCode = 401
    return next(signatureError)
  }
  if(!req.rawBody) {
    const reqError = new Error("Missing req.rawBody")
    reqError.statusCode = 400
    return next(reqError)
  }
  const stamp = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(req.rawBody).digest("hex");
  if(signature.length !== stamp.length) {
    const error = new Error("Invalid signature");
    error.statusCode = 401
    return next(error)
  }
  const signatureBuffer = Buffer.from(signature)
  const stampBuffer = Buffer.from(stamp);
  if(signatureBuffer.length !== stampBuffer.length) {
    const error = new Error("Invalid signature");
    error.statusCode = 401;
    return next(error);
  }
  const comparationEqual = crypto.timingSafeEqual(signatureBuffer, stampBuffer);
  if(!comparationEqual) {
    const error = new Error("Invalid signature");
    error.statusCode = 401;
    return next(error)
  }
  return next()
}

module.exports = {verifyPaystackSignature}