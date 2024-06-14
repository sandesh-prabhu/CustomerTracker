const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    // Auto-incremented ID
    _id: {
      type: Number,
      default: 1,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    linkedId: {
      type: Number,
      ref: "Contact",
      default: null,
      null: true,
    },
    linkPrecedence: {
      type: String,
      enum: ["secondary", "primary"],
      default: "primary",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ContactSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }
  try {
    // set _id to (highest _id that exists) + 1, else set to 1
    const highestId = await this.constructor
      .findOne()
      .sort({ _id: -1 })
      .select("_id");
    this._id = highestId?._id > 0 ? highestId?._id + 1 : 1;
  } catch (error) {
    console.error("Error generating ID:", error);
  }
  next();
});

// Create the Contact model
const ContactModel = mongoose.model("Contact", ContactSchema);
module.exports = ContactModel;
