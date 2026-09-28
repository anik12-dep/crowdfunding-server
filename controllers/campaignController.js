const { client } = require("../config/db");

const getCampaigns = async (req, res) => {
  try {
    const db = client.db("crowdfunding");

    const { category, sort, page = 1, limit = 5 } = req.query;

    const currentPage = Number(page);
    const itemsPerPage = Number(limit);
    const skip = (currentPage - 1) * itemsPerPage;

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
      .skip(skip)
      .limit(itemsPerPage)
      .toArray();

    const totalCampaigns = await db
      .collection("campaigns")
      .countDocuments(filter);

    res.status(200).json({
      currentPage,
      itemsPerPage,
      totalCampaigns,
      totalPages: Math.ceil(totalCampaigns / itemsPerPage),
      campaigns,
    });
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
const donateToCampaign = async (req, res) => {
  try {
    const { ObjectId } = require("mongodb");
    const db = client.db("crowdfunding");

    const { id } = req.params;
    const { amount } = req.body;

    const donationAmount = Number(amount);

    if (!donationAmount || donationAmount <= 0) {
      return res.status(400).json({
        message: "Donation amount must be greater than 0",
      });
    }

    const result = await db.collection("campaigns").updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { raised: donationAmount },
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    const updatedCampaign = await db.collection("campaigns").findOne({
      _id: new ObjectId(id),
    });

    res.status(200).json({
      message: "Donation successful",
      campaign: updatedCampaign,
    });
  } catch (error) {
    console.error("Error processing donation:", error);

    res.status(500).json({
      message: "Failed to process donation",
      error: error.message,
    });
  }
};
const getCampaignProgress = async (req, res) => {
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

    const goal = Number(campaign.goal);
    const raised = Number(campaign.raised);

    const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

    res.status(200).json({
      campaignId: campaign._id,
      title: campaign.title,
      goal,
      raised,
      progress: Number(progress.toFixed(2)),
    });
  } catch (error) {
    console.error("Error getting campaign progress:", error);

    res.status(500).json({
      message: "Failed to get campaign progress",
      error: error.message,
    });
  }
};
const getCampaignStats = async (req, res) => {
  try {
    const db = client.db("crowdfunding");

    const stats = await db
      .collection("campaigns")
      .aggregate([
        {
          $group: {
            _id: null,
            totalCampaigns: { $sum: 1 },
            totalGoal: { $sum: "$goal" },
            totalRaised: { $sum: "$raised" },
            averageGoal: { $avg: "$goal" },
          },
        },
      ])
      .toArray();

    if (stats.length === 0) {
      return res.status(200).json({
        totalCampaigns: 0,
        totalGoal: 0,
        totalRaised: 0,
        averageGoal: 0,
      });
    }

    res.status(200).json({
      totalCampaigns: stats[0].totalCampaigns,
      totalGoal: stats[0].totalGoal,
      totalRaised: stats[0].totalRaised,
      averageGoal: Number(stats[0].averageGoal.toFixed(2)),
    });
  } catch (error) {
    console.error("Error getting campaign stats:", error);

    res.status(500).json({
      message: "Failed to get campaign statistics",
      error: error.message,
    });
  }
};
const getCategoryStats = async (req, res) => {
  try {
    const db = client.db("crowdfunding");

    const stats = await db
      .collection("campaigns")
      .aggregate([
        {
          $group: {
            _id: "$category",
            totalCampaigns: { $sum: 1 },
            totalGoal: { $sum: "$goal" },
            totalRaised: { $sum: "$raised" },
          },
        },
        {
          $sort: {
            totalCampaigns: -1,
          },
        },
      ])
      .toArray();

    const categoryStats = stats.map((item) => ({
      category: item._id,
      totalCampaigns: item.totalCampaigns,
      totalGoal: item.totalGoal,
      totalRaised: item.totalRaised,
    }));

    res.status(200).json(categoryStats);
  } catch (error) {
    console.error("Error getting category statistics:", error);

    res.status(500).json({
      message: "Failed to get category statistics",
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
  donateToCampaign,
  getCampaignProgress,
  getCampaignStats,
  getCategoryStats,
};
