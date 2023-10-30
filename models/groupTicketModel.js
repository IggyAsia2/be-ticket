const mongoose = require("mongoose");
const slugify = require("slugify");

const groupTicketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Group Ticket must have a name"],
    },
    slug: String,
    bigTicket: {
      type: mongoose.Schema.ObjectId,
      ref: "bigTicket",
      required: [true, "A Group Ticket must belong to a Big Ticket"],
      select: false,
    },
    sku: {
      type: String,
      unique: true,
      required: [true, "A  Group Ticket must have a sku"],
    },
    unit: {
      type: String,
      required: [true, "A Group ticket must have an unit"],
      enum: ["Adult", "Child", "Senior"],
      default: "Adult",
    },
    stock: {
      type: Number,
      required: [true, "A Group Ticket must have a stock"],
    },
    price: {
      type: Number,
      required: [true, "A Group Ticket must have a price"],
    },
  },
  {
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
    versionKey: false,
    timestamps: true,
  }
);

groupTicketSchema.virtual("tickets", {
  ref: "ticket",
  foreignField: "groupTicket",
  localField: "_id",
});

// Query Middleware
groupTicketSchema.pre(/^find/, function (next) {
  // All string start with find
  this.populate("bigTicket", "name");
  // this.populate({
  //   path: "arrivals.product",
  //   select: "-__v",
  // });
  next();
});

groupTicketSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const GroupTicket = mongoose.model("groupTicket", groupTicketSchema);

module.exports = GroupTicket;
