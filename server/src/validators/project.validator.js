const { z } = require("zod");

const projectSchema = z.object({
  project_name: z.string().trim().min(2).max(255),
  project_description: z.string().trim().min(2).optional(),
});

module.exports = { projectSchema };