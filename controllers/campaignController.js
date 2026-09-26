const { client } = require("../config/db");

const getCampaigns = async (req, res) => {
  try {
    const db = client.db("crowdfunding");
    const campaigns = await db.collection("campaigns").find().toArray();

    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({
      message: "Failed to fetch campaigns",
      error: error.message,
    });
  }
};

const createCampaign = async (req, res) => {
  try {
    const db = client.db("crowdfunding");

    const campaign = {
      title: req.body.title,
      description: req.body.description,
      goal: Number(req.body.goal),
      raised: 0,
      category: req.body.category,
      image: req.body.image,
      createdAt: new Date(),
    };

    const result = await db.collection("campaigns").insertOne(campaign);

    res.status(201).json({
      message: "Campaign created successfully",
      campaignId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({
      message: "Failed to create campaign",
      error: error.message,
    });
  }
};

module.exports = {
  getCampaigns,
  createCampaign,
};
