const { client } = require("../config/db");

const getCampaigns = async (req, res) => {
  try {
    const db = client.db("crowdfunding");

    const { category, sort } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    let sortOption = {};

    if (sort === "goal") {
      sortOption = { goal: 1 };
    }

    if (sort === "goal_desc") {
      sortOption = { goal: -1 };
    }

    const campaigns = await db
      .collection("campaigns")
      .find(filter)
      .sort(sortOption)
      .toArray();

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
    const { title, description, goal, category, image } = req.body;

    if (!title || !description || !goal || !category || !image) {
      return res.status(400).json({
        message: "All campaign fields are required",
      });
    }

    if (Number(goal) <= 0) {
      return res.status(400).json({
        message: "Goal must be greater than 0",
      });
    }

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

const getCampaignById = async (req, res) => {
  try {
    const db = client.db("crowdfunding");
    const { ObjectId } = require("mongodb");

    const campaign = await db.collection("campaigns").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    res.status(200).json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({
      message: "Failed to fetch campaign",
      error: error.message,
    });
  }
};

const updateCampaign = async (req, res) => {
  try {
    const db = client.db("crowdfunding");
    const { ObjectId } = require("mongodb");

    const updates = {
      title: req.body.title,
      description: req.body.description,
      goal: Number(req.body.goal),
      category: req.body.category,
      image: req.body.image,
    };

    const result = await db
      .collection("campaigns")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    res.status(200).json({
      message: "Campaign updated successfully",
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({
      message: "Failed to update campaign",
      error: error.message,
    });
  }
};
const deleteCampaign = async (req, res) => {
  try {
    const db = client.db("crowdfunding");
    const { ObjectId } = require("mongodb");

    const result = await db.collection("campaigns").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    res.status(200).json({
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({
      message: "Failed to delete campaign",
      error: error.message,
    });
  }
};
const searchCampaigns = async (req, res) => {
  try {
    const db = client.db("crowdfunding");

    const { category, title } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (title) {
      filter.title = {
        $regex: title,
        $options: "i",
      };
    }

    const campaigns = await db.collection("campaigns").find(filter).toArray();

    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Error searching campaigns:", error);
    res.status(500).json({
      message: "Failed to search campaigns",
      error: error.message,
    });
  }
};
module.exports = {
  getCampaigns,
  createCampaign,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  searchCampaigns,
};
