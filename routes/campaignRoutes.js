const express = require("express");

const {
  getCampaigns,
  createCampaign,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  searchCampaigns,
} = require("../controllers/campaignController");

const router = express.Router();

router.get("/", getCampaigns);
router.get("/search", searchCampaigns);
router.post("/", createCampaign);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);
router.get("/:id", getCampaignById);

module.exports = router;
