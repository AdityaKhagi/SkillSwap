
const mongoose = require("mongoose");
const SkillListing = require("../models/SkillListing");

const allowedTypes = ["teach", "learn"];
const allowedLevels = [
  "beginner",
  "intermediate",
  "advanced",
  "all",
];
const allowedModes = ["online", "offline", "both"];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function publicListing(listing) {
  return {
    id: listing._id.toString(),
    user: {
      id: listing.user?._id?.toString(),
      name: listing.user?.name || "SkillSwap member",
      college: listing.user?.college || "",
    },
    type: listing.type,
    title: listing.title,
    category: listing.category,
    description: listing.description,
    level: listing.level,
    mode: listing.mode,
    tags: listing.tags,
    createdAt: listing.createdAt,
  };
}

// GET /api/skills
const getListings = async (req, res) => {
  try {
    const {
      search,
      type,
      category,
      level,
      mode,
      page = 1,
      limit = 12,
    } = req.query;

    const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(
      30,
      Math.max(1, Number.parseInt(limit, 10) || 12)
    );

    const filter = { isActive: true };

    if (type) {
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          message: "Invalid listing type.",
        });
      }

      filter.type = type;
    }

    if (category) {
      filter.category = new RegExp(
        escapeRegex(category.trim()),
        "i"
      );
    }

    if (level) {
      if (!allowedLevels.includes(level)) {
        return res.status(400).json({
          message: "Invalid skill level.",
        });
      }

      filter.level = level;
    }

    if (mode) {
      if (!allowedModes.includes(mode)) {
        return res.status(400).json({
          message: "Invalid learning mode.",
        });
      }

      filter.mode = mode;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(
        escapeRegex(search.trim().slice(0, 80)),
        "i"
      );

      filter.$or = [
        { title: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
      ];
    }

    const [listings, total] = await Promise.all([
      SkillListing.find(filter)
        .populate("user", "name college")
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      SkillListing.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      listings: listings.map(publicListing),
      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get listings error:", error.message);

    return res.status(500).json({
      message: "Unable to load marketplace listings.",
    });
  }
};

// POST /api/skills
const createListing = async (req, res) => {
  try {
    const {
      type,
      title,
      category,
      description,
      level = "all",
      mode = "online",
      tags = [],
    } = req.body;

    if (
      !allowedTypes.includes(type) ||
      typeof title !== "string" ||
      typeof category !== "string" ||
      typeof description !== "string" ||
      !Array.isArray(tags)
    ) {
      return res.status(400).json({
        message: "Please provide valid skill listing details.",
      });
    }

    const cleanTitle = title.trim();
    const cleanCategory = category.trim();
    const cleanDescription = description.trim();

    if (cleanTitle.length < 2 || cleanTitle.length > 80) {
      return res.status(400).json({
        message: "Skill title must be between 2 and 80 characters.",
      });
    }

    if (!cleanCategory || cleanCategory.length > 60) {
      return res.status(400).json({
        message: "Category must be between 1 and 60 characters.",
      });
    }

    if (
      cleanDescription.length < 10 ||
      cleanDescription.length > 1000
    ) {
      return res.status(400).json({
        message: "Description must be between 10 and 1000 characters.",
      });
    }

    if (!allowedLevels.includes(level) || !allowedModes.includes(mode)) {
      return res.status(400).json({
        message: "Invalid skill level or learning mode.",
      });
    }

    const cleanTags = tags.map((tag) =>
      typeof tag === "string" ? tag.trim() : ""
    );

    if (
      cleanTags.length > 10 ||
      cleanTags.some((tag) => !tag || tag.length > 30)
    ) {
      return res.status(400).json({
        message: "Please provide up to 10 valid tags.",
      });
    }

    const listing = await SkillListing.create({
      user: req.user._id,
      type,
      title: cleanTitle,
      category: cleanCategory,
      description: cleanDescription,
      level,
      mode,
      tags: [...new Set(cleanTags.map((tag) => tag.toLowerCase()))],
    });

    const populated = await SkillListing.findById(listing._id)
      .populate("user", "name college")
      .lean();

    return res.status(201).json({
      success: true,
      message: "Skill listing published successfully.",
      listing: publicListing(populated),
    });
  } catch (error) {
    console.error("Create listing error:", error.message);

    return res.status(500).json({
      message: "Unable to publish this skill right now.",
    });
  }
};

// GET /api/skills/mine
const getMyListings = async (req, res) => {
  try {
    const listings = await SkillListing.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      listings: listings.map((listing) => ({
        ...publicListing({
          ...listing,
          user: {
            _id: req.user._id,
            name: req.user.name,
            college: req.user.college,
          },
        }),
      })),
    });
  } catch (error) {
    console.error("Get my listings error:", error.message);

    return res.status(500).json({
      message: "Unable to load your listings.",
    });
  }
};

