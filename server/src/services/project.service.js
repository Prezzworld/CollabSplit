const {createProject, getProjects, getProjectDetails} = require("../repositories/project.repository")
const {findMembersByProject} = require("../repositories/member.repository")
const { findLinkByProject } = require("../repositories/paymentLink.repository")

const createNewProject = async ({project_name, project_description, owner_id}) => {
  const project = await createProject({project_name, project_description, owner_id});
  return project;
}

const getUserProjects = async (userId) => {
  const projects = await getProjects(userId);
  return projects
} 

const getProjectInformation = async ({projectId, requesterId}) => {
  const members = await findMembersByProject(projectId)
  const requester = members.find(m => m.user_id === requesterId)
  if(!requester) {
    const error = new Error("You are not a member of this project");
    error.statusCode = 403;
    throw error;
  }

  const projectDetails = await getProjectDetails(projectId)

  const link = await findLinkByProject(projectId)
  const url = link ? `${process.env.CLIENT_BASE_URL}/pay/${link.token}` : null;
  
  return {
    project: { ...projectDetails },
    userRole: requester.role,
    link: link ? { token: link.token, status: link.status, url } : null,
  };
}

module.exports = {createNewProject, getUserProjects, getProjectInformation}