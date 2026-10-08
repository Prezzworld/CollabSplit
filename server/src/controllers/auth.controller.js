const { signupSchema, loginSchema } = require("../validators/auth.validator");
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

const login = async (req, res, next) => {
  try {
    const loginData = loginSchema.parse(req.body)
    const data = await authService.login(loginData)
    return res.status(200).json({
      success: true,
      data: data.user,
      token: data.token
    })
  } catch (err) {
    if(err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Invalid input",
        details: err.issues
      })
    }
    return next(err)
  }
}

module.exports = { signup, login };
