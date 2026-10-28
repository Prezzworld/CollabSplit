const {
  memberSchema,
  updateMemberDetailsSchema,
  updatePercentageSchema
} = require("../validators/member.validator");
const memberService = require("../services/member.service");

const addMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const requesterId = req.user.userId;
    const memberData = memberSchema.parse(req.body);
    const member = await memberService.addCollaborator({
      projectId,
      requesterId,
      memberData,
    });
    return res.status(201).json({
      success: true,
      data: member,
    });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Invalid input",
        details: err.issues,
      });
    }
    return next(err);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const requesterId = req.user.userId;
    const members = await memberService.getMembers({ projectId, requesterId });
    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (err) {
    return next(err);
  }
};

const updateMemberDetails = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const requesterId = req.user.userId;
    const data = updateMemberDetailsSchema.parse(req.body);
    const updatedMember = await memberService.updateOwnMembership({
      projectId,
      requesterId,
      data,
    });
    return res.status(200).json({
      success: true,
      data: updatedMember,
    });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Invalid input",
        details: err.issues,
      });
    }
    return next(err);
  }
};

const updatePercentage = async (req, res, next) => {
  try {
    const {projectId} = req.params;
    const {userId} = req.params;
    const requesterId = req.user.userId;
    const data = updatePercentageSchema.parse(req.body)
    const updatedPercentage = await memberService.updateMemberPercentage({
      projectId,
      requesterId,
      targetUserId: userId,
      percentage: data.percentage
    })
    return res.status(200).json({
      success: true,
      data: updatedPercentage
    })
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Invalid input",
        details: err.issues,
      });
    }
    return next(err);
  }
}

module.exports = { addMember, getMembers, updateMemberDetails, updatePercentage};
