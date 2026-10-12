const { z } = require("zod");

const memberSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((email) => email.toLowerCase()),
  role: z.enum(["collaborator"]),
  percentage: z.number().min(0).max(100),
  bank_name: z.string().trim().min(2).max(255),
  bank_code: z.string().trim().min(2).max(20),
  account_number: z.string().trim().min(5).max(50),
  country: z
    .string()
    .trim()
    .length(2)
    .transform((country) => country.toUpperCase()),
});

const updateMemberSchema = z.object({
  percentage: z.number().min(0).max(100),
  bank_name: z.string().trim().min(2).max(255),
  bank_code: z.string().trim().min(2).max(20),
  account_number: z.string().trim().min(5).max(50),
  country: z
    .string()
    .trim()
    .length(2)
    .transform((country) => country.toUpperCase()),
});

module.exports = { memberSchema, updateMemberSchema };
