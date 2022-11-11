const express = require("express");
const { User, schemas } = require("../../models/user");
const { RequestError, ctrlWrapper } = require("../../helpers");
const { validateBody } = require("../../middlewares");

const router = express.Router();

router.get("/", ctrlWrapper(getAll));
router.post("/", validateBody(schemas.add), ctrlWrapper(add));
router.delete("/:id", ctrlWrapper(remove));
router.patch("/:id", validateBody(schemas.update), ctrlWrapper(update));

async function getAll(_, res) {
    const users = await User.find({}, "-createdAt -updatedAt");
    res.json(users.sort((a, b) => a.rank - b.rank));
}

async function add(req, res) {
    const rank = (await User.find().count()) + 1;
    const result = await User.create({ ...req.body, rank });
    res.status(201).json(result);
}

async function remove(req, res) {
    const { id } = req.params;
    const result = await User.findByIdAndRemove(id);
    if (!result) throw RequestError(404, "Not found");
    const rank = result.rank;
    const update = await User.updateMany(
        { rank: { $gte: rank } },
        { $inc: { rank: -1 } }
    );
    res.status(204).json({ message: "user deleted" });
}

async function update(req, res) {
    const { id } = req.params;
    let { rank } = req.body;

    if (rank) {
        const oldRank = (await User.findById(id)).rank;
        const count = await User.find().count();
        if (rank > count) rank = count;
        if (rank < 1) rank = 1;
        if (oldRank > rank) {
            const update = await User.updateMany(
                { rank: { $gte: rank, $lte: oldRank } },
                { $inc: { rank: 1 } }
            );
        } else {
            const update = await User.updateMany(
                { rank: { $gte: oldRank, $lte: rank } },
                { $inc: { rank: -1 } }
            );
        }
    }

    const result = await User.findByIdAndUpdate(
        id,
        { ...req.body, rank },
        {
            new: true,
        }
    );
    if (!result) throw RequestError(404, "Not found");

    res.json(result);
}

module.exports = router;
