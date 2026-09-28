const express = require("express");

const {
  getCampaigns,
  createCampaign,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  searchCampaigns,
  donateToCampaign,
  getCampaignProgress,
  getCampaignStats,
  getCategoryStats,
} = require("../controllers/campaignController");

const router = express.Router();

router.get("/", getCampaigns);

router.get("/search", searchCampaigns);

router.post("/", createCampaign);

router.post("/:id/donate", donateToCampaign);

router.get("/stats", getCampaignStats);

router.get("/category-stats", getCategoryStats);

router.get("/:id/progress", getCampaignProgress);

router.put("/:id", updateCampaign);

router.delete("/:id", deleteCampaign);

router.get("/:id", getCampaignById);

module.exports = router;
