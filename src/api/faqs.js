const express = require("express");
const monk = require("monk");

const joi = require("@hapi/joi");

const db = monk(process.env.MONGO_URI);

const faqs = db.get("faqs");

const schema = joi.object({
  question: joi.string().trim().required(),
  answer: joi.string().trim().required(),
  video_url: joi.string().uri(),
});

const router = express.Router();

// read all
router.get("/", async (req, res, next) => {
  try {
    const items = await faqs.find({});
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// read one
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await faqs.findOne({
      _id: id,
    });

    if (!item) return next();
    return res.json(item);
  } catch (error) {
    next(error);
  }
});

// create One
router.post("/", async (req, res, next) => {
  try {
    console.log(req.body);
    const value = await schema.validateAsync(req.body);
    const inserted = await faqs.insert(value);

    res.json(inserted);
  } catch (error) {
    next(error);
  }
});

// update One
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const value = await schema.validateAsync(req.body);

    const item = await faqs.findOne({
      _id: id,
    });

    if (!item) return next();

    await faqs.update(
      {
        _id: id,
      },
      { $set: value }
    );

    return res.json(value);
  } catch (error) {
    next(error);
  }
});

// delete One
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await faqs.remove({ _id: id });
    res.json({
      message: "Success",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
