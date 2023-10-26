const mongoose = require("mongoose");
const slugify = require("slugify");

const groupTicketSchema = new mongoose.Schema(
  {
    groupTicket: {
      type: String,
      required: [true, "A Group Ticket must have a name"],
    },
    slug: String,
    bigTicketId: {
      type: mongoose.Schema.ObjectId,
      ref: "bigTicket",
      required: [true, "A Group Ticket must belong to a Big Ticket"],
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
  foreignField: "groupTicketId",
  localField: "_id",
});

groupTicketSchema.pre("save", function (next) {
  this.slug = slugify(this.groupTicket, { lower: true });
  next();
});

const GroupTicket = mongoose.model("groupTicket", groupTicketSchema);

module.exports = GroupTicket;
