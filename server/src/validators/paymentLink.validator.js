const {z} = require("zod");

const createPaymentLinkSchema = z.object({
  description: z.string().trim().max(500).optional(),
  suggested_amount: z.number().positive().optional()
})

module.exports = {createPaymentLinkSchema}