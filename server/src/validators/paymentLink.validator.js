const { z } = require("zod");

const descriptionField = z.string().trim().max(500);
const suggestedAmountField = z.number().positive();

const createPaymentLinkSchema = z.object({
  description: descriptionField.optional(),
  suggested_amount: suggestedAmountField.optional(),
});

const updatePaymentLinkSchema = z
  .object({
    description: descriptionField.nullable().optional(),
    suggested_amount: suggestedAmountField.nullable().optional(),
  })
  .refine(
    (data) =>
      data.description !== undefined || data.suggested_amount !== undefined,
    { message: "Provide at least one field to update" },
  );

const updatePaymentLinkStatusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});

module.exports = { createPaymentLinkSchema, updatePaymentLinkSchema, updatePaymentLinkStatusSchema };
