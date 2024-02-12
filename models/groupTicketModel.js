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
      select: true,
    },
    sku: {
      type: String,
      unique: true,
      required: [true, "A  Group Ticket must have a sku"],
    },
    stt: {
      type: Number,
    },
    unit: {
      type: String,
      required: [true, "A Group ticket must have an unit"],
      enum: ["Adult", "Child", "Elder"],
      default: "Adult",
    },
    stock: {
      type: Number,
      // required: [true, "A Group Ticket must have a stock"],
    },
    price: {
      type: Number,
      required: [true, "A Group Ticket must have a price"],
    },
    discountPrice: Number,
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

groupTicketSchema.pre(/^find/, function (next) {
  this.populate("bigTicket", "name");
  next();
});

groupTicketSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const GroupTicket = mongoose.model("groupTicket", groupTicketSchema);

module.exports = GroupTicket;
