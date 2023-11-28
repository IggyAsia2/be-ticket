const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    serial: {
      type: String,
      // unique: true,
      index: true,
      required: [true, "A Ticket must have a serial"],
    },
    name: {
      type: String,
      required: [true, "A Ticket must have a name"],
    },
    groupTicket: {
      type: mongoose.Schema.ObjectId,
      ref: "groupTicket",
      required: [true, "A Ticket must belong to a Group Ticket"],
      index: true,
    },
    purchaseId: {
      type: String,
      required: [true, "A Ticket must have a purchaseId"],
    },
    activatedDate: {
      type: Date,
      required: [true, "A Ticket must have have an Activated Date"],
    },
    expiredDate: {
      type: Date,
      required: [true, "A Ticket must have have an Expired Date"],
    },
    issuedDate: {
      type: Date,
      // required: [true, "A Ticket must have have an Issued Date"],
    },
    state: {
      type: String,
      enum: ["Delivered", "Pending"],
      required: [true, "A Ticket must have a state"],
      default: "Pending",
    },
    importUser: {
      type: String,
      required: [true, "A Ticket must have an Import User"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      // if you want to hide
    },
  },
  {
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
    versionKey: false,
  }
);

TicketSchema.index({ serial: 1, groupTicket: 1 }, { unique: true });

// Query Middleware
TicketSchema.pre(/^find/, function (next) {
  // All string start with find
  this.populate("groupTicket", ["name", "sku", "unit"]);
  next();
});

// Aggregation Middleware

const Ticket = mongoose.model("ticket", TicketSchema);

module.exports = Ticket;
