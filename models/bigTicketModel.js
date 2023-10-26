const mongoose = require("mongoose");
const slugify = require("slugify");

const bigTicketSchema = new mongoose.Schema(
  {
    bigTicket: {
      type: String,
      required: [true, "A Big ticket must have a name"],
      unique: true,
      trim: true,
      maxlength: [
        40,
        "A Big ticket must have less or equals than 40 characters",
      ],
      minlength: [
        6,
        "A Big ticket must have less or equals than 6 characters",
      ],
    },
    slug: String,
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
    versionKey: false
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
  foreignField: "bigTicketId",
  localField: "_id",
});

bigTicketSchema.pre("save", function (next) {
  this.slug = slugify(this.bigTicket, { lower: true });
  next();
});

// Query Middleware
// bigTicketSchema.pre(/^find/, function (next) {
//   // All string start with find
//   // this.populate({
//   //   path: "arrivals.product",
//   //   select: "-__v",
//   // });
//   next();
// });

bigTicketSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} millisecond`);
  next();
});

// Aggregation Middleware

const BigTicket = mongoose.model("bigTicket", bigTicketSchema);

module.exports = BigTicket;
