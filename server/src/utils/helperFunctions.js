const {findProjectById} = require("../repositories/project.repository")

const requireOwner = async (projectId, requesterId) => {
  const project = await findProjectById(projectId);
  if (!project) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }
  if (project.owner_id !== requesterId) {
    const err = new Error("Only the project owner can do this");
    err.statusCode = 403;
    throw err;
  }
  return project;
};

module.exports = {requireOwner}
