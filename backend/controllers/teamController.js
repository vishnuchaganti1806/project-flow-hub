const Team = require("../models/Team");
const createNotification = require("../utils/createNotification");

exports.getAll = async (req, res, next) => {
  try {
    const teams = await Team.find().populate("guideId", "name");
    res.json(teams.map(t => ({ id: t._id, name: t.name, members: t.members, guideId: t.guideId?._id, projectId: t.projectId, createdAt: t.createdAt })));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const team = await Team.create(req.body);
    res.status(201).json({ id: team._id, ...team.toObject() });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Team deleted" });
  } catch (err) { next(err); }
};

exports.assignGuide = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, { guideId: req.body.guideId }, { new: true });
    if (!team) return res.status(404).json({ success: false, message: "Team not found" });
    // Notify team members
    for (const memberId of team.members) {
      await createNotification(memberId, "Guide Assigned", `A guide has been assigned to team "${team.name}".`, "info");
    }
    res.json(team);
  } catch (err) { next(err); }
};
