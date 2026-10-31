
const express = require("express");

const {
  getListings,
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
  getMatches,
} = require("../controllers/skillController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public marketplace browsing
router.get("/", getListings);

// Authenticated marketplace actions
router.get("/mine", protect, getMyListings);
router.get("/matches", protect, getMatches);
router.post("/", protect, createListing);
router.put("/:id", protect, updateListing);
router.delete("/:id", protect, deleteListing);

module.exports = router;
