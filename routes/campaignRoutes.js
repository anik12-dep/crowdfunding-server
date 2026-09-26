const express = require("express");

const {
  getCampaigns,
  createCampaign,
  getCampaignById,
  updateCampaign,
} = require("../controllers/campaignController");

const router = express.Router();

router.get("/", getCampaigns);
router.post("/", createCampaign);
router.put("/:id", updateCampaign);
router.get("/:id", getCampaignById);

module.exports = router;
