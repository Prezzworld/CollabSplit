const { z } = require("zod");

const signupSchema = z.object({
  name: z.string().trim().min(2).max(255),
  email: z
    .string()
    .trim()
    .email()
    .transform((v) => v.toLowerCase()),
  phone: z.string().trim().min(4).max(30).optional(),
  password: z.string().min(8).max(72),
});

module.exports = { signupSchema };