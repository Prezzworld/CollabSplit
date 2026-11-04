const pool = require("../config/db")
const {createProject, getProjects, getProjectDetails, updateProjectStatus} = require("../repositories/project.repository")
const {findMembersByProject} = require("../repositories/member.repository")
const { findLinkByProject, updatePaymentLinkStatus } = require("../repositories/paymentLink.repository")
const {requireOwner, projectEditable} = require("../utils/helperFunctions")

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

const updateProjectStat = async ({projectId, status, requesterId}) => {
  const project = await requireOwner(projectId, requesterId);
  if(project.status === "archived") {
    const projectError = new Error("Project is already archived");
    projectError.statusCode = 409;
    throw projectError
  }
  

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const updatedProject = await updateProjectStatus({projectId, status}, client)
    if(!updatedProject) {
      await client.query("ROLLBACK");
      return
    }
    const link = await findLinkByProject(projectId)
    if(link) {
      const updatedLink = await updatePaymentLinkStatus(
        { linkId: link.id, status: "inactive" },
        client,
      );

      if (!updatedLink) {
        await client.query("ROLLBACK");
        return;
      }
    }


     await client.query("COMMIT");
     return updatedProject;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {createNewProject, getUserProjects, getProjectInformation, updateProjectStat}