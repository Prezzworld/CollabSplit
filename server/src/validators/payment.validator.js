const { z } = require("zod");

const initializePaymentSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((v) => v.toLowerCase()),
  amount: z.number().min(100),
});

module.exports = { initializePaymentSchema };
