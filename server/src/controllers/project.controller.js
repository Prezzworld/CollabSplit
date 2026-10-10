const {projectSchema} = require("../validators/project.validator");
const projectService = require("../services/project.service");

const createProject = async (req, res, next) => {
  try {
    const data = projectSchema.parse(req.body);
    const owner_id = req.user.userId;
    const project = await projectService.createNewProject({...data, owner_id});
    return res.status(201).json({
      success: true,
      data: project,
    })
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Invalid input",
        details: err.issues,
      });
    }
    return next(err)
  }
}

module.exports = {createProject}