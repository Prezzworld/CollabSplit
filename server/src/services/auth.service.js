const bcrypt = require("bcryptjs")
const {createUser} = require("../repositories/user.repository")

const signup = async ({ name, email, phone, password }) => {
  const passwordHash = await bcrypt.hash(password, 10)
  try {
    const user = await createUser({name, email, phone, passwordHash})
    return user
  } catch (err) {
    if(err.code === "23505") {
      const duplicateError = new Error("Email already exists")
      duplicateError.statusCode = 409
      throw duplicateError
    }
    throw err
  }
}

module.exports = {signup}