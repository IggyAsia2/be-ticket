const mongoose = require("mongoose");
const slugify = require("slugify");

const TicketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Ticket must have a name"],
    },
    slug: String,
    groupTicketId: {
      type: mongoose.Schema.ObjectId,
      ref: "groupTicket",
      required: [true, "A Ticket must belong to a Group Ticket"],
    },
    serial: {
      type: String,
      unique: true,
      required: [true, "A Ticket must have a serial"]
    },
    code: {
      type: String,
      unique: true,
      required: [true, "A Ticket must have a code"],
    },
    purchaseId:{
      type: String,
      required: [true, "A Ticket must have a purchaseId"],
    },
    activatedDate: {
      type: Date,
      required: [true, "An arrival must have an Activated Date"],
    },
    expiredDate: {
      type: Date,
      required: [true, "An arrival must have an Expired Date"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,  
      // if you want to hide
    },
  },
  {
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
    versionKey: false
  }
);

TicketSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Aggregation Middleware

const Ticket = mongoose.model("ticket", TicketSchema);

module.exports = Ticket;
