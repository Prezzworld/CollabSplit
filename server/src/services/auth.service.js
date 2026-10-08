const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  createUser,
  findUserByEmail,
} = require("../repositories/user.repository");

const signup = async ({ name, email, phone, password }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await createUser({ name, email, phone, passwordHash });
    return user;
  } catch (err) {
    if (err.code === "23505") {
      const duplicateError = new Error("Email already exists");
      duplicateError.statusCode = 409;
      throw duplicateError;
    }
    throw err;
  }
};

const login = async ({ email, password }) => {
    const userFound = await findUserByEmail(email);
    const invalidError = new Error("Invalid email or password");
    invalidError.statusCode = 401;
    if (!userFound) {
      throw invalidError
    }
    const isPasswordValid = await bcrypt.compare(password, userFound.password_hash);
    if (!isPasswordValid) {
     throw invalidError
    }
    const token = jwt.sign(
      { userId: userFound.id, email: userFound.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    const {password_hash: _, ...user} = userFound
    return {user, token}
};

module.exports = { signup, login };
