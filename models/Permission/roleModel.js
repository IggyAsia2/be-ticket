const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "A role must have a name"],
    },
    rights: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "right",
        select: false
      },
    ],
  },
  {
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
    versionKey: false 
  },
);

// roleSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "rights",
//     select: "-__v",
//   });
//   next();
// });

// Aggregation Middleware

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
