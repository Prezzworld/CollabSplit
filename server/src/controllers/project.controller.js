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

const getProjects = async (req, res, next) => {
  try {
    const {userId} = req.user;
    const projects = await projectService.getUserProjects(userId)
    return res.status(200).json({
      success: true,
      data: projects
    })
  } catch (err) {
    return next(err)
  }
}

const getProjectDetails = async (req, res, next) => {
  try {
    const {projectId} = req.params
    const {userId} = req.user
    const projectDetails = await projectService.getProjectInformation({projectId, requesterId: userId})
    return res.status(200).json({
      success: true,
      data: projectDetails
    })
  } catch (err) {
    if(err.code === "22P02") {
      const error = new Error("Invalid Id")
      error.statusCode = 404
      throw error
    }
    return next(err)
  }
}

module.exports = {createProject, getProjects, getProjectDetails}