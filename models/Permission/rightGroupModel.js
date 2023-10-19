const mongoose = require("mongoose");

const rightGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "A Right must have a name"],
    },
    // rights: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: "Right",
    //   },
    // ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Aggregation Middleware

rightGroupSchema.pre(/^find/, function (next) {
  this.populate({
    path: "rights",
    // select: "-__v",
  });
  next();
});

rightGroupSchema.virtual("rights", {
  ref: "Right",
  foreignField: "group",
  localField: "_id",
});

const RightGroup = mongoose.model("rightgroup", rightGroupSchema);

module.exports = RightGroup;
