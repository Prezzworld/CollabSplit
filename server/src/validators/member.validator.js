const { z } = require("zod");

const memberSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((email) => email.toLowerCase()),
  percentage: z.number().min(0).max(100),
  bank_name: z.string().trim().min(2).max(255).optional(),
  bank_code: z.string().trim().min(2).max(20).optional(),
  account_number: z.string().trim().min(5).max(50).optional(),
  country: z
    .string()
    .trim()
    .length(2)
    .transform((country) => country.toUpperCase()).optional(),
}).refine(data => {
  const providedDetails = ["bank_name", "bank_code", "account_number", "country"].filter(field => data[field] !== undefined).length;
  return providedDetails === 0 || providedDetails === 4;
}, {message: "Provide all bank details or none"});

const updateMemberDetailsSchema = z.object({
  bank_name: z.string().trim().min(2).max(255),
  bank_code: z.string().trim().min(2).max(20),
  account_number: z.string().trim().min(5).max(50),
  country: z
    .string()
    .trim()
    .length(2)
    .transform((country) => country.toUpperCase()),
});

const updatePercentageSchema = z.object({
  percentage: z.number().min(0).max(100),
});

module.exports = { memberSchema, updateMemberDetailsSchema, updatePercentageSchema };
