const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, default: 1 },
    groupTicket: {
      type: mongoose.Schema.ObjectId,
      ref: "groupTicket",
      required: [true, "A Ticket must belong to a Group Ticket"],
    },
    customerName: {
      type: String,
      required: [true, "An Order must have a name"],
    },
    customerEmail: {
      type: String,
      required: [true, "An Order must have an email "],
    },
    customerPhone: {
      type: String,
      required: [true, "An Order must have a phone number "],
    },
    quantity: {
      type: Number,
      required: [true, "An Order must have a quantity"],
    },
    subTotal: Number,
    paidDate: {
      type: Date,
      required: [true, "An Order must have have a Paid Date"],
    },
    bookDate: {
      type: Date,
      required: [true, "An Order must have have a Book Date"],
    },
    exportUser: {
      type: String,
      required: [true, "An Order must have an Import User"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
    versionKey: false,
  }
);

OrderSchema.pre(/^find/, function (next) {
  // All string start with find
  this.populate("groupTicket", ["name", "sku", "unit", "price"]);
  next();
});
// Aggregation Middleware

const Order = mongoose.model("order", OrderSchema);

module.exports = Order;
