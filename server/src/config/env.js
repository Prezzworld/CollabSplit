require("dotenv").config();
const {z} = require("zod");

const envSchema = z.object({
  POSTGRE_URL: z.string().trim().min(1, "POSTGRE_URL is required"),
  JWT_SECRET: z.string().trim().min(32, "JWT_SECRET is required"),
  CLIENT_BASE_URL: z.string().trim().url("CLIENT_BASE_URL must be a valid URL").min(1, "CLIENT_BASE_URL is required"),
  PAYSTACK_SECRET_KEY: z.string().trim().min(1, "PAYSTACK_SECRET_KEY is required").startsWith("sk_", "PAYSTACK_SECRET_KEY must start with 'sk_'"),
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
})

const parsedEnv = envSchema.safeParse(process.env);

if(!parsedEnv.success) {
  console.error("Invalid environment variables:", z.prettifyError(parsedEnv.error));
  process.exit(1)
}

module.exports = parsedEnv.data;