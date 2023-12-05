const mongoose = require("mongoose");
const slugify = require("slugify");

const bigTicketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Big ticket must have a name"],
      unique: true,
      trim: true,
      maxlength: [
        40,
        "A Big ticket must have less or equals than 40 characters",
      ],
      minlength: [6, "A Big ticket must have less or equals than 6 characters"],
    },
    manual: String,
    note: String,
    logo: String,
    country: String,
    heightNote: {
      type: Array,
      default: ["", "", ""],
    },
    slug: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
  }
);

// bigTicketSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "arrivals",
//   });
//   next();
// });

bigTicketSchema.virtual("groupTickets", {
  ref: "groupTicket",
  foreignField: "bigTicket",
  localField: "_id",
});

bigTicketSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

bigTicketSchema.pre(/^find/, function (next) {
  this.populate("groupTicket", "name");
  next();
});

// Aggregation Middleware

const BigTicket = mongoose.model("bigTicket", bigTicketSchema);

module.exports = BigTicket;
