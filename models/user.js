const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { handleSaveError } = require("../helpers");

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },

        rank: {
            type: Number,
            required: true,
        },
    },
    { versionKey: false, timestamps: true }
);

userSchema.post("save", handleSaveError);

const add = Joi.object({
    name: Joi.string().required(),
});

const update = Joi.object({
    name: Joi.string(),
    rank: Joi.number(),
});

const schemas = {
    add,
    update,
};

const User = model("user", userSchema);

module.exports = { User, schemas };