// PUT /api/skills/:id
const updateListing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid listing ID.",
      });
    }

    const listing = await SkillListing.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found or you do not own it.",
      });
    }

    const allowedFields = [
      "type",
      "title",
      "category",
      "description",
      "level",
      "mode",
      "tags",
      "isActive",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.type !== undefined &&
      !allowedTypes.includes(updates.type)
    ) {
      return res.status(400).json({
        message: "Invalid listing type.",
      });
    }

    if (
      updates.level !== undefined &&
      !allowedLevels.includes(updates.level)
    ) {
      return res.status(400).json({
        message: "Invalid skill level.",
      });
    }

    if (
      updates.mode !== undefined &&
      !allowedModes.includes(updates.mode)
    ) {
      return res.status(400).json({
        message: "Invalid learning mode.",
      });
    }

    for (const field of ["title", "category", "description"]) {
      if (updates[field] !== undefined) {
        if (typeof updates[field] !== "string") {
          return res.status(400).json({
            message: `Invalid ${field}.`,
          });
        }

        updates[field] = updates[field].trim();
      }
    }

    if (
      updates.title !== undefined &&
      (updates.title.length < 2 || updates.title.length > 80)
    ) {
      return res.status(400).json({
        message: "Skill title must be between 2 and 80 characters.",
      });
    }

    if (
      updates.category !== undefined &&
      (updates.category.length < 1 || updates.category.length > 60)
    ) {
      return res.status(400).json({
        message: "Invalid category.",
      });
    }

    if (
      updates.description !== undefined &&
      (updates.description.length < 10 ||
        updates.description.length > 1000)
    ) {
      return res.status(400).json({
        message: "Description must be between 10 and 1000 characters.",
      });
    }

    if (updates.tags !== undefined) {
      if (
        !Array.isArray(updates.tags) ||
        updates.tags.length > 10 ||
        !updates.tags.every(
          (tag) =>
            typeof tag === "string" &&
            tag.trim().length > 0 &&
            tag.trim().length <= 30
        )
      ) {
        return res.status(400).json({
          message: "Please provide up to 10 valid tags.",
        });
      }

      updates.tags = [
        ...new Set(updates.tags.map((tag) => tag.trim().toLowerCase())),
      ];
    }

    if (
      updates.isActive !== undefined &&
      typeof updates.isActive !== "boolean"
    ) {
      return res.status(400).json({
        message: "isActive must be true or false.",
      });
    }

    Object.assign(listing, updates);
    await listing.save();

    const populated = await SkillListing.findById(listing._id)
      .populate("user", "name college")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Listing updated successfully.",
      listing: publicListing(populated),
    });
  } catch (error) {
    console.error("Update listing error:", error.message);

    return res.status(500).json({
      message: "Unable to update listing.",
    });
  }
};

// DELETE /api/skills/:id
const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid listing ID.",
      });
    }

    const listing = await SkillListing.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found or you do not own it.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Listing deleted successfully.",
    });
  } catch (error) {
    console.error("Delete listing error:", error.message);

    return res.status(500).json({
      message: "Unable to delete listing.",
    });
  }
};

// GET /api/skills/matches
// Recommend other users' complementary listings.
const getMatches = async (req, res) => {
  try {
    const myListings = await SkillListing.find({
      user: req.user._id,
      isActive: true,
    }).lean();

    if (myListings.length === 0) {
      return res.status(200).json({
        success: true,
        matches: [],
        message: "Publish a skill listing to discover matches.",
      });
    }

    const myTeachListings = myListings.filter(
      (listing) => listing.type === "teach"
    );

    const myLearnListings = myListings.filter(
      (listing) => listing.type === "learn"
    );

    const otherListings = await SkillListing.find({
      user: { $ne: req.user._id },
      isActive: true,
      $or: [
        ...(myTeachListings.length ? [{ type: "learn" }] : []),
        ...(myLearnListings.length ? [{ type: "teach" }] : []),
      ],
    })
      .populate("user", "name college")
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();

    const normalize = (value) =>
      String(value || "").trim().toLowerCase();

    const matches = [];

    for (const candidate of otherListings) {
      const oppositeMine =
        candidate.type === "learn" ? myTeachListings : myLearnListings;

      let bestMatch = null;

      for (const mine of oppositeMine) {
        const matchedOn = [];

        if (normalize(mine.title) === normalize(candidate.title)) {
          matchedOn.push("skill");
        }

        if (
          normalize(mine.category) &&
          normalize(mine.category) === normalize(candidate.category)
        ) {
          matchedOn.push("category");
        }

        const myTags = new Set((mine.tags || []).map(normalize));
        const commonTags = (candidate.tags || []).filter((tag) =>
          myTags.has(normalize(tag))
        );

        if (commonTags.length) {
          matchedOn.push("tags");
        }

        if (matchedOn.length === 0) continue;

        const score =
          (matchedOn.includes("skill") ? 70 : 0) +
          (matchedOn.includes("category") ? 20 : 0) +
          commonTags.length * 5;

        if (!bestMatch || score > bestMatch.score) {
          bestMatch = {
            score,
            matchedOn,
            yourListingId: mine._id.toString(),
          };
        }
      }

      if (bestMatch) {
        matches.push({
          ...publicListing(candidate),
          matchScore: Math.min(100, bestMatch.score),
          matchedOn: bestMatch.matchedOn,
          yourListingId: bestMatch.yourListingId,
        });
      }
    }

    matches.sort(
      (a, b) =>
        b.matchScore - a.matchScore ||
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json({
      success: true,
      matches: matches.slice(0, 30),
    });
  } catch (error) {
    console.error("Get matches error:", error.message);

    return res.status(500).json({
      message: "Unable to find skill matches.",
    });
  }
};

module.exports = {
  getListings,
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
  getMatches,
};
