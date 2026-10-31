
const User = require("../models/User");

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  bio: user.bio,
  college: user.college,
  teachingSkills: user.teachingSkills,
  learningSkills: user.learningSkills,
});

const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: publicUser(req.user),
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load your profile.",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio, college, teachingSkills, learningSkills } =
      req.body;

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string") {
        return res.status(400).json({
          message: "Name must be text.",
        });
      }

      const cleanName = name.trim();

      if (cleanName.length < 2 || cleanName.length > 60) {
        return res.status(400).json({
          message: "Name must be between 2 and 60 characters.",
        });
      }

      updates.name = cleanName;
    }

    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.length > 500) {
        return res.status(400).json({
          message: "Bio must be text and no longer than 500 characters.",
        });
      }

      updates.bio = bio.trim();
    }

    if (college !== undefined) {
      if (typeof college !== "string" || college.length > 120) {
        return res.status(400).json({
          message: "College must be text and no longer than 120 characters.",
        });
      }

      updates.college = college.trim();
    }

    for (const field of ["teachingSkills", "learningSkills"]) {
      if (req.body[field] !== undefined) {
        const skills = req.body[field];

        if (
          !Array.isArray(skills) ||
          skills.length > 50 ||
          !skills.every(
            (skill) =>
              typeof skill === "string" &&
              skill.trim().length > 0 &&
              skill.trim().length <= 60
          )
        ) {
          return res.status(400).json({
            message: `${field} must contain up to 50 valid skill names.`,
          });
        }

        updates[field] = [
          ...new Set(skills.map((skill) => skill.trim())),
        ];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one valid profile field to update.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update your profile.",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
