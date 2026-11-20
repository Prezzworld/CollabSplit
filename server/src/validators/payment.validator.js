const { z } = require("zod");

const initializePaymentSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((v) => v.toLowerCase()),
  amount: z.number().min(100).max(99999999).refine(v => Math.round(v * 100) / 100 === v, {
    message: "Amount must have at most 2 decimal places",
  }),
});

module.exports = { initializePaymentSchema };
