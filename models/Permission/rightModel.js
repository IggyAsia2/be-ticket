const mongoose = require("mongoose");

const rightSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "A Right must have a name"],
    },
    method: {
      type: String,
      enum: ["GET", "POST", "PATCH", "DELETE"],
      required: [true, "A Right must have a method"],
    },
    group: {
      type: mongoose.Schema.ObjectId,
      ref: "rightGroup",
      required: [true, "A right must belong to a group"],
    },
  },
  {
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
    versionKey: false
  }
);

// Aggregation Middleware

const Right = mongoose.model("right", rightSchema);

module.exports = Right;
