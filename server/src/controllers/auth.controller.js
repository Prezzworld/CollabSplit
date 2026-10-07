const { signupSchema } = require("../validators/auth.validator");
const authService = require("../services/auth.service");

const signup = async (req, res, next) => {
  try {
    const data = signupSchema.parse(req.body);
    const user = await authService.signup(data);
    return res.status(201).json({
      success: true,
      data: user,
    });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Invalid input",
        details: err.issues,
      });
    }
    return next(err);
  }
};

module.exports = { signup };
