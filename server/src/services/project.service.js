const {createProject} = require("../repositories/project.repository")

const createNewProject = async ({project_name, project_description, owner_id}) => {
  const project = await createProject({project_name, project_description, owner_id});
  return project;
}

module.exports = {createNewProject}